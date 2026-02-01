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
import { Label } from '@/components/ui/label';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
      <div className="relative group w-20 h-20 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
        <img
          src={image.url}
          alt={`${image.value}`}
          className="w-full h-full object-cover"
        />
        {/* Drag Handle */}
        <div
          onPointerDown={(e) => dragControls.start(e)}
          className="absolute top-0.5 left-0.5 cursor-grab active:cursor-grabbing touch-none p-0.5 bg-black/50 rounded opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <GripVertical className="w-3 h-3 text-white" />
        </div>
        {/* Delete Button */}
        <button
          onClick={() => onDelete(image.id)}
          className="absolute top-0.5 right-0.5 bg-red-500 text-white p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
        >
          <X className="w-3 h-3" />
        </button>
        {/* Order Badge */}
        <span className="absolute bottom-0.5 right-0.5 bg-black/60 text-white text-xs px-1 rounded">
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
      // Upload all files sequentially
      for (const file of Array.from(files)) {
        await uploadVariantValueImage(productId, variantTypeId, value, file);
      }
      toast.success(`${files.length} imagen(es) subida(s) para ${value}`);
      onImageUploaded();
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast.error(error?.response?.data?.message || 'Error al subir imagen');
    } finally {
      setUploading(false);
      // Reset input
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
    // Update local state immediately
    setLocalImages(newOrder);

    // Build items array with new order
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
      // Restore original order
      setLocalImages(images);
    }
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-slate-200 dark:border-slate-700">
        <CardHeader className="py-2 px-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CardTitle className="text-sm font-medium">{value}</CardTitle>
              <Badge variant="secondary" className="text-xs">
                {localImages.length} {localImages.length === 1 ? 'imagen' : 'imagenes'}
              </Badge>
            </div>
            <div className="flex items-center gap-1">
              {/* Upload Button */}
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
                  className="gap-1 h-7"
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
              {/* Delete All Button */}
              {localImages.length > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-red-500 hover:text-red-600"
                  onClick={onDeleteAll}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="py-2 px-3">
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
                <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg p-4 text-center hover:border-cyan-400 transition-colors">
                  {uploading ? (
                    <Loader2 className="w-6 h-6 mx-auto animate-spin text-slate-400" />
                  ) : (
                    <>
                      <Camera className="w-6 h-6 mx-auto text-slate-400 mb-1" />
                      <p className="text-xs text-slate-500">
                        Click para agregar imagenes
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
                {/* Add More Button */}
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={uploading}
                  />
                  <div className="w-20 h-20 rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center hover:border-cyan-400 transition-colors">
                    {uploading ? (
                      <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                    ) : (
                      <Plus className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                </label>
              </Reorder.Group>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

export function VariantValueImagesManager({
  productId,
  productName,
}: VariantValueImagesManagerProps) {
  const [config, setConfig] = useState<ImageVariantConfig | null>(null);
  const [variantTypes, setVariantTypes] = useState<VariantType[]>([]);
  const [productVariantValues, setProductVariantValues] = useState<
    { variantTypeId: string; value: string }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [changingType, setChangingType] = useState(false);

  // Delete all confirmation
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
      // Extract variant values from the product
      setProductVariantValues(
        (productData.variantValues || []).map((v: any) => ({
          variantTypeId: v.variantTypeId,
          value: v.value,
        }))
      );
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Error al cargar configuracion de imagenes');
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
          ? 'Imagenes por variante desactivadas'
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
      toast.success(`Todas las imagenes de "${deleteAllValue.value}" eliminadas`);
      setDeleteAllValue(null);
      await loadData();
    } catch (error) {
      console.error('Error deleting all images:', error);
      toast.error('Error al eliminar imagenes');
    }
  };

  // Get the values for the selected variant type (from product's variant values)
  const getValuesForSelectedType = (): string[] => {
    if (!config?.imageVariantType) return [];

    const typeId = config.imageVariantType.id;
    const values = productVariantValues
      .filter((v) => v.variantTypeId === typeId)
      .map((v) => v.value);

    // Also include values that have images but might not be in product values
    const imageValues = Object.keys(config.imagesByValue || {});
    const allValues = Array.from(new Set([...values, ...imageValues]));

    return allValues.sort();
  };

  // Get variant types that the product has values for
  const getAvailableVariantTypes = (): VariantType[] => {
    const usedTypeIds = new Set(productVariantValues.map((v) => v.variantTypeId));
    return variantTypes.filter((t) => usedTypeIds.has(t.id));
  };

  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  const availableTypes = getAvailableVariantTypes();

  if (availableTypes.length === 0) {
    return (
      <div className="p-4">
        <div className="text-center py-6 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
          <ImageIcon className="w-8 h-8 mx-auto text-amber-500 mb-2" />
          <p className="text-sm text-amber-700 dark:text-amber-300">
            Este producto no tiene valores de variante configurados
          </p>
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
            Primero agrega valores de variante al producto (ej: Color, Talla)
          </p>
        </div>
      </div>
    );
  }

  const selectedTypeValues = getValuesForSelectedType();

  return (
    <div className="p-4 space-y-4 bg-slate-50 dark:bg-slate-800/30">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Imagenes por Variante
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Sube imagenes especificas para cada valor (ej: fotos para cada color)
            </p>
          </div>
          {config?.totalImages ? (
            <Badge variant="outline">
              {config.totalImages} imagen{config.totalImages !== 1 ? 'es' : ''}
            </Badge>
          ) : null}
        </div>

        {/* Select Variant Type */}
        <div className="flex items-center gap-3">
          <Label className="text-sm whitespace-nowrap">
            Tipo de variante con imagenes:
          </Label>
          <Select
            value={config?.imageVariantType?.id || 'none'}
            onValueChange={handleChangeImageVariantType}
            disabled={changingType}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Seleccionar..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">
                <span className="text-slate-500">Ninguno (desactivar)</span>
              </SelectItem>
              {availableTypes.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {changingType && <Loader2 className="w-4 h-4 animate-spin" />}
        </div>
      </div>

      {/* Images by Value */}
      {config?.imageVariantType && selectedTypeValues.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm text-slate-600 dark:text-slate-400">
            Imagenes por {config.imageVariantType.name}:
          </Label>
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

      {/* No values message */}
      {config?.imageVariantType && selectedTypeValues.length === 0 && (
        <div className="text-center py-6 bg-slate-100 dark:bg-slate-800 rounded-lg">
          <p className="text-sm text-slate-500">
            No hay valores de "{config.imageVariantType.name}" configurados en este
            producto
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
              Eliminar todas las imagenes de "{deleteAllValue?.value}"?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta accion no se puede deshacer. Se eliminaran todas las imagenes
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
