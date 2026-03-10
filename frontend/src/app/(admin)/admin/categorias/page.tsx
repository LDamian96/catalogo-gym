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
  ChevronRight,
  ChevronDown,
  Pencil,
  Trash2,
  Image as ImageIcon,
  FolderOpen,
  FolderTree,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { SEOFields } from '@/components/shared';
import {
  getCategories,
  getCategoriesTree,
  createCategory,
  updateCategory,
  deleteCategory,
  uploadCategoryImage,
} from '@/lib/api/categories';
import type { Category, CategoryTreeNode, CreateCategoryDto, UpdateCategoryDto } from '@/types';

const categorySchema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres').max(100),
  slug: z
    .string()
    .regex(/^[a-z0-9-]*$/, 'Solo letras minúsculas, números y guiones')
    .optional()
    .or(z.literal('')),
  parentId: z.string().nullable().optional(),
  isActive: z.boolean(),
  seoTitle: z.string().max(70).nullable().optional(),
  seoDescription: z.string().max(160).nullable().optional(),
  seoKeywords: z.string().max(200).nullable().optional(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

// Componente recursivo para renderizar el árbol
function CategoryTreeItem({
  node,
  level = 0,
  expandedIds,
  toggleExpanded,
  onEdit,
  onDelete,
  onImageUpload,
  uploadingImageId,
}: {
  node: CategoryTreeNode;
  level?: number;
  expandedIds: Set<string>;
  toggleExpanded: (id: string) => void;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  onImageUpload: (categoryId: string, file: File) => void;
  uploadingImageId: string | null;
}) {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expandedIds.has(node.id);

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="group"
      >
        <Card className="overflow-hidden hover:shadow-md transition-shadow">
          <CardContent className="p-0">
            <div
              className="flex items-center gap-3 p-3"
              style={{ paddingLeft: `${level * 24 + 12}px` }}
            >
              {/* Expand/Collapse */}
              <button
                onClick={() => hasChildren && toggleExpanded(node.id)}
                className={`flex-shrink-0 w-6 h-6 flex items-center justify-center rounded hover:bg-muted transition-colors ${
                  hasChildren ? 'cursor-pointer' : 'cursor-default opacity-0'
                }`}
              >
                {hasChildren && (
                  isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )
                )}
              </button>

              {/* Image */}
              <div className="relative flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-muted">
                {node.image ? (
                  <img
                    src={node.image}
                    alt={node.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
                {uploadingImageId === node.id && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Loader2 className="h-4 w-4 text-white animate-spin" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold truncate">{node.name}</h3>
                  <Badge variant={node.isActive ? 'default' : 'secondary'} className="text-[10px]">
                    {node.isActive ? 'Activa' : 'Inactiva'}
                  </Badge>
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <Badge variant="outline" className="text-[10px] font-normal">
                    {node._count?.products || 0} productos
                  </Badge>
                  {hasChildren && (
                    <Badge variant="outline" className="text-[10px] font-normal">
                      {node.children.length} sub
                    </Badge>
                  )}
                  {level > 0 && (
                    <Badge variant="outline" className="text-[10px] font-normal text-muted-foreground">
                      Nivel {level}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Actions - always visible */}
              <div className="flex items-center gap-1">
                <input
                  type="file"
                  id={`image-${node.id}`}
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) onImageUpload(node.id, file);
                  }}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => document.getElementById(`image-${node.id}`)?.click()}
                >
                  <ImageIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onEdit(node)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onDelete(node)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Children */}
      <AnimatePresence>
        {hasChildren && isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-1 space-y-1"
          >
            {node.children.map((child) => (
              <CategoryTreeItem
                key={child.id}
                node={child}
                level={level + 1}
                expandedIds={expandedIds}
                toggleExpanded={toggleExpanded}
                onEdit={onEdit}
                onDelete={onDelete}
                onImageUpload={onImageUpload}
                uploadingImageId={uploadingImageId}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

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

export default function CategoriasPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryTree, setCategoryTree] = useState<CategoryTreeNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [uploadingImageId, setUploadingImageId] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const slugManuallyEdited = useRef(false);

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      slug: '',
      parentId: null,
      isActive: true,
      seoTitle: '',
      seoDescription: '',
      seoKeywords: '',
    },
  });

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      setIsLoading(true);
      const [flat, tree] = await Promise.all([
        getCategories(),
        getCategoriesTree(),
      ]);
      setCategories(flat);
      setCategoryTree(tree);
      // Expandir todas las categorías raíz por defecto
      setExpandedIds(new Set(tree.map((c) => c.id)));
    } catch (error) {
      console.error(error);
      toast.error('Error al cargar categorías');
    } finally {
      setIsLoading(false);
    }
  }

  function toggleExpanded(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function openCreateDialog(parentId?: string) {
    setEditingCategory(null);
    slugManuallyEdited.current = false;
    form.reset({
      name: '',
      slug: '',
      parentId: parentId || null,
      isActive: true,
      seoTitle: '',
      seoDescription: '',
      seoKeywords: '',
    });
    setIsDialogOpen(true);
  }

  function openEditDialog(category: Category) {
    setEditingCategory(category);
    slugManuallyEdited.current = true; // Al editar, no sobreescribir el slug existente
    form.reset({
      name: category.name,
      slug: category.slug,
      parentId: category.parentId || null,
      isActive: category.isActive,
      seoTitle: category.seoTitle || '',
      seoDescription: category.seoDescription || '',
      seoKeywords: category.seoKeywords || '',
    });
    setIsDialogOpen(true);
  }

  // Obtener opciones de categoría padre (excluyendo la categoría actual y sus descendientes)
  function getParentOptions(): Category[] {
    if (!editingCategory) {
      return categories;
    }

    // Obtener todos los IDs de descendientes
    const getDescendantIds = (cat: CategoryTreeNode): string[] => {
      const ids: string[] = [cat.id];
      if (cat.children) {
        cat.children.forEach((child) => {
          ids.push(...getDescendantIds(child));
        });
      }
      return ids;
    };

    const findInTree = (nodes: CategoryTreeNode[], id: string): CategoryTreeNode | null => {
      for (const node of nodes) {
        if (node.id === id) return node;
        if (node.children) {
          const found = findInTree(node.children, id);
          if (found) return found;
        }
      }
      return null;
    };

    const currentNode = findInTree(categoryTree, editingCategory.id);
    const excludeIds = currentNode ? getDescendantIds(currentNode) : [editingCategory.id];

    return categories.filter((c) => !excludeIds.includes(c.id));
  }

  async function onSubmit(data: CategoryFormData) {
    try {
      setIsSaving(true);

      if (editingCategory) {
        const dto: UpdateCategoryDto = {
          name: data.name,
          slug: data.slug || undefined,
          parentId: data.parentId,
          isActive: data.isActive,
          seoTitle: data.seoTitle || null,
          seoDescription: data.seoDescription || null,
          seoKeywords: data.seoKeywords || null,
        };
        await updateCategory(editingCategory.id, dto);
        toast.success('Categoría actualizada');
      } else {
        const dto: CreateCategoryDto = {
          name: data.name,
          slug: data.slug || undefined,
          parentId: data.parentId,
          isActive: data.isActive,
          seoTitle: data.seoTitle || null,
          seoDescription: data.seoDescription || null,
          seoKeywords: data.seoKeywords || null,
        };
        await createCategory(dto);
        toast.success('Categoría creada');
      }

      setIsDialogOpen(false);
      await loadCategories();
    } catch (error) {
      console.error(error);
      toast.error('Error al guardar categoría');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!deletingCategory) return;

    try {
      await deleteCategory(deletingCategory.id);
      toast.success('Categoría eliminada');
      await loadCategories();
    } catch (error) {
      console.error(error);
      toast.error('Error al eliminar categoría');
    } finally {
      setDeletingCategory(null);
    }
  }

  async function handleImageUpload(categoryId: string, file: File) {
    try {
      setUploadingImageId(categoryId);
      await uploadCategoryImage(categoryId, file);
      toast.success('Imagen actualizada');
      await loadCategories();
    } catch (error) {
      console.error(error);
      toast.error('Error al subir imagen');
    } finally {
      setUploadingImageId(null);
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
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
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FolderTree className="h-8 w-8" />
            Categorías
          </h1>
          <p className="text-muted-foreground">
            Organiza tus productos en categorías jerárquicas (como WooCommerce)
          </p>
        </div>
        <Button onClick={() => openCreateDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva categoría
        </Button>
      </motion.div>

      <motion.div variants={fadeInUp}>
        {categoryTree.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Sin categorías</h3>
              <p className="text-muted-foreground mb-4">
                Crea tu primera categoría para organizar productos
              </p>
              <Button onClick={() => openCreateDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Crear categoría
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {categoryTree.map((node) => (
              <CategoryTreeItem
                key={node.id}
                node={node}
                expandedIds={expandedIds}
                toggleExpanded={toggleExpanded}
                onEdit={openEditDialog}
                onDelete={setDeletingCategory}
                onImageUpload={handleImageUpload}
                uploadingImageId={uploadingImageId}
              />
            ))}
          </div>
        )}
      </motion.div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Editar categoría' : 'Nueva categoría'}
            </DialogTitle>
            <DialogDescription>
              {editingCategory
                ? 'Modifica los datos de la categoría'
                : 'Crea una nueva categoría para organizar productos'}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="general">Datos</TabsTrigger>
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
                        placeholder="Electrónicos"
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
                        placeholder="electronicos"
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
                name="parentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoría padre</FormLabel>
                    <Select
                      value={field.value || 'none'}
                      onValueChange={(value) => field.onChange(value === 'none' ? null : value)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar categoría padre" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">
                          <span className="flex items-center gap-2">
                            <FolderOpen className="h-4 w-4" />
                            Sin padre (categoría raíz)
                          </span>
                        </SelectItem>
                        {getParentOptions().map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            <span className="flex items-center gap-2">
                              {'─'.repeat(cat.level)} {cat.name}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Selecciona una categoría padre para crear una subcategoría
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
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
                  {editingCategory ? 'Guardar' : 'Crear'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deletingCategory}
        onOpenChange={() => setDeletingCategory(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar categoría?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará la categoría
              &quot;{deletingCategory?.name}&quot; permanentemente.
              {deletingCategory?.children && deletingCategory.children.length > 0 && (
                <span className="block mt-2 text-amber-600">
                  ⚠️ Esta categoría tiene subcategorías que quedarán huérfanas.
                </span>
              )}
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
