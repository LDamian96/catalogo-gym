import api from './client';
import type { Settings, UpdateSettingsDto } from '@/types';

export async function getSettings(): Promise<Settings> {
  const { data } = await api.get<Settings>('/settings');
  return data;
}

export async function updateSettings(dto: UpdateSettingsDto): Promise<Settings> {
  const { data } = await api.patch<Settings>('/settings', dto);
  return data;
}

export async function uploadLogo(file: File): Promise<Settings> {
  const formData = new FormData();
  formData.append('file', file);

  const { data } = await api.post<Settings>('/settings/logo', formData);
  return data;
}

export async function deleteLogo(): Promise<Settings> {
  const { data } = await api.delete<Settings>('/settings/logo');
  return data;
}

export async function uploadOgImage(file: File): Promise<Settings> {
  const formData = new FormData();
  formData.append('file', file);

  const { data } = await api.post<Settings>('/settings/og-image', formData);
  return data;
}

export async function deleteOgImage(): Promise<Settings> {
  const { data } = await api.delete<Settings>('/settings/og-image');
  return data;
}
