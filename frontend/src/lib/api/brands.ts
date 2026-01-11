import api from './client';
import type { Brand, CreateBrandDto, UpdateBrandDto, ReorderBrandItem } from '@/types';

export async function getBrands(): Promise<Brand[]> {
  const { data } = await api.get<Brand[]>('/brands');
  return data;
}

export async function getBrand(id: string): Promise<Brand> {
  const { data } = await api.get<Brand>(`/brands/${id}`);
  return data;
}

export async function createBrand(dto: CreateBrandDto): Promise<Brand> {
  const { data } = await api.post<Brand>('/brands', dto);
  return data;
}

export async function updateBrand(id: string, dto: UpdateBrandDto): Promise<Brand> {
  const { data } = await api.patch<Brand>(`/brands/${id}`, dto);
  return data;
}

export async function deleteBrand(id: string): Promise<void> {
  await api.delete(`/brands/${id}`);
}

export async function uploadBrandLogo(id: string, file: File): Promise<Brand> {
  const formData = new FormData();
  formData.append('file', file);

  const { data } = await api.post<Brand>(`/brands/${id}/logo`, formData);
  return data;
}

export async function deleteBrandLogo(id: string): Promise<Brand> {
  const { data } = await api.delete<Brand>(`/brands/${id}/logo`);
  return data;
}

export async function reorderBrands(items: ReorderBrandItem[]): Promise<Brand[]> {
  const { data } = await api.patch<Brand[]>('/brands/reorder', { items });
  return data;
}
