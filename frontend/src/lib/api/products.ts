import api from './client';
import type {
  Product,
  CreateProductDto,
  UpdateProductDto,
  ProductQueryParams,
  PaginatedProducts,
  ReorderImageItem,
} from '@/types';

export async function getProducts(params?: ProductQueryParams): Promise<PaginatedProducts> {
  const { data } = await api.get<PaginatedProducts>('/products', { params });
  return data;
}

export async function getProduct(id: string): Promise<Product> {
  const { data } = await api.get<Product>(`/products/${id}`);
  return data;
}

export async function createProduct(dto: CreateProductDto): Promise<Product> {
  const { data } = await api.post<Product>('/products', dto);
  return data;
}

export async function updateProduct(id: string, dto: UpdateProductDto): Promise<Product> {
  const { data } = await api.patch<Product>(`/products/${id}`, dto);
  return data;
}

export async function deleteProduct(id: string): Promise<void> {
  await api.delete(`/products/${id}`);
}

export async function duplicateProduct(id: string): Promise<Product> {
  const { data } = await api.post<Product>(`/products/${id}/duplicate`);
  return data;
}

export async function uploadProductImages(id: string, files: File[]): Promise<Product> {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file);
  });

  const { data } = await api.post<Product>(`/products/${id}/images`, formData);
  return data;
}

export async function deleteProductImage(productId: string, imageId: string): Promise<Product> {
  const { data } = await api.delete<Product>(`/products/${productId}/images/${imageId}`);
  return data;
}

export async function reorderProductImages(
  productId: string,
  items: ReorderImageItem[]
): Promise<Product> {
  const { data } = await api.patch<Product>(`/products/${productId}/images/reorder`, { items });
  return data;
}
