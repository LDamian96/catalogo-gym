'use client';

import { useState, useEffect } from 'react';
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
  Tag,
  X,
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
import { SEOFields } from '@/components/shared';
import {
  getBrands,
  createBrand,
  updateBrand,
  deleteBrand,
  uploadBrandLogo,
  deleteBrandLogo,
} from '@/lib/api/brands';
import type { Brand, CreateBrandDto, UpdateBrandDto } from '@/types';

const brandSchema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres').max(100),
  slug: z
    .string()
    .regex(/^[a-z0-9-]*$/, 'Solo letras minúsculas, números y guiones')
    .optional()
    .or(z.literal('')),
  description: z.string().max(500).nullable().optional(),
  isActive: z.boolean(),
  // SEO
  seoTitle: z.string().max(70).nullable().optional(),
  seoDescription: z.string().max(160).nullable().optional(),
  seoKeywords: z.string().max(200).nullable().optional(),
});

type BrandFormData = z.infer<typeof brandSchema>;

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export default function MarcasPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [deletingBrand, setDeletingBrand] = useState<Brand | null>(null);
  const [uploadingLogoId, setUploadingLogoId] = useState<string | null>(null);

  const form = useForm<BrandFormData>({
    resolver: zodResolver(brandSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      isActive: true,
      seoTitle: '',
      seoDescription: '',
      seoKeywords: '',
    },
  });

  useEffect(() => {
    loadBrands();
  }, []);

  async function loadBrands() {
    try {
      setIsLoading(true);
      const data = await getBrands();
      setBrands(data);
    } catch (error) {
      console.error(error);
      toast.error('Error al cargar marcas');
    } finally {
      setIsLoading(false);
    }
  }

  function openCreateDialog() {
    setEditingBrand(null);
    form.reset({
      name: '',
      slug: '',
      description: '',
      isActive: true,
      seoTitle: '',
      seoDescription: '',
      seoKeywords: '',
    });
    setIsDialogOpen(true);
  }

  function openEditDialog(brand: Brand) {
    setEditingBrand(brand);
    form.reset({
      name: brand.name,
      slug: brand.slug,
      description: brand.description || '',
      isActive: brand.isActive,
      seoTitle: brand.seoTitle || '',
      seoDescription: brand.seoDescription || '',
      seoKeywords: brand.seoKeywords || '',
    });
    setIsDialogOpen(true);
  }

  async function onSubmit(data: BrandFormData) {
    try {
      setIsSaving(true);

      if (editingBrand) {
        const dto: UpdateBrandDto = {
          name: data.name,
          slug: data.slug || undefined,
          description: data.description || null,
          isActive: data.isActive,
          seoTitle: data.seoTitle || null,
          seoDescription: data.seoDescription || null,
          seoKeywords: data.seoKeywords || null,
        };
        const updated = await updateBrand(editingBrand.id, dto);
        setBrands((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
        toast.success('Marca actualizada');
      } else {
        const dto: CreateBrandDto = {
          name: data.name,
          slug: data.slug || undefined,
          description: data.description || null,
          isActive: data.isActive,
          seoTitle: data.seoTitle || null,
          seoDescription: data.seoDescription || null,
          seoKeywords: data.seoKeywords || null,
        };
        const created = await createBrand(dto);
        setBrands((prev) => [...prev, created]);
        toast.success('Marca creada');
      }

      setIsDialogOpen(false);
    } catch (error) {
      console.error(error);
      toast.error('Error al guardar marca');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!deletingBrand) return;

    try {
      await deleteBrand(deletingBrand.id);
      setBrands((prev) => prev.filter((b) => b.id !== deletingBrand.id));
      toast.success('Marca eliminada');
    } catch (error) {
      console.error(error);
      toast.error('Error al eliminar marca');
    } finally {
      setDeletingBrand(null);
    }
  }

  async function handleLogoUpload(brandId: string, file: File) {
    try {
      setUploadingLogoId(brandId);
      const updated = await uploadBrandLogo(brandId, file);
      setBrands((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
      toast.success('Logo actualizado');
    } catch (error) {
      console.error(error);
      toast.error('Error al subir logo');
    } finally {
      setUploadingLogoId(null);
    }
  }

  async function handleLogoDelete(brandId: string) {
    try {
      setUploadingLogoId(brandId);
      const updated = await deleteBrandLogo(brandId);
      setBrands((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
      toast.success('Logo eliminado');
    } catch (error) {
      console.error(error);
      toast.error('Error al eliminar logo');
    } finally {
      setUploadingLogoId(null);
    }
  }

  // Get initials for brand
  function getBrandInitials(name: string) {
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 3);
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-[200px] w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={{ animate: { transition: { staggerChildren: 0.1 } } }}
      className="space-y-8"
    >
      {/* Header elegante estilo BETA.pen */}
      <motion.div variants={fadeInUp} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">Marcas</h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">
            Administra las marcas de tu catálogo
          </p>
        </div>
        <Button
          onClick={openCreateDialog}
          className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-lg shadow-cyan-500/25 border-0"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nueva marca
        </Button>
      </motion.div>

      {/* Grid de Cards estilo BETA.pen */}
      <motion.div variants={fadeInUp}>
        {brands.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-white/[0.02] rounded-2xl border border-neutral-200 dark:border-white/[0.08]">
            <div className="w-20 h-20 rounded-full bg-cyan-50 dark:bg-cyan-500/10 flex items-center justify-center mb-4">
              <Tag className="h-10 w-10 text-cyan-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-neutral-900 dark:text-white">Sin marcas</h3>
            <p className="text-neutral-500 dark:text-neutral-400 mb-6 text-center max-w-sm">
              Crea tu primera marca para asociarla a productos
            </p>
            <Button
              onClick={openCreateDialog}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
            >
              <Plus className="mr-2 h-4 w-4" />
              Crear marca
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            <AnimatePresence>
              {brands.map((brand, index) => (
                <motion.div
                  key={brand.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05, duration: 0.4 }}
                  className="group"
                >
                  <div className="bg-white dark:bg-white/[0.03] rounded-2xl border border-neutral-200 dark:border-white/[0.08] overflow-hidden hover:shadow-lg hover:shadow-cyan-500/5 transition-all duration-300 hover:border-cyan-200 dark:hover:border-cyan-500/20">
                    {/* Card Top - Logo/Initials area */}
                    <div className="relative h-28 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-500/5 dark:to-blue-500/5 flex items-center justify-center">
                      {brand.logo ? (
                        <img
                          src={brand.logo}
                          alt={brand.name}
                          className="h-16 w-auto max-w-[80%] object-contain"
                        />
                      ) : (
                        <span className="text-3xl font-extrabold text-cyan-500/60 dark:text-cyan-400/40 tracking-wider">
                          {getBrandInitials(brand.name)}
                        </span>
                      )}

                      {/* Status badge */}
                      <Badge
                        className={`absolute top-3 right-3 text-[10px] ${
                          brand.isActive
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border-0'
                            : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-500/20 dark:text-neutral-400 border-0'
                        }`}
                      >
                        {brand.isActive ? 'Activa' : 'Inactiva'}
                      </Badge>

                      {/* Delete logo button */}
                      {brand.logo && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLogoDelete(brand.id);
                          }}
                          className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500/90 hover:bg-red-600 text-white rounded-full p-1.5"
                          title="Eliminar logo"
                        >
                          {uploadingLogoId === brand.id ? (
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
                        <h3 className="font-bold text-neutral-900 dark:text-white text-base">
                          {brand.name}
                        </h3>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                          {brand._count?.products || 0} productos
                        </p>
                      </div>

                      {brand.description && (
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2">
                          {brand.description}
                        </p>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-1.5 pt-1">
                        <input
                          type="file"
                          id={`logo-${brand.id}`}
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleLogoUpload(brand.id, file);
                          }}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2.5 text-xs text-neutral-600 dark:text-neutral-400 hover:text-cyan-600 dark:hover:text-cyan-400"
                          onClick={() => document.getElementById(`logo-${brand.id}`)?.click()}
                        >
                          <ImageIcon className="h-3.5 w-3.5 mr-1" />
                          Logo
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2.5 text-xs text-neutral-600 dark:text-neutral-400 hover:text-cyan-600 dark:hover:text-cyan-400"
                          onClick={() => openEditDialog(brand)}
                        >
                          <Pencil className="h-3.5 w-3.5 mr-1" />
                          Editar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2.5 text-xs text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 ml-auto"
                          onClick={() => setDeletingBrand(brand)}
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

      {/* Create/Edit Dialog with SEO */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-primary/30 hover:scrollbar-thumb-primary/50 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gradient-to-b [&::-webkit-scrollbar-thumb]:from-primary/40 [&::-webkit-scrollbar-thumb]:to-primary/20 [&::-webkit-scrollbar-thumb]:rounded-full">
          <DialogHeader>
            <DialogTitle>
              {editingBrand ? 'Editar marca' : 'Nueva marca'}
            </DialogTitle>
            <DialogDescription>
              {editingBrand
                ? 'Modifica los datos de la marca'
                : 'Crea una nueva marca para asociarla a productos'}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input placeholder="Nike" {...field} />
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
                      <Input placeholder="nike" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormDescription>Déjalo vacío para generar automáticamente</FormDescription>
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
                        placeholder="Descripción breve de la marca..."
                        {...field}
                        value={field.value || ''}
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-xl border border-neutral-200 dark:border-white/[0.08] p-4">
                    <div className="space-y-0.5">
                      <FormLabel>Activa</FormLabel>
                      <FormDescription>Mostrar en el catálogo público</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* SEO Fields */}
              <SEOFields form={form} showCard={false} />

              <DialogFooter className="gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSaving} className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white border-0">
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingBrand ? 'Guardar' : 'Crear'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingBrand} onOpenChange={() => setDeletingBrand(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar marca?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará la marca
              &quot;{deletingBrand?.name}&quot; permanentemente. Los productos asociados
              quedarán sin marca.
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
