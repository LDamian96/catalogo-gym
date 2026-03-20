'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Plus,
  Loader2,
  Pencil,
  Trash2,
  Image as ImageIcon,
  Gift,
  X,
  Search,
  Package,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SEOFields } from '@/components/shared';
import {
  getCombos,
  createCombo,
  updateCombo,
  deleteCombo,
  uploadComboImage,
  deleteComboImage,
  addComboProduct,
  removeComboProduct,
} from '@/lib/api/combos';
import { getProducts } from '@/lib/api/products';
import { staggerContainer, staggerItem } from '@/lib/utils/animations';
import type { Combo, CreateComboDto, UpdateComboDto, Product } from '@/types';

const comboSchema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres').max(100),
  slug: z
    .string()
    .regex(/^[a-z0-9-]*$/, 'Solo letras minúsculas, números y guiones')
    .optional()
    .or(z.literal('')),
  description: z.string().max(500).nullable().optional(),
  price: z.number().positive('El precio debe ser mayor a 0'),
  salePrice: z.number().positive().nullable().optional(),
  discountPercent: z.number().int().min(0).max(100).nullable().optional(),
  isActive: z.boolean(),
  seoTitle: z.string().max(70).nullable().optional(),
  seoDescription: z.string().max(160).nullable().optional(),
  seoKeywords: z.string().max(200).nullable().optional(),
});

type ComboFormData = z.infer<typeof comboSchema>;

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

