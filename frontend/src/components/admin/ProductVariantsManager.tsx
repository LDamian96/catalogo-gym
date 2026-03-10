'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Reorder, useDragControls } from 'framer-motion';
import {
  Plus,
  Trash2,
  ImageIcon,
  Loader2,
  X,
  GripVertical,
  Sparkles,
  Trash,
  Upload,
  Check,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Card, CardContent } from '@/components/ui/card';

import {
  getProductVariants,
  createProductVariant,
  updateProductVariant,
  deleteProductVariant,
  uploadProductVariantImage,
  deleteProductVariantImage,
  reorderProductVariants,
  getVariantTypes,
  deleteAllProductVariants,
  getVariantValueImages,
  type ProductVariant,
  type VariantType,
  type VariantValueImage,
} from '@/lib/api/variants';
import { getProduct } from '@/lib/api/products';
import type { ProductVariantValue as ParentVariantValue } from '@/types';

interface ProductVariantsManagerProps {
  productId: string;
  productName: string;
}

interface ParentProductInfo {
  price: number | null;
  salePrice: number | null;
  stock: number | null;
}

// Debounce hook for auto-save
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

// Componente para cada item draggable con edición inline
function DraggableVariantItem({
  variant,
  parentProduct,
  imagesByVariantValue,
  onUpdate,
  onDelete,
  onUploadImage,
  onDeleteImage,
}: {
  variant: ProductVariant;
  parentProduct: ParentProductInfo;
  imagesByVariantValue: Record<string, VariantValueImage[]>;
  onUpdate: (id: string, data: Partial<ProductVariant>) => Promise<void>;
  onDelete: (id: string) => void;
  onUploadImage: (id: string, file: File) => Promise<void>;
  onDeleteImage: (id: string) => void;
}) {
  const dragControls = useDragControls();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Local state for inline editing
  const [localData, setLocalData] = useState({
    price: variant.price?.toString() || '',
    salePrice: variant.salePrice?.toString() || '',
    stock: variant.stock?.toString() || '',
    sku: variant.sku || '',
    isActive: variant.isActive,
  });

  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle');
  const [uploadingImage, setUploadingImage] = useState(false);

  // Debounced values for auto-save
  const debouncedData = useDebounce(localData, 800);

  // Track if data has been modified
  const hasChanges = useRef(false);

  // Reset local state when variant changes from external source
  useEffect(() => {
    if (!hasChanges.current) {
      setLocalData({
        price: variant.price?.toString() || '',
        salePrice: variant.salePrice?.toString() || '',
        stock: variant.stock?.toString() || '',
        sku: variant.sku || '',
        isActive: variant.isActive,
      });
    }
  }, [variant]);

  // Auto-save when debounced data changes
  useEffect(() => {
    if (!hasChanges.current) return;

    const saveChanges = async () => {
      setSaving(true);
      try {
        await onUpdate(variant.id, {
          price: debouncedData.price ? parseFloat(debouncedData.price) : null,
          salePrice: debouncedData.salePrice ? parseFloat(debouncedData.salePrice) : null,
          stock: debouncedData.stock ? parseInt(debouncedData.stock) : null,
          sku: debouncedData.sku || null,
          isActive: debouncedData.isActive,
        });
        setSaveStatus('saved');
        hasChanges.current = false;
        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch {
        setSaveStatus('error');
        setTimeout(() => setSaveStatus('idle'), 3000);
      } finally {
        setSaving(false);
      }
    };

    saveChanges();
  }, [debouncedData, variant.id, onUpdate]);

  const handleChange = (field: keyof typeof localData, value: string | boolean) => {
    hasChanges.current = true;
    setLocalData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      await onUploadImage(variant.id, file);
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const formatParentPrice = (price: number | null) => {
    if (price === null) return '';
    return `S/ ${price.toFixed(2)}`;
  };

  // Get fallback image from variant value images
  const getFallbackImage = (): string | null => {
    if (variant.image) return null; // No need for fallback
    // Try to find an image from variant value images
    for (const vv of variant.variantValues) {
      const images = imagesByVariantValue[vv.value];
      if (images && images.length > 0) {
        return images[0].url;
      }
    }
    return null;
  };

  const fallbackImage = getFallbackImage();
  const displayImage = variant.image || fallbackImage;

  return (
    <Reorder.Item
      key={variant.id}
      value={variant}
      dragListener={false}
      dragControls={dragControls}
      className="list-none"
    >
      <Card className="border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
        <CardContent className="p-3">
          <div className="flex flex-col gap-3">
            {/* Top Row: Drag, Image, Badges, Status, Delete */}
            <div className="flex items-center gap-3">
              {/* Drag Handle */}
              <div
                onPointerDown={(e) => dragControls.start(e)}
                className="cursor-grab active:cursor-grabbing touch-none p-1 -ml-1 text-slate-400 hover:text-slate-600 self-start mt-2"
              >
                <GripVertical className="w-4 h-4" />
              </div>

              {/* Image with upload */}
              <div className="relative flex-shrink-0">
                {displayImage ? (
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden group">
                    <img
                      src={displayImage}
                      alt={variant.name || 'Variante'}
                      className="w-full h-full object-cover"
                    />
                    {/* Indicator for fallback image (from variant value) */}
                    {!variant.image && fallbackImage && (
                      <div className="absolute bottom-0 left-0 right-0 bg-cyan-500/80 text-white text-[8px] text-center py-0.5 font-medium">
                        Auto
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-white/90 text-slate-700 p-1 rounded"
                        title={variant.image ? "Cambiar imagen" : "Subir imagen propia"}
                      >
                        <Upload className="w-3 h-3" />
                      </button>
                      {variant.image && (
                        <button
                          onClick={() => onDeleteImage(variant.id)}
                          className="bg-red-500 text-white p-1 rounded"
                          title="Eliminar imagen"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    {uploadingImage && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Loader2 className="w-5 h-5 text-white animate-spin" />
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-16 h-16 rounded-lg bg-slate-100 dark:bg-slate-700 flex flex-col items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors border-2 border-dashed border-slate-300 dark:border-slate-500"
                    disabled={uploadingImage}
                  >
                    {uploadingImage ? (
                      <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
                    ) : (
                      <>
                        <ImageIcon className="w-4 h-4 text-slate-400" />
                        <span className="text-[10px] text-slate-400 mt-0.5">Subir</span>
                      </>
                    )}
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              {/* Variant Badges + Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  {variant.variantValues.map((vv) => (
                    <Badge key={vv.id} variant="secondary" className="text-xs font-medium">
                      {vv.variantType.name}: {vv.value}
                    </Badge>
                  ))}
                </div>
                {variant.name && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                    {variant.name}
                  </p>
                )}
              </div>

              {/* Save Status Indicator */}
              <div className="flex items-center gap-2">
                {saving && (
                  <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                )}
                {saveStatus === 'saved' && (
                  <div className="flex items-center gap-1 text-green-600">
                    <Check className="w-4 h-4" />
                    <span className="text-xs">Guardado</span>
                  </div>
                )}
                {saveStatus === 'error' && (
                  <div className="flex items-center gap-1 text-red-500">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-xs">Error</span>
                  </div>
                )}
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-2">
                <Switch
                  checked={localData.isActive}
                  onCheckedChange={(checked) => handleChange('isActive', checked)}
                  className="scale-75"
                />
                <span className="text-xs text-slate-500 w-14">
                  {localData.isActive ? 'Activo' : 'Inactivo'}
                </span>
              </div>

              {/* Delete Button */}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                onClick={() => onDelete(variant.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            {/* Bottom Row: Editable Fields */}
            <div className="grid grid-cols-4 gap-2 ml-7">
              {/* Price */}
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">
                  Precio
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder={parentProduct.price ? formatParentPrice(parentProduct.price) : '-'}
                  value={localData.price}
                  onChange={(e) => handleChange('price', e.target.value)}
                  className="h-8 text-sm"
                />
              </div>

              {/* Sale Price */}
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">
                  Oferta
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder={parentProduct.salePrice ? formatParentPrice(parentProduct.salePrice) : 'Sin oferta'}
                  value={localData.salePrice}
                  onChange={(e) => handleChange('salePrice', e.target.value)}
                  className="h-8 text-sm"
                />
              </div>

              {/* Stock */}
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">
                  Stock
                </label>
                <Input
                  type="number"
                  min="0"
                  placeholder={parentProduct.stock !== null ? `${parentProduct.stock}` : '-'}
                  value={localData.stock}
                  onChange={(e) => handleChange('stock', e.target.value)}
                  className="h-8 text-sm"
                />
              </div>

              {/* SKU */}
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">
                  SKU
                </label>
                <Input
                  placeholder="Código"
                  value={localData.sku}
                  onChange={(e) => handleChange('sku', e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Reorder.Item>
  );
}

export function ProductVariantsManager({ productId, productName }: ProductVariantsManagerProps) {
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [variantTypes, setVariantTypes] = useState<VariantType[]>([]);
  const [parentVariantValues, setParentVariantValues] = useState<ParentVariantValue[]>([]);
  const [imagesByVariantValue, setImagesByVariantValue] = useState<Record<string, VariantValueImage[]>>({});
  const [parentProduct, setParentProduct] = useState<ParentProductInfo>({
    price: null,
    salePrice: null,
    stock: null,
  });
  const [loading, setLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState(false);

  // Modal state (for creating new variants)
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    salePrice: '',
    discountPercent: '',
    stock: '',
    sku: '',
    isActive: true,
    variantValues: {} as Record<string, string>, // variantTypeId -> value (single-select per type)
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Delete confirmation
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Delete all confirmation
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, [productId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [variantsData, typesData, productData, variantValueImagesData] = await Promise.all([
        getProductVariants(productId),
        getVariantTypes(),
        getProduct(productId),
        getVariantValueImages(productId).catch(() => [] as VariantValueImage[]), // Don't fail if no images
      ]);
      setVariants(variantsData);
      setVariantTypes(typesData);
      // Merge variant values from checkboxes AND from existing sub-products
      const directValues = (productData.variantValues || []).map((v: { variantTypeId: string; value: string }) => ({
        variantTypeId: v.variantTypeId,
        value: v.value,
      }));
      const subProductValues: { variantTypeId: string; value: string }[] = [];
      (variantsData || []).forEach((variant: { variantValues?: { variantTypeId?: string; variantType?: { id: string }; value: string }[] }) => {
        (variant.variantValues || []).forEach((v: { variantTypeId?: string; variantType?: { id: string }; value: string }) => {
          subProductValues.push({
            variantTypeId: v.variantTypeId || v.variantType?.id || '',
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
      setParentVariantValues(uniqueValues as ParentVariantValue[]);
      setParentProduct({
        price: productData.price !== null && productData.price !== undefined
          ? Number(productData.price)
          : null,
        salePrice: productData.salePrice !== null && productData.salePrice !== undefined
          ? Number(productData.salePrice)
          : null,
        stock: productData.stock !== null && productData.stock !== undefined
          ? Number(productData.stock)
          : null,
      });

      // Group variant value images by value for easy lookup
      const grouped: Record<string, VariantValueImage[]> = {};
      for (const img of variantValueImagesData) {
        if (!grouped[img.value]) {
          grouped[img.value] = [];
        }
        grouped[img.value].push(img);
      }
      setImagesByVariantValue(grouped);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleReorder = async (newOrder: ProductVariant[]) => {
    // Update local state immediately for responsive UI
    setVariants(newOrder);

    // Build items array with new order
    const items = newOrder.map((variant, index) => ({
      id: variant.id,
      order: index,
    }));

    try {
      await reorderProductVariants(productId, items);
    } catch (error) {
      console.error('Error reordering variants:', error);
      toast.error('Error al reordenar');
      // Reload data to restore original order on error
      await loadData();
    }
  };

  const handleOpenModal = () => {
    // Only for creating new variants - editing is now inline
    setFormData({
      name: '',
      description: '',
      price: '',
      salePrice: '',
      discountPercent: '',
      stock: '',
      sku: '',
      isActive: true,
      variantValues: {}, // Empty - user selects one value per type
    });
    setImageFile(null);
    setShowModal(true);
  };

  // Handler for inline variant updates
  const handleInlineUpdate = useCallback(async (variantId: string, data: Partial<ProductVariant>) => {
    // Optimistically update local state
    setVariants(prev => prev.map(v =>
      v.id === variantId
        ? {
            ...v,
            price: data.price !== undefined ? data.price : v.price,
            salePrice: data.salePrice !== undefined ? data.salePrice : v.salePrice,
            stock: data.stock !== undefined ? data.stock : v.stock,
            sku: data.sku !== undefined ? data.sku : v.sku,
            isActive: data.isActive !== undefined ? data.isActive : v.isActive,
          }
        : v
    ));

    // Call API
    await updateProductVariant(variantId, {
      price: data.price !== undefined ? (data.price as number) : undefined,
      salePrice: data.salePrice !== undefined ? (data.salePrice as number) : undefined,
      stock: data.stock !== undefined ? (data.stock as number) : undefined,
      sku: data.sku !== undefined ? (data.sku as string) : undefined,
      isActive: data.isActive,
    });
  }, []);

  // Handler for inline image upload
  const handleInlineImageUpload = useCallback(async (variantId: string, file: File) => {
    try {
      const updated = await uploadProductVariantImage(variantId, file);
      setVariants(prev => prev.map(v => v.id === variantId ? updated : v));
      toast.success('Imagen subida');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Error al subir imagen');
      throw error;
    }
  }, []);

  // Convert single-select values to array for API
  const flattenVariantValues = (
    selectedValues: Record<string, string>
  ): { variantTypeId: string; value: string }[] => {
    return Object.entries(selectedValues)
      .filter(([, value]) => value) // Only include non-empty values
      .map(([variantTypeId, value]) => ({ variantTypeId, value }));
  };

  // Count how many types have a value selected
  const getSelectedTypesCount = () => {
    return Object.values(formData.variantValues).filter(v => v).length;
  };

  // Get types that the product has values for
  const getAvailableTypes = () => {
    const typeIds = new Set(parentVariantValues.map(pv => pv.variantTypeId));
    return variantTypes.filter(t => typeIds.has(t.id));
  };

  // Get values available for a type (from product's parent values)
  const getValuesForType = (typeId: string) => {
    return parentVariantValues
      .filter(pv => pv.variantTypeId === typeId)
      .map(pv => pv.value);
  };

  // Handle delete all variants
  const handleDeleteAllVariants = async () => {
    setLoadingAction(true);
    try {
      await deleteAllProductVariants(productId);
      toast.success('Todas las variantes eliminadas');
      setVariants([]);
    } catch (error) {
      console.error('Error deleting all variants:', error);
      toast.error('Error al eliminar variantes');
    } finally {
      setLoadingAction(false);
      setShowDeleteAllConfirm(false);
    }
  };

  const handleSave = async () => {
    const availableTypes = getAvailableTypes();
    const selectedCount = getSelectedTypesCount();

    // Check if at least one type is selected
    if (selectedCount === 0) {
      toast.error('Selecciona al menos un valor de variante');
      return;
    }

    // Check if all available types have a value selected (for proper combinations)
    if (selectedCount < availableTypes.length) {
      toast.error(`Selecciona un valor para cada tipo de variante (${availableTypes.length} tipos disponibles)`);
      return;
    }

    setLoadingAction(true);
    try {
      // Flatten all selected values into one array
      const variantValues = flattenVariantValues(formData.variantValues);

      const dto = {
        name: formData.name.trim() || undefined,
        description: formData.description.trim() || undefined,
        price: formData.price ? parseFloat(formData.price) : undefined,
        salePrice: formData.salePrice ? parseFloat(formData.salePrice) : undefined,
        discountPercent: formData.discountPercent ? parseInt(formData.discountPercent) : undefined,
        stock: formData.stock ? parseInt(formData.stock) : undefined,
        sku: formData.sku.trim() || undefined,
        isActive: formData.isActive,
        variantValues,
      };

      // Create ONE sub-product with ALL selected variant values
      const savedVariant = await createProductVariant(productId, dto);
      toast.success('Sub-producto creado');

      // Upload image if provided
      if (imageFile) {
        await uploadProductVariantImage(savedVariant.id, imageFile);
      }

      setShowModal(false);
      await loadData();
    } catch (error: unknown) {
      console.error('Error saving variant:', error);
      const axiosError = error as { response?: { data?: { message?: string | string[] } } };
      const message = axiosError?.response?.data?.message || 'Error al guardar';
      toast.error(Array.isArray(message) ? message[0] : message);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    setLoadingAction(true);
    try {
      await deleteProductVariant(deleteId);
      toast.success('Sub-producto eliminado');
      setDeleteId(null);
      await loadData();
    } catch (error) {
      console.error('Error deleting variant:', error);
      toast.error('Error al eliminar');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleDeleteImage = async (variantId: string) => {
    try {
      await deleteProductVariantImage(variantId);
      toast.success('Imagen eliminada');
      await loadData();
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('Error al eliminar la imagen');
    }
  };

  const availableTypes = getAvailableTypes();
  const expectedCombinations = availableTypes.length > 0
    ? availableTypes.reduce((acc, type) => acc * getValuesForType(type.id).length, 1)
    : 0;

  return (
    <div className="p-4 space-y-4 bg-slate-50 dark:bg-slate-800/30">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Sub-productos de {productName}
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            {variants.length} variante{variants.length !== 1 ? 's' : ''}
            {expectedCombinations > 0 && ` de ${expectedCombinations} combinaciones posibles`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Delete All Button */}
          {variants.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowDeleteAllConfirm(true)}
              className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash className="w-4 h-4" />
              Eliminar Todas
            </Button>
          )}
          {/* Add Manual Button */}
          <Button
            size="sm"
            onClick={() => handleOpenModal()}
            className="gap-2"
            disabled={parentVariantValues.length === 0}
          >
            <Plus className="w-4 h-4" />
            Agregar Manual
          </Button>
        </div>
      </div>

      {/* No variant values warning */}
      {!loading && parentVariantValues.length === 0 && (
        <div className="text-center py-6 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
          <p className="text-sm text-amber-700 dark:text-amber-300">
            Este producto no tiene atributos configurados
          </p>
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
            Edita el producto y selecciona atributos (Talla, Color, Sabor, etc.)
          </p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
        </div>
      )}

      {/* Empty State with Generate hint */}
      {!loading && variants.length === 0 && parentVariantValues.length > 0 && (
        <div className="text-center py-8 bg-white dark:bg-slate-900 rounded-lg border border-dashed">
          <Sparkles className="w-8 h-8 mx-auto text-cyan-500 mb-2" />
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No hay sub-productos configurados
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            Guarda el producto con atributos seleccionados y las combinaciones se crearán automáticamente
          </p>
        </div>
      )}

      {/* Variants List with Drag & Drop */}
      {!loading && variants.length > 0 && (
        <Reorder.Group
          axis="y"
          values={variants}
          onReorder={handleReorder}
          className="space-y-2"
        >
          {variants.map((variant) => (
            <DraggableVariantItem
              key={variant.id}
              variant={variant}
              parentProduct={parentProduct}
              imagesByVariantValue={imagesByVariantValue}
              onUpdate={handleInlineUpdate}
              onDelete={setDeleteId}
              onUploadImage={handleInlineImageUpload}
              onDeleteImage={handleDeleteImage}
            />
          ))}
        </Reorder.Group>
      )}

      {/* Create New Variant Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nuevo Sub-producto</DialogTitle>
            <DialogDescription>
              Los campos vacíos heredan del producto principal. La edición se hace directamente en la lista.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Variant Values Selection - Single select per type */}
            <div className="space-y-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
              <Label className="text-sm font-medium">Combinación de Variante *</Label>
              <p className="text-xs text-slate-500">
                Selecciona UN valor por cada tipo para crear esta combinación
              </p>
              <div className="grid grid-cols-2 gap-3">
                {availableTypes.map((type) => {
                  const valuesForType = getValuesForType(type.id);
                  return (
                    <div key={type.id} className="space-y-2">
                      <Label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                        {type.name} *
                      </Label>
                      <Select
                        value={formData.variantValues[type.id] || ''}
                        onValueChange={(value) => {
                          setFormData((prev) => ({
                            ...prev,
                            variantValues: {
                              ...prev.variantValues,
                              [type.id]: value,
                            },
                          }));
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={`Selecciona ${type.name.toLowerCase()}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {valuesForType.map((value) => (
                            <SelectItem key={value} value={value}>
                              {value}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  );
                })}
              </div>
              {/* Preview of selected combination */}
              {getSelectedTypesCount() > 0 && (
                <div className="mt-3 p-2 bg-green-50 dark:bg-green-900/20 rounded-md">
                  <p className="text-xs font-medium text-green-700 dark:text-green-300 mb-1">
                    Combinación: {getSelectedTypesCount()}/{availableTypes.length} tipos seleccionados
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(formData.variantValues)
                      .filter(([, value]) => value)
                      .map(([typeId, value]) => {
                        const typeName = variantTypes.find(t => t.id === typeId)?.name || '';
                        return (
                          <Badge key={typeId} variant="outline" className="text-xs">
                            {typeName}: {value}
                          </Badge>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="variant-name">Nombre (opcional)</Label>
              <Input
                id="variant-name"
                placeholder="Dejar vacío para heredar del producto"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="variant-description">Descripción (opcional)</Label>
              <Textarea
                id="variant-description"
                placeholder="Dejar vacío para heredar del producto"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
              />
            </div>

            <div className="space-y-3">
              <div>
                <Label htmlFor="variant-price">Precio (S/)</Label>
                <Input
                  id="variant-price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Heredar del producto"
                  value={formData.price}
                  onChange={(e) => {
                    const newPrice = e.target.value;
                    setFormData((prev) => {
                      // Recalculate salePrice if discount percent is set
                      if (prev.discountPercent && newPrice) {
                        const price = parseFloat(newPrice);
                        const discount = parseInt(prev.discountPercent);
                        const newSalePrice = price * (1 - discount / 100);
                        return {
                          ...prev,
                          price: newPrice,
                          salePrice: newSalePrice.toFixed(2),
                        };
                      }
                      return { ...prev, price: newPrice };
                    });
                  }}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="variant-salePrice">Precio oferta (S/)</Label>
                  <Input
                    id="variant-salePrice"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Sin oferta"
                    value={formData.salePrice}
                    onChange={(e) => {
                      const newSalePrice = e.target.value;
                      setFormData((prev) => {
                        // Calculate discount percent from salePrice
                        if (prev.price && newSalePrice) {
                          const price = parseFloat(prev.price);
                          const sale = parseFloat(newSalePrice);
                          if (price > 0) {
                            const percent = Math.round(((price - sale) / price) * 100);
                            return {
                              ...prev,
                              salePrice: newSalePrice,
                              discountPercent: percent >= 0 && percent <= 100 ? percent.toString() : '',
                            };
                          }
                        }
                        return { ...prev, salePrice: newSalePrice, discountPercent: '' };
                      });
                    }}
                  />
                  <p className="text-xs text-slate-500 mt-1">Deja vacío si no hay oferta</p>
                </div>
                <div>
                  <Label htmlFor="variant-discountPercent">% Descuento</Label>
                  <Input
                    id="variant-discountPercent"
                    type="number"
                    min="0"
                    max="100"
                    placeholder="0-100"
                    value={formData.discountPercent}
                    onChange={(e) => {
                      const newPercent = e.target.value;
                      setFormData((prev) => {
                        // Calculate salePrice from discount percent
                        if (prev.price && newPercent) {
                          const price = parseFloat(prev.price);
                          const percent = parseInt(newPercent);
                          if (percent >= 0 && percent <= 100) {
                            const newSalePrice = price * (1 - percent / 100);
                            return {
                              ...prev,
                              discountPercent: newPercent,
                              salePrice: newSalePrice.toFixed(2),
                            };
                          }
                        }
                        if (!newPercent || newPercent === '0') {
                          return { ...prev, discountPercent: '', salePrice: '' };
                        }
                        return { ...prev, discountPercent: newPercent };
                      });
                    }}
                  />
                  <p className="text-xs text-slate-500 mt-1">Se sincroniza con oferta</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="variant-stock">Stock</Label>
                <Input
                  id="variant-stock"
                  type="number"
                  min="0"
                  placeholder="Heredar"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="variant-sku">SKU</Label>
                <Input
                  id="variant-sku"
                  placeholder="Código único"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="variant-image">Imagen (opcional)</Label>
              <Input
                id="variant-image"
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              />
              <p className="text-xs text-slate-500 mt-1">
                También puedes subir imagen después en la lista
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="variant-isActive">Estado</Label>
                <p className="text-xs text-slate-500">
                  Los inactivos no se muestran en el catálogo
                </p>
              </div>
              <Switch
                id="variant-isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={loadingAction}>
              {loadingAction && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Crear Sub-producto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar sub-producto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              {loadingAction && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete All Confirmation */}
      <AlertDialog open={showDeleteAllConfirm} onOpenChange={setShowDeleteAllConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar todas las variantes?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminarán {variants.length} variantes y sus imágenes.
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAllVariants}
              className="bg-red-500 hover:bg-red-600"
              disabled={loadingAction}
            >
              {loadingAction && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Eliminar Todas
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
