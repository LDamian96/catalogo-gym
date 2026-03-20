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
  Upload,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
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
import { staggerContainer, staggerItem } from '@/lib/utils/animations';
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
        <div
          className="bg-white dark:bg-white/[0.03] rounded-2xl border border-neutral-200 dark:border-white/[0.08] overflow-hidden hover:shadow-lg hover:shadow-cyan-500/5 transition-all duration-300 hover:border-cyan-200 dark:hover:border-cyan-500/20"
        >
          <div
            className="flex items-center gap-2 sm:gap-3 p-3 sm:p-3.5"
            style={{ paddingLeft: `${level * 16 + 12}px` }}
          >
            {/* Expand/Collapse */}
            <button
              onClick={() => hasChildren && toggleExpanded(node.id)}
              className={`flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-lg hover:bg-neutral-100 dark:hover:bg-white/[0.06] transition-colors ${
                hasChildren ? 'cursor-pointer' : 'cursor-default opacity-0'
              }`}
            >
              {hasChildren && (
                isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
                )
              )}
            </button>

            {/* Image */}
            <div className="relative flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl overflow-hidden bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-500/5 dark:to-blue-500/5">
              {node.image ? (
                <img
                  src={node.image}
                  alt={node.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="h-5 w-5 text-cyan-500/50 dark:text-cyan-400/30" />
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
                <h3 className="font-bold text-neutral-900 dark:text-white truncate">{node.name}</h3>
                <Badge
                  className={`text-[10px] ${
                    node.isActive
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border-0'
                      : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-500/20 dark:text-neutral-400 border-0'
                  }`}
                >
                  {node.isActive ? 'Activa' : 'Inactiva'}
                </Badge>
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                  {node._count?.products || 0} productos
                </span>
                {hasChildren && (
                  <>
                    <span className="text-neutral-300 dark:text-neutral-600">·</span>
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">
                      {node.children.length} sub
                    </span>
                  </>
                )}
                {level > 0 && (
                  <>
                    <span className="text-neutral-300 dark:text-neutral-600">·</span>
                    <span className="text-xs text-neutral-400 dark:text-neutral-500">
                      Nivel {level}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
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
                className="h-8 w-8 text-neutral-500 hover:text-cyan-600 dark:hover:text-cyan-400"
                onClick={() => document.getElementById(`image-${node.id}`)?.click()}
              >
                <ImageIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-neutral-500 hover:text-cyan-600 dark:hover:text-cyan-400"
                onClick={() => onEdit(node)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                onClick={() => onDelete(node)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Children */}
      <AnimatePresence>
        {hasChildren && isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-1.5 space-y-1.5"
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
  const [dialogImageFile, setDialogImageFile] = useState<File | null>(null);
  const [dialogImagePreview, setDialogImagePreview] = useState<string | null>(null);
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
    setDialogImageFile(null);
    setDialogImagePreview(null);
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
    setDialogImageFile(null);
    setDialogImagePreview(null);
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

  function handleDialogImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setDialogImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setDialogImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
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
        // Si hay imagen seleccionada en el dialog, subirla
        if (dialogImageFile) {
          await uploadCategoryImage(editingCategory.id, dialogImageFile);
        }
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
        const created = await createCategory(dto);
        // Si hay imagen seleccionada en el dialog, subirla después de crear
        if (dialogImageFile && created?.id) {
          await uploadCategoryImage(created.id, dialogImageFile);
        }
        toast.success('Categoría creada');
      }

      setIsDialogOpen(false);
      setDialogImageFile(null);
      setDialogImagePreview(null);
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

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="space-y-8"
    >
      {/* Header premium */}
      <motion.div variants={staggerItem} className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight flex items-center gap-2">
            Categorías
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1 text-sm">
            Organiza tus productos en categorías jerárquicas
          </p>
        </div>
        <Button
          onClick={() => openCreateDialog()}
          className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-lg shadow-cyan-500/25 border-0 flex-shrink-0"
        >
          <Plus className="mr-1 sm:mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Nueva categoría</span>
          <span className="sm:hidden">Nueva</span>
        </Button>
      </motion.div>

      <motion.div variants={staggerItem}>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.4 }}
              >
                <div className="bg-white dark:bg-white/[0.03] rounded-2xl border border-neutral-200 dark:border-white/[0.08] overflow-hidden">
                  <div className="flex items-center gap-4 p-4">
                    <Skeleton className="w-7 h-7 rounded-lg" />
                    <Skeleton className="w-12 h-12 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-5 w-14 rounded-full" />
                    <div className="flex gap-1.5">
                      <Skeleton className="h-8 w-16 rounded-md" />
                      <Skeleton className="h-8 w-16 rounded-md" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : categoryTree.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-white/[0.02] rounded-2xl border border-neutral-200 dark:border-white/[0.08]">
            <div className="w-20 h-20 rounded-full bg-cyan-50 dark:bg-cyan-500/10 flex items-center justify-center mb-4">
              <FolderOpen className="h-10 w-10 text-cyan-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-neutral-900 dark:text-white">Sin categorías</h3>
            <p className="text-neutral-500 dark:text-neutral-400 mb-6 text-center max-w-sm">
              Crea tu primera categoría para organizar productos
            </p>
            <Button
              onClick={() => openCreateDialog()}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
            >
              <Plus className="mr-2 h-4 w-4" />
              Crear categoría
            </Button>
          </div>
        ) : (
          <div className="space-y-1.5">
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
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-primary/30 hover:scrollbar-thumb-primary/50 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gradient-to-b [&::-webkit-scrollbar-thumb]:from-primary/40 [&::-webkit-scrollbar-thumb]:to-primary/20 [&::-webkit-scrollbar-thumb]:rounded-full">
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

              {/* Imagen opcional */}
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">
                  Imagen (opcional)
                </label>
                <div
                  onClick={() => document.getElementById('dialog-category-image')?.click()}
                  className="relative cursor-pointer rounded-xl border-2 border-dashed border-neutral-200 dark:border-white/[0.08] hover:border-cyan-300 dark:hover:border-cyan-500/30 transition-colors bg-neutral-50 dark:bg-white/[0.02] p-4 flex flex-col items-center justify-center gap-2"
                >
                  <input
                    type="file"
                    id="dialog-category-image"
                    accept="image/*"
                    className="hidden"
                    onChange={handleDialogImageChange}
                  />
                  {dialogImagePreview ? (
                    <div className="flex items-center gap-3 w-full">
                      <img
                        src={dialogImagePreview}
                        alt="Preview"
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 truncate">
                          {dialogImageFile?.name}
                        </p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                          Click para cambiar
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-full bg-cyan-50 dark:bg-cyan-500/10 flex items-center justify-center">
                        <Upload className="h-5 w-5 text-cyan-500" />
                      </div>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        Click para subir imagen
                      </p>
                      <p className="text-xs text-neutral-400 dark:text-neutral-500">
                        PNG, JPG o WebP
                      </p>
                    </>
                  )}
                </div>
              </div>

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-xl border border-neutral-200 dark:border-white/[0.08] p-4">
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
                <Button type="submit" disabled={isSaving} className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white border-0">
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
