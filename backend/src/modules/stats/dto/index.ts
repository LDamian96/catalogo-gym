import { z } from 'zod';

// Query para dashboard
export const dashboardQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  period: z.enum(['today', 'week', 'month', 'year', 'custom']).default('month'),
});

export type DashboardQueryDto = z.infer<typeof dashboardQuerySchema>;

// Query para stats de producto
export const productStatsQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  period: z.enum(['today', 'week', 'month', 'year', 'custom']).default('month'),
});

export type ProductStatsQueryDto = z.infer<typeof productStatsQuerySchema>;
