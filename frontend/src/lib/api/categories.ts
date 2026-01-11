import api from './client';
import type { Category, CategoryTreeNode, CreateCategoryDto, UpdateCategoryDto, ReorderCategoryItem } from '@/types';

// Re-export Category type for convenience
export type { Category, CategoryTreeNode } from '@/types';

// Obtener todas las categorías (plano)
export async function getCategories(): Promise<Category[]> {
  const { data } = await api.get<Category[]>('/categories');
  return data;
}

// Obtener categorías en formato árbol jerárquico
export async function getCategoriesTree(): Promise<CategoryTreeNode[]> {
  const { data } = await api.get<CategoryTreeNode[]>('/categories/tree');
  return data;
}

// Obtener ancestros (breadcrumb) de una categoría
export async function getCategoryAncestors(id: string): Promise<Category[]> {
  const { data } = await api.get<Category[]>(`/categories/${id}/ancestors`);
  return data;
}

// Obtener descendientes de una categoría
export async function getCategoryDescendants(id: string): Promise<Category[]> {
  const { data } = await api.get<Category[]>(`/categories/${id}/descendants`);
  return data;
}

export async function getCategory(id: string): Promise<Category> {
  const { data } = await api.get<Category>(`/categories/${id}`);
  return data;
}

export async function createCategory(dto: CreateCategoryDto): Promise<Category> {
  const { data } = await api.post<Category>('/categories', dto);
  return data;
}

export async function updateCategory(id: string, dto: UpdateCategoryDto): Promise<Category> {
  const { data } = await api.patch<Category>(`/categories/${id}`, dto);
  return data;
}

export async function deleteCategory(id: string): Promise<void> {
  await api.delete(`/categories/${id}`);
}

export async function uploadCategoryImage(id: string, file: File): Promise<Category> {
  const formData = new FormData();
  formData.append('file', file);

  const { data } = await api.post<Category>(`/categories/${id}/image`, formData);
  return data;
}

export async function deleteCategoryImage(id: string): Promise<Category> {
  const { data } = await api.delete<Category>(`/categories/${id}/image`);
  return data;
}

export async function reorderCategories(items: ReorderCategoryItem[]): Promise<Category[]> {
  const { data } = await api.patch<Category[]>('/categories/reorder', { items });
  return data;
}
