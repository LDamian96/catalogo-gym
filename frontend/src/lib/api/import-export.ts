import { api } from './client';

// Types
export interface ImportRowResult {
  row: number;
  productName: string;
  success: boolean;
  productId?: string;
  error?: string;
  variantsCreated?: number;
}

export interface ImportResult {
  success: boolean;
  totalRows: number;
  processed: number;
  created: number;
  errors: number;
  results: ImportRowResult[];
  variantTypesCreated: string[];
}

export interface ExportProductsParams {
  categoryId?: string;
  isActive?: boolean;
  format?: 'xlsx' | 'csv';
}

export interface ExportStatsParams {
  startDate?: string;
  endDate?: string;
  type?: 'views' | 'clicks' | 'all';
  format?: 'xlsx' | 'csv';
}

// API Functions

/**
 * POST /import/excel - Importar productos desde Excel
 */
export async function importExcel(file: File): Promise<ImportResult> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post<ImportResult>('/import/excel', formData);
  return response.data;
}

/**
 * GET /import/template - Descargar plantilla de importación
 */
export async function downloadImportTemplate(): Promise<void> {
  const response = await api.get('/import/template', {
    responseType: 'blob',
  });

  // Crear blob y descargar
  const blob = new Blob([response.data], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'plantilla-importacion-productos.xlsx';
  link.click();
  window.URL.revokeObjectURL(url);
}

/**
 * GET /export/products - Exportar productos a Excel
 */
export async function exportProducts(params?: ExportProductsParams): Promise<void> {
  const searchParams = new URLSearchParams();
  if (params?.categoryId) searchParams.set('categoryId', params.categoryId);
  if (params?.isActive !== undefined) searchParams.set('isActive', String(params.isActive));
  if (params?.format) searchParams.set('format', params.format);

  const query = searchParams.toString();
  const url = `/export/products${query ? `?${query}` : ''}`;

  const response = await api.get(url, {
    responseType: 'blob',
  });

  const filename = `productos-${new Date().toISOString().split('T')[0]}.xlsx`;
  downloadBlob(response.data, filename);
}

/**
 * GET /export/categories - Exportar categorías a Excel
 */
export async function exportCategories(): Promise<void> {
  const response = await api.get('/export/categories', {
    responseType: 'blob',
  });

  const filename = `categorias-${new Date().toISOString().split('T')[0]}.xlsx`;
  downloadBlob(response.data, filename);
}

/**
 * GET /export/stats - Exportar estadísticas a Excel
 */
export async function exportStats(params?: ExportStatsParams): Promise<void> {
  const searchParams = new URLSearchParams();
  if (params?.startDate) searchParams.set('startDate', params.startDate);
  if (params?.endDate) searchParams.set('endDate', params.endDate);
  if (params?.type) searchParams.set('type', params.type);
  if (params?.format) searchParams.set('format', params.format);

  const query = searchParams.toString();
  const url = `/export/stats${query ? `?${query}` : ''}`;

  const response = await api.get(url, {
    responseType: 'blob',
  });

  const filename = `estadisticas-${new Date().toISOString().split('T')[0]}.xlsx`;
  downloadBlob(response.data, filename);
}

/**
 * GET /export/template - Descargar plantilla vacía
 */
export async function downloadExportTemplate(): Promise<void> {
  const response = await api.get('/export/template', {
    responseType: 'blob',
  });

  downloadBlob(response.data, 'plantilla-productos.xlsx');
}

// Helper function
function downloadBlob(data: Blob | ArrayBuffer, filename: string): void {
  const blob = data instanceof Blob ? data : new Blob([data]);
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(url);
}
