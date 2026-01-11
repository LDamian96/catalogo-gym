import api from './client';
import type { TrackingPixel, CreateTrackingPixelDto, UpdateTrackingPixelDto } from '@/types';

export async function getTrackingPixels(): Promise<TrackingPixel[]> {
  const { data } = await api.get<TrackingPixel[]>('/tracking-pixels');
  return data;
}

export async function getTrackingPixel(id: string): Promise<TrackingPixel> {
  const { data } = await api.get<TrackingPixel>(`/tracking-pixels/${id}`);
  return data;
}

export async function createTrackingPixel(dto: CreateTrackingPixelDto): Promise<TrackingPixel> {
  const { data } = await api.post<TrackingPixel>('/tracking-pixels', dto);
  return data;
}

export async function updateTrackingPixel(id: string, dto: UpdateTrackingPixelDto): Promise<TrackingPixel> {
  const { data } = await api.patch<TrackingPixel>(`/tracking-pixels/${id}`, dto);
  return data;
}

export async function deleteTrackingPixel(id: string): Promise<void> {
  await api.delete(`/tracking-pixels/${id}`);
}
