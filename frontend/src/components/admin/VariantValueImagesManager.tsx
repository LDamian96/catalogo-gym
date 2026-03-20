'use client';

import { useState, useEffect, useCallback } from 'react';
import { Reorder, useDragControls } from 'framer-motion';
import {
  ImageIcon,
  Loader2,
  X,
  GripVertical,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Camera,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

import {
  getImageVariantConfig,
  uploadVariantValueImage,
  deleteVariantValueImage,
  deleteAllImagesByValue,
  reorderVariantValueImages,
  setImageVariantType,
  getVariantTypes,
  type VariantValueImage,
  type ImageVariantConfig,
  type VariantType,
} from '@/lib/api/variants';
import { getProduct } from '@/lib/api/products';

interface VariantValueImagesManagerProps {
  productId: string;
  productName: string;
}

// Componente para una imagen individual draggable
function DraggableImageItem({
  image,
  onDelete,
}: {
  image: VariantValueImage;
  onDelete: (id: string) => void;
}) {
  const dragControls = useDragControls();

  return (
    <Reorder.Item
      key={image.id}
      value={image}
      dragListener={false}
      dragControls={dragControls}
      className="list-none"
    >
      <div className="relative group w-20 h-20 rounded-xl overflow-hidden border border-neutral-200 dark:border-white/[0.08] bg-neutral-100 dark:bg-white/[0.04] shadow-sm hover:shadow-md transition-shadow">
        <img
          src={image.url}
          alt={`${image.value}`}
          className="w-full h-full object-cover"
        />
        {/* Drag Handle */}
        <div
          onPointerDown={(e) => dragControls.start(e)}
          className="absolute top-1 left-1 cursor-grab active:cursor-grabbing touch-none p-0.5 bg-black/40 backdrop-blur-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <GripVertical className="w-3 h-3 text-white" />
        </div>
        {/* Delete Button */}
        <button
          onClick={() => onDelete(image.id)}
          className="absolute top-1 right-1 bg-red-500/90 backdrop-blur-sm text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
        >
          <X className="w-3 h-3" />
        </button>
        {/* Order Badge */}
        <span className="absolute bottom-1 right-1 bg-black/50 backdrop-blur-sm text-white text-[10px] font-medium px-1.5 py-0.5 rounded-md">
          {image.order + 1}
        </span>
      </div>
    </Reorder.Item>
  );
}

// Componente para un valor de variante y sus imagenes
function VariantValueImageGroup({
  productId,
  variantTypeId,
  value,
  images,
  onImageUploaded,
  onImageDeleted,
  onImagesReordered,
  onDeleteAll,
}: {
  productId: string;
  variantTypeId: string;
  value: string;
  images: VariantValueImage[];
  onImageUploaded: () => void;
  onImageDeleted: () => void;
  onImagesReordered: () => void;
  onDeleteAll: () => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [localImages, setLocalImages] = useState(images);

  // Sync local state with props
  useEffect(() => {
    setLocalImages(images);
  }, [images]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        await uploadVariantValueImage(productId, variantTypeId, value, file);
      }
      toast.success(`${files.length} imagen(es) subida(s) para ${value}`);
      onImageUploaded();
    } catch (error: unknown) {
      console.error('Error uploading image:', error);
      const axiosError = error as { response?: { data?: { message?: string } } };
      toast.error(axiosError?.response?.data?.message || 'Error al subir imagen');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (imageId: string) => {
    try {
      await deleteVariantValueImage(imageId);
      toast.success('Imagen eliminada');
      onImageDeleted();
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('Error al eliminar imagen');
    }
  };

  const handleReorder = async (newOrder: VariantValueImage[]) => {
    setLocalImages(newOrder);
    const items = newOrder.map((img, index) => ({
      id: img.id,
      order: index,
    }));

    try {
      await reorderVariantValueImages(productId, items);
      onImagesReordered();
    } catch (error) {
      console.error('Error reordering images:', error);
      toast.error('Error al reordenar');
      setLocalImages(images);
    }
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="rounded-xl border border-neutral-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.02] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5">
          <div className="flex items-center gap-2.5">
            <CollapsibleTrigger asChild>
              <button className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors">
                {isOpen ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            </CollapsibleTrigger>
            <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">{value}</span>
            <Badge className="text-[10px] font-medium bg-neutral-100 text-neutral-500 dark:bg-white/[0.08] dark:text-neutral-400 border-0 px-2 py-0.5">
              {localImages.length} {localImages.length === 1 ? 'imagen' : 'imágenes'}
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileChange}
                disabled={uploading}
              />
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 h-7 text-xs text-neutral-500 hover:text-cyan-600 dark:hover:text-cyan-400"
                disabled={uploading}
                asChild
              >
                <span>
                  {uploading ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Plus className="w-3 h-3" />
                  )}
                  Agregar
                </span>
              </Button>
            </label>
            {localImages.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                onClick={onDeleteAll}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>

        {/* Content */}
        <CollapsibleContent>
          <div className="px-4 pb-3">
            {localImages.length === 0 ? (
              <label className="cursor-pointer block">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={uploading}
                />
                <div className="border border-dashed border-neutral-200 dark:border-white/[0.1] rounded-xl p-5 text-center hover:border-cyan-400 dark:hover:border-cyan-500/40 transition-colors bg-neutral-50/50 dark:bg-white/[0.01]">
                  {uploading ? (
                    <Loader2 className="w-5 h-5 mx-auto animate-spin text-neutral-400" />
                  ) : (
                    <>
                      <Camera className="w-5 h-5 mx-auto text-neutral-300 dark:text-neutral-600 mb-1.5" />
                      <p className="text-xs text-neutral-400 dark:text-neutral-500">
                        Arrastra o haz clic para agregar imágenes
                      </p>
                    </>
                  )}
                </div>
              </label>
            ) : (
              <Reorder.Group
                axis="x"
                values={localImages}
                onReorder={handleReorder}
                className="flex flex-wrap gap-2"
              >
                {localImages.map((img) => (
                  <DraggableImageItem
                    key={img.id}
                    image={img}
                    onDelete={handleDelete}
                  />
                ))}
                {/* Add More */}
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={uploading}
                  />
                  <div className="w-20 h-20 rounded-xl border border-dashed border-neutral-200 dark:border-white/[0.1] flex items-center justify-center hover:border-cyan-400 dark:hover:border-cyan-500/40 transition-colors bg-neutral-50/50 dark:bg-white/[0.01]">
                    {uploading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-neutral-400" />
                    ) : (
                      <Plus className="w-4 h-4 text-neutral-300 dark:text-neutral-600" />
                    )}
                  </div>
                </label>
              </Reorder.Group>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

export function VariantValueImagesManager({
  productId,
}: VariantValueImagesManagerProps) {
  const [config, setConfig] = useState<ImageVariantConfig | null>(null);
  const [variantTypes, setVariantTypes] = useState<VariantType[]>([]);
  const [productVariantValues, setProductVariantValues] = useState<
    { variantTypeId: string; value: string }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [changingType, setChangingType] = useState(false);

  const [deleteAllValue, setDeleteAllValue] = useState<{
    variantTypeId: string;
    value: string;
  } | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [configData, typesData, productData] = await Promise.all([
        getImageVariantConfig(productId),
        getVariantTypes(),
        getProduct(productId),
      ]);
      setConfig(configData);
      setVariantTypes(typesData);
      const directValues = (productData.variantValues || []).map((v: { variantTypeId: string; value: string }) => ({
        variantTypeId: v.variantTypeId,
        value: v.value,
      }));
      const subProductValues: { variantTypeId: string; value: string }[] = [];
      ((productData as unknown as { variants?: { variantValues?: { variantTypeId: string; value: string }[] }[] }).variants || []).forEach((variant) => {
        (variant.variantValues || []).forEach((v: { variantTypeId: string; value: string }) => {
          subProductValues.push({
            variantTypeId: v.variantTypeId,
            value: v.value,
          });
        });
      });
      const allValues = [...directValues, ...subProductValues];
      const uniqueValues = allValues.filter(
        (v, i, arr) =>
          arr.findIndex(
            (x) => x.variantTypeId === v.variantTypeId && x.value === v.value
          ) === i
      );
      setProductVariantValues(uniqueValues);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Error al cargar configuración de imágenes');
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleChangeImageVariantType = async (variantTypeId: string | null) => {
    setChangingType(true);
    try {
      await setImageVariantType(
        productId,
        variantTypeId === 'none' ? null : variantTypeId
      );
      toast.success(
        variantTypeId === 'none'
          ? 'Imágenes por variante desactivadas'
          : 'Tipo de variante actualizado'
      );
      await loadData();
    } catch (error) {
      console.error('Error changing image variant type:', error);
      toast.error('Error al cambiar tipo de variante');
    } finally {
      setChangingType(false);
    }
  };

  const handleDeleteAllImages = async () => {
    if (!deleteAllValue || !config?.imageVariantType) return;

    try {
      await deleteAllImagesByValue(
        productId,
        config.imageVariantType.id,
        deleteAllValue.value
      );
      toast.success(`Todas las imágenes de "${deleteAllValue.value}" eliminadas`);
      setDeleteAllValue(null);
      await loadData();
    } catch (error) {
      console.error('Error deleting all images:', error);
      toast.error('Error al eliminar imágenes');
    }
  };

  const getValuesForSelectedType = (): string[] => {
    if (!config?.imageVariantType) return [];

    const typeId = config.imageVariantType.id;
    const values = productVariantValues
      .filter((v) => v.variantTypeId === typeId)
      .map((v) => v.value);

    const imageValues = Object.keys(config.imagesByValue || {});
    const allValues = Array.from(new Set([...values, ...imageValues]));

    return allValues.sort();
  };

  const getAvailableVariantTypes = (): VariantType[] => {
    const usedTypeIds = new Set(productVariantValues.map((v) => v.variantTypeId));
    return variantTypes.filter((t) => usedTypeIds.has(t.id));
  };

  if (loading) {
    return (
      <div className="p-5 space-y-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-neutral-200 dark:border-white/[0.08] p-4 animate-pulse">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-4 w-4 bg-neutral-200 dark:bg-white/[0.08] rounded" />
              <div className="h-4 w-20 bg-neutral-200 dark:bg-white/[0.08] rounded" />
              <div className="h-4 w-16 bg-neutral-100 dark:bg-white/[0.04] rounded-full" />
            </div>
            <div className="flex gap-2">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="w-20 h-20 bg-neutral-200 dark:bg-white/[0.08] rounded-xl" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  const availableTypes = getAvailableVariantTypes();

  if (availableTypes.length === 0) {
    return (
      <div className="p-5">
        <div className="text-center py-6 bg-amber-50/50 dark:bg-amber-500/5 rounded-xl border border-amber-200/60 dark:border-amber-500/20">
          <ImageIcon className="w-6 h-6 mx-auto text-amber-400 mb-2" />
          <p className="text-sm text-amber-700 dark:text-amber-300 font-medium">
            Sin atributos configurados
          </p>
          <p className="text-xs text-amber-600/80 dark:text-amber-400/60 mt-1">
            Primero agrega atributos al producto (ej: Color, Talla, Sabor)
          </p>
        </div>
      </div>
    );
  }

  const selectedTypeValues = getValuesForSelectedType();

  return (
    <div className="p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5">
          <h4 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
            Imágenes por atributo
          </h4>
          {config?.totalImages ? (
            <Badge className="text-[10px] font-medium bg-neutral-100 text-neutral-500 dark:bg-white/[0.08] dark:text-neutral-400 border-0 px-2 py-0.5">
              {config.totalImages} imagen{config.totalImages !== 1 ? 'es' : ''}
            </Badge>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={config?.imageVariantType?.id || 'none'}
            onValueChange={handleChangeImageVariantType}
            disabled={changingType}
          >
            <SelectTrigger className="w-44 h-8 text-xs bg-neutral-50 dark:bg-white/[0.04] border-neutral-200 dark:border-white/[0.08]">
              <SelectValue placeholder="Seleccionar atributo..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">
                <span className="text-neutral-400">Desactivado</span>
              </SelectItem>
              {availableTypes.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {changingType && <Loader2 className="w-4 h-4 animate-spin text-cyan-500" />}
        </div>
      </div>

      {/* Hint */}
      {config?.imageVariantType && (
        <p className="text-[11px] text-neutral-400 dark:text-neutral-500 -mt-1">
          Las imágenes se mostrarán al seleccionar cada valor en el catálogo
        </p>
      )}

      {/* Images by Value */}
      {config?.imageVariantType && selectedTypeValues.length > 0 && (
        <div className="space-y-2">
          {selectedTypeValues.map((value) => (
            <VariantValueImageGroup
              key={value}
              productId={productId}
              variantTypeId={config.imageVariantType!.id}
              value={value}
              images={config.imagesByValue?.[value] || []}
              onImageUploaded={loadData}
              onImageDeleted={loadData}
              onImagesReordered={loadData}
              onDeleteAll={() =>
                setDeleteAllValue({
                  variantTypeId: config.imageVariantType!.id,
                  value,
                })
              }
            />
          ))}
        </div>
      )}

      {/* No values */}
      {config?.imageVariantType && selectedTypeValues.length === 0 && (
        <div className="text-center py-6 rounded-xl border border-dashed border-neutral-200 dark:border-white/[0.1] bg-neutral-50/50 dark:bg-white/[0.01]">
          <p className="text-sm text-neutral-400 dark:text-neutral-500">
            No hay valores de &quot;{config.imageVariantType.name}&quot; en este producto
          </p>
        </div>
      )}

      {/* Delete All Confirmation */}
      <AlertDialog
        open={!!deleteAllValue}
        onOpenChange={() => setDeleteAllValue(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              ¿Eliminar todas las imágenes de &quot;{deleteAllValue?.value}&quot;?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminarán todas las imágenes
              asociadas a este valor.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAllImages}
              className="bg-red-500 hover:bg-red-600"
            >
              Eliminar todas
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
