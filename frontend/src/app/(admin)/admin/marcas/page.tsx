'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { toast } from 'sonner';
import {
  Plus,
  Loader2,
  GripVertical,
  Pencil,
  Trash2,
  Image as ImageIcon,
  Tag,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
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
import {
  getBrands,
  createBrand,
  updateBrand,
  deleteBrand,
  uploadBrandLogo,
  deleteBrandLogo,
  reorderBrands,
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
        };
        const updated = await updateBrand(editingBrand.id, dto);
        setBrands((prev) =>
          prev.map((b) => (b.id === updated.id ? updated : b))
        );
        toast.success('Marca actualizada');
      } else {
        const dto: CreateBrandDto = {
          name: data.name,
          slug: data.slug || undefined,
          description: data.description || null,
          isActive: data.isActive,
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

  async function handleReorder(newOrder: Brand[]) {
    const previousOrder = [...brands];
    setBrands(newOrder);

    try {
      const items = newOrder.map((brand, index) => ({
        id: brand.id,
        order: index,
      }));
      await reorderBrands(items);
    } catch (error) {
      console.error(error);
      setBrands(previousOrder);
      toast.error('Error al reordenar');
    }
  }

  async function handleLogoUpload(brandId: string, file: File) {
    try {
      setUploadingLogoId(brandId);
      const updated = await uploadBrandLogo(brandId, file);
      setBrands((prev) =>
        prev.map((b) => (b.id === updated.id ? updated : b))
      );
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
      setBrands((prev) =>
        prev.map((b) => (b.id === updated.id ? updated : b))
      );
      toast.success('Logo eliminado');
    } catch (error) {
      console.error(error);
      toast.error('Error al eliminar logo');
    } finally {
      setUploadingLogoId(null);
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
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
      className="container mx-auto py-6 space-y-6"
    >
      <motion.div variants={fadeInUp} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Marcas</h1>
          <p className="text-muted-foreground">
            Gestiona las marcas de tus productos
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva marca
        </Button>
      </motion.div>

      <motion.div variants={fadeInUp}>
        {brands.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Tag className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Sin marcas</h3>
              <p className="text-muted-foreground mb-4">
                Crea tu primera marca para asociarla a productos
              </p>
              <Button onClick={openCreateDialog}>
                <Plus className="mr-2 h-4 w-4" />
                Crear marca
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Reorder.Group
            axis="y"
            values={brands}
            onReorder={handleReorder}
            className="space-y-3"
          >
            <AnimatePresence>
              {brands.map((brand) => (
                <Reorder.Item
                  key={brand.id}
                  value={brand}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  whileDrag={{ scale: 1.02, boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}
                  className="cursor-grab active:cursor-grabbing"
                >
                  <Card className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex items-center gap-4 p-4">
                        {/* Drag Handle */}
                        <div className="flex-shrink-0 text-muted-foreground">
                          <GripVertical className="h-5 w-5" />
                        </div>

                        {/* Logo */}
                        <div className="relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-muted">
                          {brand.logo ? (
                            <img
                              src={brand.logo}
                              alt={brand.name}
                              className="w-full h-full object-contain p-1"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Tag className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                          {uploadingLogoId === brand.id && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                              <Loader2 className="h-5 w-5 text-white animate-spin" />
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold truncate">{brand.name}</h3>
                            <Badge variant={brand.isActive ? 'default' : 'secondary'}>
                              {brand.isActive ? 'Activa' : 'Inactiva'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            /{brand.slug} • {brand._count?.products || 0} productos
                          </p>
                          {brand.description && (
                            <p className="text-sm text-muted-foreground truncate mt-1">
                              {brand.description}
                            </p>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
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
                            size="icon"
                            onClick={() =>
                              document.getElementById(`logo-${brand.id}`)?.click()
                            }
                          >
                            <ImageIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(brand)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeletingBrand(brand)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Reorder.Item>
              ))}
            </AnimatePresence>
          </Reorder.Group>
        )}
      </motion.div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-primary/30 hover:scrollbar-thumb-primary/50 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gradient-to-b [&::-webkit-scrollbar-thumb]:from-primary/40 [&::-webkit-scrollbar-thumb]:to-primary/20 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb]:border-transparent [&::-webkit-scrollbar-thumb]:transition-colors hover:[&::-webkit-scrollbar-thumb]:from-primary/60 hover:[&::-webkit-scrollbar-thumb]:to-primary/40">
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
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05, duration: 0.3 }}
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre</FormLabel>
                      <FormControl>
                        <Input placeholder="Nike" {...field} className="transition-all duration-200 focus:scale-[1.01]" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }}
              >
                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug (URL)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="nike"
                          {...field}
                          value={field.value || ''}
                          className="transition-all duration-200 focus:scale-[1.01]"
                        />
                      </FormControl>
                      <FormDescription>
                        Déjalo vacío para generar automáticamente
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.3 }}
              >
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
                          className="transition-all duration-200 focus:scale-[1.01] resize-none"
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
              >
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-3 transition-colors duration-200 hover:bg-muted/50">
                      <div className="space-y-0.5">
                        <FormLabel>Activa</FormLabel>
                        <FormDescription>
                          Mostrar en el catálogo público
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
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.3 }}
              >
                <DialogFooter className="gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    className="transition-all duration-200 hover:scale-[1.02]"
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isSaving} className="transition-all duration-200 hover:scale-[1.02]">
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {editingBrand ? 'Guardar' : 'Crear'}
                  </Button>
                </DialogFooter>
              </motion.div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deletingBrand}
        onOpenChange={() => setDeletingBrand(null)}
      >
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
