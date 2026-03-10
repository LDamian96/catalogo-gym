import api from './client';
import type { Combo, CreateComboDto, UpdateComboDto, ReorderComboItem } from '@/types';

export async function getCombos(): Promise<Combo[]> {
  const { data } = await api.get<Combo[]>('/combos');
  return data;
}

export async function getCombo(id: string): Promise<Combo> {
  const { data } = await api.get<Combo>(`/combos/${id}`);
  return data;
}

export async function createCombo(dto: CreateComboDto): Promise<Combo> {
  const { data } = await api.post<Combo>('/combos', dto);
  return data;
}

export async function updateCombo(id: string, dto: UpdateComboDto): Promise<Combo> {
  const { data } = await api.patch<Combo>(`/combos/${id}`, dto);
  return data;
}

export async function deleteCombo(id: string): Promise<void> {
  await api.delete(`/combos/${id}`);
}

export async function uploadComboImage(id: string, file: File): Promise<Combo> {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await api.post<Combo>(`/combos/${id}/image`, formData);
  return data;
}

export async function deleteComboImage(id: string): Promise<Combo> {
  const { data } = await api.delete<Combo>(`/combos/${id}/image`);
  return data;
}

export async function reorderCombos(items: ReorderComboItem[]): Promise<Combo[]> {
  const { data } = await api.patch<Combo[]>('/combos/reorder', { items });
  return data;
}

export async function addComboProduct(comboId: string, productId: string, quantity = 1): Promise<Combo> {
  const { data } = await api.post<Combo>(`/combos/${comboId}/products`, { productId, quantity });
  return data;
}

export async function removeComboProduct(comboId: string, productId: string): Promise<Combo> {
  const { data } = await api.delete<Combo>(`/combos/${comboId}/products/${productId}`);
  return data;
}