export default function CombosPage() {
  const [combos, setCombos] = useState<Combo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCombo, setEditingCombo] = useState<Combo | null>(null);
  const [deletingCombo, setDeletingCombo] = useState<Combo | null>(null);
  const [uploadingImageId, setUploadingImageId] = useState<string | null>(null);
  const slugManuallyEdited = useRef(false);

  // Image file for new combo creation
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);
  const [pendingImagePreview, setPendingImagePreview] = useState<string | null>(null);

  // Product search state
  const [productSearch, setProductSearch] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>();

  const form = useForm<ComboFormData>({
    resolver: zodResolver(comboSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      price: 0,
      salePrice: null,
      discountPercent: null,
      isActive: true,
      seoTitle: '',
      seoDescription: '',
      seoKeywords: '',
    },
  });

  useEffect(() => {
    loadCombos();
  }, []);

  async function loadCombos() {
    try {
      setIsLoading(true);
      const data = await getCombos();
      setCombos(data);
    } catch (error) {
      console.error(error);
      toast.error('Error al cargar combos');
    } finally {
      setIsLoading(false);
    }
  }

  function openCreateDialog() {
    setEditingCombo(null);
    slugManuallyEdited.current = false;
    setPendingImageFile(null);
    setPendingImagePreview(null);
    setProductSearch('');
    setSearchResults([]);
    form.reset({
      name: '',
      slug: '',
      description: '',
      price: 0,
      salePrice: null,
      discountPercent: null,
      isActive: true,
      seoTitle: '',
      seoDescription: '',
      seoKeywords: '',
    });
    setIsDialogOpen(true);
  }

  function openEditDialog(combo: Combo) {
    setEditingCombo(combo);
    slugManuallyEdited.current = true;
    setProductSearch('');
    setSearchResults([]);
    form.reset({
      name: combo.name,
      slug: combo.slug,
      description: combo.description || '',
      price: Number(combo.price),
      salePrice: combo.salePrice ? Number(combo.salePrice) : null,
      discountPercent: combo.discountPercent,
      isActive: combo.isActive,
      seoTitle: combo.seoTitle || '',
      seoDescription: combo.seoDescription || '',
      seoKeywords: combo.seoKeywords || '',
    });
    setIsDialogOpen(true);
  }

  async function onSubmit(data: ComboFormData) {
    try {
      setIsSaving(true);

      if (editingCombo) {
        const dto: UpdateComboDto = {
          name: data.name,
          slug: data.slug || undefined,
          description: data.description || null,
          price: data.price,
          salePrice: data.salePrice ? Number(data.salePrice) : null,
          discountPercent: data.discountPercent ? Number(data.discountPercent) : null,
          isActive: data.isActive,
          seoTitle: data.seoTitle || null,
          seoDescription: data.seoDescription || null,
          seoKeywords: data.seoKeywords || null,
        };
        const updated = await updateCombo(editingCombo.id, dto);
        setCombos((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
        toast.success('Combo actualizado');
      } else {
        const dto: CreateComboDto = {
          name: data.name,
          slug: data.slug || undefined,
          description: data.description || null,
          price: data.price,
          salePrice: data.salePrice ? Number(data.salePrice) : null,
          discountPercent: data.discountPercent ? Number(data.discountPercent) : null,
          isActive: data.isActive,
          seoTitle: data.seoTitle || null,
          seoDescription: data.seoDescription || null,
          seoKeywords: data.seoKeywords || null,
        };
        let created = await createCombo(dto);
        // Upload pending image if selected during creation
        if (pendingImageFile) {
          try {
            created = await uploadComboImage(created.id, pendingImageFile);
          } catch {
            toast.error('Combo creado, pero hubo un error al subir la imagen');
          }
          setPendingImageFile(null);
          setPendingImagePreview(null);
        }
        setCombos((prev) => [...prev, created]);
        toast.success('Combo creado');
      }

      setIsDialogOpen(false);
    } catch (error) {
      console.error(error);
      toast.error('Error al guardar combo');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!deletingCombo) return;
    try {
      await deleteCombo(deletingCombo.id);
      setCombos((prev) => prev.filter((c) => c.id !== deletingCombo.id));
      toast.success('Combo eliminado');
    } catch (error) {
      console.error(error);
      toast.error('Error al eliminar combo');
    } finally {
      setDeletingCombo(null);
    }
  }

  async function handleImageUpload(comboId: string, file: File) {
    try {
      setUploadingImageId(comboId);
      const updated = await uploadComboImage(comboId, file);
      setCombos((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      if (editingCombo?.id === comboId) setEditingCombo(updated);
      toast.success('Imagen actualizada');
    } catch (error) {
      console.error(error);
      toast.error('Error al subir imagen');
    } finally {
      setUploadingImageId(null);
    }
  }

  async function handleImageDelete(comboId: string) {
    try {
      setUploadingImageId(comboId);
      const updated = await deleteComboImage(comboId);
      setCombos((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      if (editingCombo?.id === comboId) setEditingCombo(updated);
      toast.success('Imagen eliminada');
    } catch (error) {
      console.error(error);
      toast.error('Error al eliminar imagen');
    } finally {
      setUploadingImageId(null);
    }
  }

  // Product search with debounce
  function handleProductSearch(query: string) {
    setProductSearch(query);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    searchTimeout.current = setTimeout(async () => {
      try {
        setIsSearching(true);
        const res = await getProducts({ search: query, limit: 10 });
        const products = res.data || res;
        // Filter out products already in combo
        const existingIds = new Set(editingCombo?.comboProducts?.map((cp) => cp.productId) || []);
        setSearchResults(
          (Array.isArray(products) ? products : []).filter((p: Product) => !existingIds.has(p.id))
        );
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);
  }

  async function handleAddProduct(productId: string) {
    if (!editingCombo) return;
    try {
      const updated = await addComboProduct(editingCombo.id, productId);
      setCombos((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      setEditingCombo(updated);
      setProductSearch('');
      setSearchResults([]);
      toast.success('Producto agregado al combo');
    } catch (error) {
      console.error(error);
      toast.error('Error al agregar producto');
    }
  }

  async function handleRemoveProduct(productId: string) {
    if (!editingCombo) return;
    try {
      const updated = await removeComboProduct(editingCombo.id, productId);
      setCombos((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      setEditingCombo(updated);
      toast.success('Producto quitado del combo');
    } catch (error) {
      console.error(error);
      toast.error('Error al quitar producto');
    }
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={staggerItem} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">Combos</h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">
            Administra los combos de tu catálogo
          </p>
        </div>
        <Button
          onClick={openCreateDialog}
          className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-lg shadow-cyan-500/25 border-0"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nuevo combo
        </Button>
      </motion.div>

      {/* Grid de Cards */}
      <motion.div variants={staggerItem}>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
              >
                <div className="bg-white dark:bg-white/[0.03] rounded-2xl border border-neutral-200 dark:border-white/[0.08] overflow-hidden">
                  <Skeleton className="h-32 w-full rounded-none" />
                  <div className="p-4 space-y-3">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-3 w-1/3" />
                    <div className="flex gap-2 pt-1">
                      <Skeleton className="h-8 w-16 rounded-md" />
                      <Skeleton className="h-8 w-16 rounded-md" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : combos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-white/[0.02] rounded-2xl border border-neutral-200 dark:border-white/[0.08]">
            <div className="w-20 h-20 rounded-full bg-cyan-50 dark:bg-cyan-500/10 flex items-center justify-center mb-4">
              <Gift className="h-10 w-10 text-cyan-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-neutral-900 dark:text-white">Sin combos</h3>
            <p className="text-neutral-500 dark:text-neutral-400 mb-6 text-center max-w-sm">
              Crea tu primer combo para ofrecer packs de productos con descuento
            </p>
            <Button
              onClick={openCreateDialog}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
            >
              <Plus className="mr-2 h-4 w-4" />
              Crear combo
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            <AnimatePresence>
              {combos.map((combo, index) => (
                <motion.div
                  key={combo.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05, duration: 0.4 }}
                  className="group"
                >
                  <div className="bg-white dark:bg-white/[0.03] rounded-2xl border border-neutral-200 dark:border-white/[0.08] overflow-hidden hover:shadow-lg hover:shadow-cyan-500/5 transition-all duration-300 hover:border-cyan-200 dark:hover:border-cyan-500/20">
                    {/* Card Top - Image area */}
                    <div className="relative h-32 bg-gradient-to-br from-purple-50 to-cyan-50 dark:from-purple-500/5 dark:to-cyan-500/5 flex items-center justify-center">
                      {combo.image ? (
                        <img
                          src={combo.image}
                          alt={combo.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Gift className="h-12 w-12 text-cyan-500/40" />
                      )}

                      {/* Status badge */}
                      <Badge
                        className={`absolute top-3 right-3 text-[10px] ${
                          combo.isActive
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border-0'
                            : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-500/20 dark:text-neutral-400 border-0'
                        }`}
                      >
                        {combo.isActive ? 'Activo' : 'Inactivo'}
                      </Badge>

                      {/* Discount badge */}
                      {combo.discountPercent && (
                        <Badge className="absolute top-3 left-3 text-[10px] bg-red-500 text-white border-0">
                          -{combo.discountPercent}%
                        </Badge>
                      )}

                      {/* Delete image button */}
                      {combo.image && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleImageDelete(combo.id);
                          }}
                          className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500/90 hover:bg-red-600 text-white rounded-full p-1.5"
                        >
                          {uploadingImageId === combo.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <X className="h-3 w-3" />
                          )}
                        </button>
                      )}
                    </div>

                    {/* Card Body */}
                    <div className="p-4 space-y-3">
                      <div>
                        <h3 className="font-bold text-neutral-900 dark:text-white text-base">{combo.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm font-bold text-cyan-600 dark:text-cyan-400">
                            S/ {Number(combo.salePrice || combo.price).toFixed(2)}
                          </span>
                          {combo.salePrice && (
                            <span className="text-xs text-neutral-400 line-through">
                              S/ {Number(combo.price).toFixed(2)}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                          {combo.comboProducts?.length || 0} productos
                        </p>
                      </div>

                      {combo.description && (
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2">
                          {combo.description}
                        </p>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-1.5 pt-1">
                        <input
                          type="file"
                          id={`combo-img-${combo.id}`}
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload(combo.id, file);
                          }}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2.5 text-xs text-neutral-600 dark:text-neutral-400 hover:text-cyan-600 dark:hover:text-cyan-400"
                          onClick={() => document.getElementById(`combo-img-${combo.id}`)?.click()}
                        >
                          <ImageIcon className="h-3.5 w-3.5 mr-1" />
                          Imagen
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2.5 text-xs text-neutral-600 dark:text-neutral-400 hover:text-cyan-600 dark:hover:text-cyan-400"
                          onClick={() => openEditDialog(combo)}
                        >
                          <Pencil className="h-3.5 w-3.5 mr-1" />
                          Editar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2.5 text-xs text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 ml-auto"
                          onClick={() => setDeletingCombo(combo)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-primary/30 hover:scrollbar-thumb-primary/50 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gradient-to-b [&::-webkit-scrollbar-thumb]:from-primary/40 [&::-webkit-scrollbar-thumb]:to-primary/20 [&::-webkit-scrollbar-thumb]:rounded-full">
          <DialogHeader>
            <DialogTitle>{editingCombo ? 'Editar combo' : 'Nuevo combo'}</DialogTitle>
            <DialogDescription>
              {editingCombo
                ? 'Modifica los datos del combo'
                : 'Crea un nuevo combo de productos. Después de crearlo podrás agregar productos.'}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="general">Datos</TabsTrigger>
                  <TabsTrigger value="products">Productos</TabsTrigger>
                  <TabsTrigger value="seo">SEO</TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-4 mt-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Combo Fuerza"
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
                            placeholder="combo-fuerza"
                            {...field}
                            value={field.value || ''}
                            onChange={(e) => {
                              field.onChange(e);
                              slugManuallyEdited.current = e.target.value !== '';
                            }}
                          />
                        </FormControl>
                        <FormDescription>Se genera del nombre.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descripción (opcional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Whey 5lb + Creatina 300g..."
                            {...field}
                            value={field.value || ''}
                            rows={2}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-3 gap-3">
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
                              placeholder="89.99"
                              value={field.value || ''}
                              onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="salePrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Precio oferta</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="74.99"
                              {...field}
                              value={field.value ?? ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                field.onChange(val === '' ? null : Number(val));
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="discountPercent"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>% Descuento</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="15"
                              {...field}
                              value={field.value ?? ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                field.onChange(val === '' ? null : Number(val));
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-xl border border-neutral-200 dark:border-white/[0.08] p-4">
                        <div className="space-y-0.5">
                          <FormLabel>Activo</FormLabel>
                          <FormDescription>Mostrar en el catálogo público</FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* Image field */}
                  <div className="rounded-xl border border-neutral-200 dark:border-white/[0.08] p-4 space-y-3">
                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      Imagen (opcional)
                    </label>

                    {/* Preview for editing mode */}
                    {editingCombo?.image && (
                      <div className="relative w-full h-32 rounded-lg overflow-hidden bg-neutral-50 dark:bg-white/[0.02]">
                        <img
                          src={editingCombo.image}
                          alt={editingCombo.name}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleImageDelete(editingCombo.id)}
                          disabled={uploadingImageId === editingCombo.id}
                          className="absolute top-2 right-2 bg-red-500/90 hover:bg-red-600 text-white rounded-full p-1.5 transition-colors"
                        >
                          {uploadingImageId === editingCombo.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <X className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    )}

                    {/* Preview for creation mode */}
                    {!editingCombo && pendingImagePreview && (
                      <div className="relative w-full h-32 rounded-lg overflow-hidden bg-neutral-50 dark:bg-white/[0.02]">
                        <img
                          src={pendingImagePreview}
                          alt="Vista previa"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setPendingImageFile(null);
                            setPendingImagePreview(null);
                          }}
                          className="absolute top-2 right-2 bg-red-500/90 hover:bg-red-600 text-white rounded-full p-1.5 transition-colors"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}

                    {/* File input */}
                    {(editingCombo ? !editingCombo.image : !pendingImagePreview) && (
                      <div>
                        <input
                          type="file"
                          id="combo-dialog-image"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            if (editingCombo) {
                              handleImageUpload(editingCombo.id, file);
                            } else {
                              setPendingImageFile(file);
                              setPendingImagePreview(URL.createObjectURL(file));
                            }
                            e.target.value = '';
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="w-full text-neutral-600 dark:text-neutral-400"
                          disabled={editingCombo ? uploadingImageId === editingCombo.id : false}
                          onClick={() => document.getElementById('combo-dialog-image')?.click()}
                        >
                          {editingCombo && uploadingImageId === editingCombo.id ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <ImageIcon className="mr-2 h-4 w-4" />
                          )}
                          Seleccionar imagen
                        </Button>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="products" className="space-y-4 mt-4">
                  {!editingCombo ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="w-14 h-14 rounded-full bg-neutral-100 dark:bg-white/[0.04] flex items-center justify-center mb-3">
                        <Package className="h-7 w-7 text-neutral-400" />
                      </div>
                      <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                        Guarda el combo primero para agregar productos
                      </p>
                      <p className="text-xs text-neutral-400">
                        Completa los datos en la pestaña &quot;Datos&quot; y haz clic en &quot;Crear&quot;
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Product search */}
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                        <Input
                          placeholder="Buscar producto para agregar..."
                          value={productSearch}
                          onChange={(e) => handleProductSearch(e.target.value)}
                          className="pl-10"
                        />
                      </div>

                      {/* Search results */}
                      {productSearch && (
                        <div className="border border-neutral-200 dark:border-white/[0.08] rounded-xl max-h-48 overflow-y-auto">
                          {isSearching ? (
                            <div className="p-4 text-center text-neutral-500 text-sm">
                              <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                              Buscando...
                            </div>
                          ) : searchResults.length === 0 ? (
                            <div className="p-4 text-center text-neutral-500 text-sm">
                              No se encontraron productos
                            </div>
                          ) : (
                            searchResults.map((product) => (
                              <button
                                key={product.id}
                                type="button"
                                onClick={() => handleAddProduct(product.id)}
                                className="w-full flex items-center gap-3 p-3 hover:bg-neutral-50 dark:hover:bg-white/[0.04] text-left border-b border-neutral-100 dark:border-white/[0.04] last:border-0"
                              >
                                {product.images?.[0]?.url ? (
                                  <img
                                    src={product.images[0].url}
                                    alt={product.name}
                                    className="w-10 h-10 rounded-lg object-cover"
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-lg bg-neutral-100 dark:bg-white/[0.04] flex items-center justify-center">
                                    <Package className="h-4 w-4 text-neutral-400" />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">{product.name}</p>
                                  <p className="text-xs text-neutral-500">S/ {Number(product.price).toFixed(2)}</p>
                                </div>
                                <Plus className="h-4 w-4 text-cyan-500 flex-shrink-0" />
                              </button>
                            ))
                          )}
                        </div>
                      )}

                      {/* Current products in combo */}
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                          Productos en el combo ({editingCombo.comboProducts?.length || 0})
                        </p>
                        {!editingCombo.comboProducts?.length ? (
                          <div className="text-center py-8 text-neutral-400 text-sm">
                            Agrega productos usando el buscador de arriba
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {editingCombo.comboProducts.map((cp) => (
                              <div
                                key={cp.id}
                                className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-white/[0.02] rounded-xl border border-neutral-200 dark:border-white/[0.08]"
                              >
                                {cp.product.images?.[0]?.url ? (
                                  <img
                                    src={cp.product.images[0].url}
                                    alt={cp.product.name}
                                    className="w-10 h-10 rounded-lg object-cover"
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-lg bg-neutral-200 dark:bg-white/[0.06] flex items-center justify-center">
                                    <Package className="h-4 w-4 text-neutral-400" />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">{cp.product.name}</p>
                                  <p className="text-xs text-neutral-500">
                                    S/ {Number(cp.product.price).toFixed(2)} x{cp.quantity}
                                  </p>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                                  onClick={() => handleRemoveProduct(cp.productId)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </TabsContent>

                <TabsContent value="seo" className="space-y-4 mt-4">
                  <SEOFields form={form} showCard={false} />
                </TabsContent>
              </Tabs>

              <DialogFooter className="gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white border-0"
                >
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingCombo ? 'Guardar' : 'Crear'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingCombo} onOpenChange={() => setDeletingCombo(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar combo?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará el combo
              &quot;{deletingCombo?.name}&quot; permanentemente.
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
