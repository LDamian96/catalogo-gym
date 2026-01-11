import { z } from 'zod';

// Query params para exportar productos
export const exportProductsQuerySchema = z.object({
  categoryId: z.string().uuid().optional(),
  isActive: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
  format: z.enum(['xlsx', 'csv']).optional().default('xlsx'),
});

export type ExportProductsQuery = z.infer<typeof exportProductsQuerySchema>;

// Query params para exportar categorías
export const exportCategoriesQuerySchema = z.object({
  format: z.enum(['xlsx', 'csv']).optional().default('xlsx'),
});

export type ExportCategoriesQuery = z.infer<typeof exportCategoriesQuerySchema>;

// Query params para exportar estadísticas
export const exportStatsQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  type: z.enum(['views', 'clicks', 'all']).optional().default('all'),
  format: z.enum(['xlsx', 'csv']).optional().default('xlsx'),
});

export type ExportStatsQuery = z.infer<typeof exportStatsQuerySchema>;
