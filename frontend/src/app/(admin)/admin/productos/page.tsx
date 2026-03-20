'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, Reorder } from 'framer-motion';
import { staggerContainer, staggerItem } from '@/lib/utils/animations';
import { toast } from 'sonner';
import {
  Plus,
  Loader2,
  Pencil,
  Trash2,
  Image as ImageIcon,
  Package,
  Search,
  Copy,
  Star,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Layers,
  MoreHorizontal,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
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
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { SEOFields } from '@/components/shared';
import { ProductVariantsManager } from '@/components/admin/ProductVariantsManager';
import { VariantValueImagesManager } from '@/components/admin/VariantValueImagesManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  duplicateProduct,
  uploadProductImages,
  deleteProductImage,
  reorderProductImages,
} from '@/lib/api/products';
import { getCategories } from '@/lib/api/categories';
import { getBrands } from '@/lib/api/brands';
import { getVariantTypes, generateVariantCombinations, type VariantType } from '@/lib/api/variants';
import { getSettings } from '@/lib/api/settings';
import { Upload } from 'lucide-react';
import type { Product, ProductImage, Category, Brand, CreateProductDto, UpdateProductDto, ProductQueryParams } from '@/types';

const productSchema = z.object({
  categoryId: z.string().min(1, 'Selecciona una categoría'),
  brandId: z.string().nullable().optional(),
  name: z.string().min(2, 'Mínimo 2 caracteres').max(100),
  slug: z
    .string()
    .regex(/^[a-z0-9-]*$/, 'Solo letras minúsculas, números y guiones')
    .optional()
    .or(z.literal('')),
  description: z.string().max(2000).nullable().optional(),
  price: z.number().positive('El precio debe ser mayor a 0'),
  salePrice: z.number().positive().nullable().optional(),
  showPrice: z.boolean(),
  stock: z.number().int().min(0).nullable().optional(),
  showStock: z.boolean(),
  stockMessage: z.string().max(100).nullable().optional(),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
  seoTitle: z.string().max(70).nullable().optional(),
  seoDescription: z.string().max(160).nullable().optional(),
  seoKeywords: z.string().max(200).nullable().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export default function ProductosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [variantTypes, setVariantTypes] = useState<VariantType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [uploadingImageId, setUploadingImageId] = useState<string | null>(null);

  // Pagination & Filters
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [brandFilter, setBrandFilter] = useState<string>('all');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [featuredFilter, setFeaturedFilter] = useState<string>('all');

  // Images management
  const [productImages, setProductImages] = useState<ProductImage[]>([]);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [managingImagesProduct, setManagingImagesProduct] = useState<Product | null>(null);

  // Variants management - expanded inline
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);

  // Variant values for the product being created/edited
  const [selectedVariantValues, setSelectedVariantValues] = useState<Record<string, string[]>>({});

  // Discount percentage state for bidirectional sync
  const [discountPercent, setDiscountPercent] = useState<number | null>(null);
  const slugManuallyEdited = useRef(false);

  // Settings-based feature toggle
  const [variantsEnabled, setVariantsEnabled] = useState(true);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      categoryId: '',
      brandId: null,
      name: '',
      slug: '',
      description: '',
      price: 0,
      salePrice: null,
      showPrice: true,
      stock: null,
      showStock: false,
      stockMessage: '',
      isActive: true,
      isFeatured: false,
      seoTitle: '',
      seoDescription: '',
      seoKeywords: '',
    },
  });

  const loadProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      const params: ProductQueryParams = {
        page,
        limit: 10,
        search: search || undefined,
        categoryId: categoryFilter !== 'all' ? categoryFilter : undefined,
        brandId: brandFilter !== 'all' ? brandFilter : undefined,
        isActive: activeFilter !== 'all' ? activeFilter === 'true' : undefined,
        isFeatured: featuredFilter !== 'all' ? featuredFilter === 'true' : undefined,
      };
      const response = await getProducts(params);
      setProducts(response.data);
      setTotalPages(response.meta.totalPages);
      setTotal(response.meta.total);
    } catch (error) {
      console.error(error);
      toast.error('Error al cargar productos');
    } finally {
      setIsLoading(false);
    }
  }, [page, search, categoryFilter, brandFilter, activeFilter, featuredFilter]);

  async function loadCategoriesAndBrandsAndVariantTypes() {
    try {
      const [categoriesData, brandsData, settingsData] = await Promise.all([
        getCategories(),
        getBrands(),
        getSettings(),
      ]);
      setCategories(categoriesData);
      setBrands(brandsData);
      setVariantsEnabled(settingsData.variantsEnabled);

      if (settingsData.variantsEnabled) {
        const variantTypesData = await getVariantTypes();
        setVariantTypes(variantTypesData);
      }
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    loadCategoriesAndBrandsAndVariantTypes();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  function openCreateDialog() {
    setEditingProduct(null);
    slugManuallyEdited.current = false;
    form.reset({
      categoryId: categories[0]?.id || '',
      brandId: null,
      name: '',
      slug: '',
      description: '',
      price: 0,
      salePrice: null,
      showPrice: true,
      stock: null,
      showStock: false,
      stockMessage: '',
      isActive: true,
      isFeatured: false,
      seoTitle: '',
      seoDescription: '',
      seoKeywords: '',
    });
    setSelectedVariantValues({});
    setDiscountPercent(null);
    setIsDialogOpen(true);
  }

  async function openEditDialog(productFromList: Product) {
    try {
      // Fetch full product data to get variantValues
      const product = await getProduct(productFromList.id);
      setEditingProduct(product);
      slugManuallyEdited.current = true;
      form.reset({
        categoryId: product.categoryId,
        brandId: product.brandId || null,
        name: product.name,
        slug: product.slug,
        description: product.description || '',
        price: Number(product.price),
        salePrice: product.salePrice ? Number(product.salePrice) : null,
        showPrice: product.showPrice,
        stock: product.stock,
        showStock: product.showStock,
        stockMessage: product.stockMessage || '',
        isActive: product.isActive,
        isFeatured: product.isFeatured,
        seoTitle: product.seoTitle || '',
        seoDescription: product.seoDescription || '',
        seoKeywords: product.seoKeywords || '',
      });
      // Load existing variant values as arrays (for multi-select)
      const existingValues: Record<string, string[]> = {};
      if (product.variantValues) {
        product.variantValues.forEach((v) => {
          if (!existingValues[v.variantTypeId]) {
            existingValues[v.variantTypeId] = [];
          }
          existingValues[v.variantTypeId].push(v.value);
        });
      }
      setSelectedVariantValues(existingValues);
      // Load discount percent from product
      if (product.salePrice && Number(product.price) > 0) {
        const percent = Math.round(((Number(product.price) - Number(product.salePrice)) / Number(product.price)) * 100);
        setDiscountPercent(percent >= 0 && percent <= 100 ? percent : null);
      } else {
        setDiscountPercent(null);
      }
      setIsDialogOpen(true);
    } catch (error) {
      console.error(error);
      toast.error('Error al cargar producto');
    }
  }

  async function onSubmit(data: ProductFormData) {
    try {
      setIsSaving(true);

      // Build variant values array - flatten all selected values
      const variantValues: { variantTypeId: string; value: string }[] = [];
      Object.entries(selectedVariantValues).forEach(([variantTypeId, values]) => {
        values.forEach(value => {
          variantValues.push({ variantTypeId, value });
        });
      });

      // Use the discountPercent state value
      const discountPercentValue = discountPercent;

      if (editingProduct) {
        const dto: UpdateProductDto = {
          categoryId: data.categoryId,
          brandId: data.brandId || null,
          name: data.name,
          slug: data.slug || undefined,
          description: data.description || null,
          price: data.price,
          salePrice: data.salePrice || null,
          discountPercent: discountPercentValue,
          showPrice: data.showPrice,
          stock: data.stock ?? null,
          showStock: data.showStock,
          stockMessage: data.stockMessage || null,
          isActive: data.isActive,
          isFeatured: data.isFeatured,
          seoTitle: data.seoTitle || null,
          seoDescription: data.seoDescription || null,
          seoKeywords: data.seoKeywords || null,
          variantValues,
        };
        await updateProduct(editingProduct.id, dto);
        // Auto-generate variant combinations if variant values were selected
        if (variantValues.length > 0) {
          try {
            const result = await generateVariantCombinations(editingProduct.id);
            if (result.created > 0) {
              toast.success(`Producto actualizado + ${result.created} combinaciones generadas`);
            } else {
              toast.success('Producto actualizado');
            }
          } catch {
            toast.success('Producto actualizado');
          }
        } else {
          toast.success('Producto actualizado');
        }
      } else {
        const dto: CreateProductDto = {
          categoryId: data.categoryId,
          brandId: data.brandId || null,
          name: data.name,
          slug: data.slug || undefined,
          description: data.description || null,
          price: data.price,
          salePrice: data.salePrice || null,
          discountPercent: discountPercentValue,
          showPrice: data.showPrice,
          stock: data.stock ?? null,
          showStock: data.showStock,
          stockMessage: data.stockMessage || null,
          isActive: data.isActive,
          isFeatured: data.isFeatured,
          seoTitle: data.seoTitle || null,
          seoDescription: data.seoDescription || null,
          seoKeywords: data.seoKeywords || null,
          variantValues,
        };
        const createdProduct = await createProduct(dto);
        // Auto-generate variant combinations if variant values were selected
        if (variantValues.length > 0) {
          try {
            const result = await generateVariantCombinations(createdProduct.id);
            if (result.created > 0) {
              toast.success(`Producto creado + ${result.created} combinaciones generadas`);
            } else {
              toast.success('Producto creado');
            }
          } catch {
            toast.success('Producto creado');
          }
        } else {
          toast.success('Producto creado');
        }
      }

      setIsDialogOpen(false);
      loadProducts();
    } catch (error) {
      console.error(error);
      toast.error('Error al guardar producto');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!deletingProduct) return;

    try {
      await deleteProduct(deletingProduct.id);
      toast.success('Producto eliminado');
      loadProducts();
    } catch (error) {
      console.error(error);
      toast.error('Error al eliminar producto');
    } finally {
      setDeletingProduct(null);
    }
  }

  async function handleDuplicate(product: Product) {
    try {
      await duplicateProduct(product.id);
      toast.success('Producto duplicado');
      loadProducts();
    } catch (error) {
      console.error(error);
      toast.error('Error al duplicar producto');
    }
  }

  function openImagesDialog(product: Product) {
    setManagingImagesProduct(product);
    setProductImages(product.images || []);
    setIsImageDialogOpen(true);
  }

  function toggleProductVariants(productId: string) {
    setExpandedProductId(expandedProductId === productId ? null : productId);
  }

  async function handleImageUpload(files: FileList) {
    if (!managingImagesProduct || files.length === 0) return;

    try {
      setUploadingImageId(managingImagesProduct.id);
      const filesArray = Array.from(files);
      const updated = await uploadProductImages(managingImagesProduct.id, filesArray);
      setProductImages(updated.images || []);
      setManagingImagesProduct(updated);
      toast.success('Imágenes subidas');
      loadProducts();
    } catch (error) {
      console.error(error);
      toast.error('Error al subir imágenes');
    } finally {
      setUploadingImageId(null);
    }
  }

  async function handleImageDelete(imageId: string) {
    if (!managingImagesProduct) return;

    try {
      setUploadingImageId(imageId);
      const updated = await deleteProductImage(managingImagesProduct.id, imageId);
      setProductImages(updated.images || []);
      setManagingImagesProduct(updated);
      toast.success('Imagen eliminada');
      loadProducts();
    } catch (error) {
      console.error(error);
      toast.error('Error al eliminar imagen');
    } finally {
      setUploadingImageId(null);
    }
  }

  async function handleImagesReorder(newOrder: ProductImage[]) {
    if (!managingImagesProduct) return;

    const previousOrder = [...productImages];
    setProductImages(newOrder);

    try {
      const items = newOrder.map((img, index) => ({
        id: img.id,
        order: index,
      }));
      await reorderProductImages(managingImagesProduct.id, items);
      loadProducts();
    } catch (error) {
      console.error(error);
      setProductImages(previousOrder);
      toast.error('Error al reordenar');
    }
  }

  function formatPrice(price: number | string) {
    return `S/ ${Number(price).toFixed(2)}`;
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="container mx-auto py-6 space-y-6"
    >
      {/* Header elegante estilo BETA.pen */}
      <motion.div variants={staggerItem} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">Productos</h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">
            {total} productos en total
          </p>
        </div>
        <Button
          onClick={openCreateDialog}
          className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-lg shadow-cyan-500/25 border-0"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nuevo producto
        </Button>
      </motion.div>

      {/* Filters */}
      <motion.div variants={staggerItem} className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar productos..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>
        <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las categorías</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={brandFilter} onValueChange={(v) => { setBrandFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Marca" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las marcas</SelectItem>
            {brands.map((brand) => (
              <SelectItem key={brand.id} value={brand.id}>{brand.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={activeFilter} onValueChange={(v) => { setActiveFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="true">Activos</SelectItem>
            <SelectItem value="false">Inactivos</SelectItem>
          </SelectContent>
        </Select>
        <Select value={featuredFilter} onValueChange={(v) => { setFeaturedFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Destacado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="true">Destacados</SelectItem>
            <SelectItem value="false">No destacados</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* Products Table */}
      <motion.div variants={staggerItem}>
        {isLoading ? (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead className="text-right">Precio</TableHead>
                  <TableHead className="text-center">Stock</TableHead>
                  <TableHead className="text-center">Estado</TableHead>
                  <TableHead className="text-right w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-10 h-10 rounded-lg" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                    <TableCell className="text-center"><Skeleton className="h-5 w-10 mx-auto rounded-full" /></TableCell>
                    <TableCell className="text-center"><Skeleton className="h-5 w-14 mx-auto rounded-full" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto rounded-md" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        ) : products.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Sin productos</h3>
              <p className="text-muted-foreground mb-4">
                {search || categoryFilter !== 'all' ? 'No se encontraron productos con esos filtros' : 'Crea tu primer producto'}
              </p>
              <Button onClick={openCreateDialog}>
                <Plus className="mr-2 h-4 w-4" />
                Crear producto
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead className="text-right">Precio</TableHead>
                  <TableHead className="text-center">Stock</TableHead>
                  <TableHead className="text-center">Estado</TableHead>
                  <TableHead className="text-right w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => {
                  const isExpanded = expandedProductId === product.id;
                  return (
                    <React.Fragment key={product.id}>
                      <TableRow
                        className={`group hover:bg-muted/50 ${isExpanded ? 'bg-muted/30' : ''}`}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-lg overflow-hidden bg-muted flex-shrink-0 cursor-pointer"
                              onClick={(e) => { e.stopPropagation(); openImagesDialog(product); }}
                            >
                              {product.images && product.images[0] ? (
                                <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <ImageIcon className="h-4 w-4 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <p className="font-medium truncate">{product.name}</p>
                                {product.isFeatured && (
                                  <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground truncate">
                                {product.category?.name || '-'}{product.brand ? ` · ${product.brand.name}` : ''}
                                {variantsEnabled && (product._count?.variants ?? 0) > 0 && (
                                  <span className="ml-1.5 inline-flex items-center gap-0.5 text-[10px] text-cyan-600 dark:text-cyan-400 font-medium">
                                    <Layers className="h-2.5 w-2.5" />
                                    {product._count?.variants}
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div>
                            {product.salePrice ? (
                              <>
                                <p className="font-medium text-green-600">{formatPrice(product.salePrice)}</p>
                                <p className="text-sm text-muted-foreground line-through">{formatPrice(product.price)}</p>
                              </>
                            ) : (
                              <p className="font-medium">{formatPrice(product.price)}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {product.showStock && product.stock !== null ? (
                            <Badge variant={product.stock > 0 ? 'default' : 'destructive'}>
                              {product.stock}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={product.isActive ? 'default' : 'secondary'}>
                            {product.isActive ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            {variantsEnabled && (product._count?.variants ?? 0) > 0 && (
                              <button
                                onClick={() => toggleProductVariants(product.id)}
                                className={`p-1.5 rounded-md transition-colors ${isExpanded ? 'bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
                              >
                                {isExpanded ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </button>
                            )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEditDialog(product)}>
                                <Pencil className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openImagesDialog(product)}>
                                <ImageIcon className="h-4 w-4 mr-2" />
                                Imágenes
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDuplicate(product)}>
                                <Copy className="h-4 w-4 mr-2" />
                                Duplicar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setDeletingProduct(product)}
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                      {/* Expanded Variants Row */}
                      {variantsEnabled && isExpanded && (
                        <TableRow className="!bg-transparent hover:!bg-transparent">
                          <TableCell colSpan={5} className="p-0 border-0">
                            <div className="mx-3 mb-3 rounded-xl border border-neutral-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.02] overflow-hidden shadow-sm">
                              <Tabs defaultValue="variants" className="w-full">
                                <div className="px-5 pt-4 pb-0 flex items-center justify-between">
                                  <TabsList className="h-9 bg-neutral-100 dark:bg-white/[0.06] rounded-lg p-0.5">
                                    <TabsTrigger value="variants" className="text-xs rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-white/[0.1] data-[state=active]:shadow-sm gap-1.5 px-3">
                                      <Layers className="w-3.5 h-3.5" />
                                      Sub-productos
                                      <Badge variant="secondary" className="text-[10px] h-4 px-1 ml-0.5 bg-neutral-200 dark:bg-white/[0.1]">
                                        {product._count?.variants ?? 0}
                                      </Badge>
                                    </TabsTrigger>
                                    <TabsTrigger value="images" className="text-xs rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-white/[0.1] data-[state=active]:shadow-sm gap-1.5 px-3">
                                      <ImageIcon className="w-3.5 h-3.5" />
                                      Imágenes por Variante
                                    </TabsTrigger>
                                  </TabsList>
                                </div>
                                <TabsContent value="variants" className="m-0">
                                  <ProductVariantsManager
                                    productId={product.id}
                                    productName={product.name}
                                    onVariantsChange={loadProducts}
                                  />
                                </TabsContent>
                                <TabsContent value="images" className="m-0">
                                  <VariantValueImagesManager
                                    productId={product.id}
                                    productName={product.name}
                                  />
                                </TabsContent>
                              </Tabs>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        )}
      </motion.div>

      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div variants={staggerItem} className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            Página {page} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </motion.div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-primary/30 hover:scrollbar-thumb-primary/50 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gradient-to-b [&::-webkit-scrollbar-thumb]:from-primary/40 [&::-webkit-scrollbar-thumb]:to-primary/20 [&::-webkit-scrollbar-thumb]:rounded-full">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? 'Editar producto' : 'Nuevo producto'}
            </DialogTitle>
            <DialogDescription>
              {editingProduct
                ? 'Modifica los datos del producto'
                : 'Crea un nuevo producto para tu catálogo'}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="general">Producto</TabsTrigger>
                  <TabsTrigger value="seo">SEO</TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoría</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona categoría" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="brandId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Marca (opcional)</FormLabel>
                      <Select
                        onValueChange={(v) => field.onChange(v === 'none' ? null : v)}
                        value={field.value || 'none'}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sin marca" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">Sin marca</SelectItem>
                          {brands.map((brand) => (
                            <SelectItem key={brand.id} value={brand.id}>{brand.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="iPhone 15 Pro"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          if (!slugManuallyEdited.current) {
                            form.setValue('slug', generateSlug(e.target.value));
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug (URL)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="iphone-15-pro"
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => {
                          field.onChange(e);
                          slugManuallyEdited.current = e.target.value !== '';
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      Se genera del nombre. Edítalo si quieres personalizarlo.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe el producto..."
                        className="min-h-[100px]"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Precio</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="99.99"
                          {...field}
                          value={field.value || ''}
                          onChange={(e) => {
                            const newPrice = e.target.value ? Number(e.target.value) : 0;
                            field.onChange(newPrice);
                            // Recalculate salePrice if discount percent is set
                            if (discountPercent && newPrice > 0) {
                              const newSalePrice = newPrice * (1 - discountPercent / 100);
                              form.setValue('salePrice', Math.round(newSalePrice * 100) / 100);
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="salePrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Precio de oferta</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="79.99"
                            {...field}
                            value={field.value || ''}
                            onChange={(e) => {
                              const newSalePrice = e.target.value ? Number(e.target.value) : null;
                              field.onChange(newSalePrice);
                              // Calculate discount percent from salePrice
                              const price = form.getValues('price');
                              if (newSalePrice && price > 0) {
                                const percent = Math.round(((price - newSalePrice) / price) * 100);
                                setDiscountPercent(percent >= 0 && percent <= 100 ? percent : null);
                              } else {
                                setDiscountPercent(null);
                              }
                            }}
                          />
                        </FormControl>
                        <FormDescription>Deja vacío si no hay oferta</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-2">
                    <label className="text-sm font-medium">% Descuento</label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      placeholder="10"
                      value={discountPercent ?? ''}
                      onChange={(e) => {
                        const percent = e.target.value ? Number(e.target.value) : null;
                        setDiscountPercent(percent);
                        // Calculate salePrice from discount percent
                        const price = form.getValues('price');
                        if (percent !== null && price > 0) {
                          const newSalePrice = price * (1 - percent / 100);
                          form.setValue('salePrice', Math.round(newSalePrice * 100) / 100);
                        } else if (percent === null || percent === 0) {
                          form.setValue('salePrice', null);
                        }
                      }}
                    />
                    <p className="text-xs text-muted-foreground">
                      Se sincroniza con el precio de oferta
                    </p>
                  </div>
                </div>
              </div>

              <FormField
                control={form.control}
                name="showPrice"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Mostrar precio</FormLabel>
                      <FormDescription>
                        Visible en el catálogo público
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          placeholder="100"
                          {...field}
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="stockMessage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mensaje de stock</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Últimas unidades"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="showStock"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Mostrar stock</FormLabel>
                      <FormDescription>
                        Muestra la cantidad disponible
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Activo</FormLabel>
                        <FormDescription>
                          Visible en catálogo
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isFeatured"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Destacado</FormLabel>
                        <FormDescription>
                          Aparece en inicio
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              {/* Variant Types Section - Multi-select with checkboxes */}
              {variantsEnabled && variantTypes.length > 0 && (
                <div className="space-y-4 rounded-lg border p-4">
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-muted-foreground" />
                    <h4 className="font-medium">Atributos / Variantes</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Selecciona los atributos disponibles para este producto. Las combinaciones se crean automáticamente.
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    {variantTypes.map((type) => (
                      <div key={type.id} className="space-y-2">
                        <label className="text-sm font-medium">{type.name}</label>
                        <div className="border rounded-md p-3 space-y-2 max-h-48 overflow-y-auto">
                          {type.values?.map((val) => (
                            <div key={val.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={`${type.id}-${val.value}`}
                                checked={(selectedVariantValues[type.id] || []).includes(val.value)}
                                onCheckedChange={(checked) => {
                                  setSelectedVariantValues((prev) => {
                                    const current = prev[type.id] || [];
                                    if (checked) {
                                      return { ...prev, [type.id]: [...current, val.value] };
                                    } else {
                                      return { ...prev, [type.id]: current.filter(v => v !== val.value) };
                                    }
                                  });
                                }}
                              />
                              <label
                                htmlFor={`${type.id}-${val.value}`}
                                className="text-sm cursor-pointer"
                              >
                                {val.value}
                              </label>
                            </div>
                          ))}
                        </div>
                        {(selectedVariantValues[type.id]?.length || 0) > 0 && (
                          <p className="text-xs text-muted-foreground">
                            {selectedVariantValues[type.id].length} seleccionado(s)
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

                </TabsContent>

                <TabsContent value="seo" className="space-y-4 mt-4">
                  <SEOFields form={form} showCard={false} />
                </TabsContent>
              </Tabs>

              <DialogFooter className="gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingProduct ? 'Guardar' : 'Crear'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Images Dialog - Mejorado */}
      <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-lg">Imágenes del producto</DialogTitle>
                <DialogDescription>
                  {managingImagesProduct?.name}
                  {productImages.length > 0 && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-400">
                      {productImages.length} {productImages.length === 1 ? 'imagen' : 'imágenes'}
                    </span>
                  )}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-5">
            {/* Upload zone mejorada */}
            <div className="border-2 border-dashed border-neutral-300 dark:border-white/[0.15] rounded-2xl p-8 text-center hover:border-cyan-400 dark:hover:border-cyan-500/50 transition-colors duration-300 bg-neutral-50/50 dark:bg-white/[0.02]">
              <input
                type="file"
                id="product-images"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) handleImageUpload(e.target.files);
                  e.target.value = '';
                }}
              />
              <label
                htmlFor="product-images"
                className="cursor-pointer flex flex-col items-center gap-3"
              >
                {uploadingImageId === managingImagesProduct?.id ? (
                  <div className="w-14 h-14 rounded-full bg-cyan-50 dark:bg-cyan-500/10 flex items-center justify-center">
                    <Loader2 className="h-7 w-7 animate-spin text-cyan-500" />
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-full bg-cyan-50 dark:bg-cyan-500/10 flex items-center justify-center">
                    <Upload className="h-7 w-7 text-cyan-500" />
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Arrastra imágenes aquí o haz clic
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                    PNG, JPG, WEBP (máx 5MB)
                  </p>
                </div>
              </label>
            </div>

            {/* Images Grid mejorado */}
            {productImages.length > 0 && (
              <Reorder.Group
                axis="x"
                values={productImages}
                onReorder={handleImagesReorder}
                className="flex flex-wrap gap-3"
              >
                {productImages.map((image) => (
                  <Reorder.Item
                    key={image.id}
                    value={image}
                    className="relative group cursor-grab active:cursor-grabbing"
                  >
                    <div className="w-32 h-32 rounded-xl overflow-hidden border-2 border-neutral-200 dark:border-white/[0.08] hover:border-cyan-300 dark:hover:border-cyan-500/30 transition-colors">
                      <img
                        src={image.url}
                        alt="Product"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center rounded-xl backdrop-blur-[2px]">
                      <Button
                        variant="destructive"
                        size="icon"
                        className="h-9 w-9 bg-red-500/90 hover:bg-red-600 border-0 shadow-lg"
                        onClick={() => handleImageDelete(image.id)}
                        disabled={uploadingImageId === image.id}
                      >
                        {uploadingImageId === image.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {image.order === 0 && (
                      <Badge className="absolute -top-2 -left-2 text-[10px] bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-0 shadow-md">
                        Principal
                      </Badge>
                    )}
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            )}

            {/* Empty state mejorado */}
            {productImages.length === 0 && (
              <div className="flex flex-col items-center py-10">
                <div className="w-16 h-16 rounded-full bg-neutral-100 dark:bg-white/[0.05] flex items-center justify-center mb-4">
                  <ImageIcon className="h-8 w-8 text-neutral-400 dark:text-neutral-500" />
                </div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 text-center">
                  No hay imágenes aún
                </p>
                <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
                  Sube la primera imagen del producto
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsImageDialogOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deletingProduct}
        onOpenChange={() => setDeletingProduct(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar producto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará el producto
              &quot;{deletingProduct?.name}&quot; y todas sus imágenes permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </motion.div>
  );
}
