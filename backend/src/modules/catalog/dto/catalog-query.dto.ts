import { z } from 'zod';
import { ApiPropertyOptional } from '@nestjs/swagger';

// Schema para query de productos en categoría
export const catalogCategoryQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
  sortBy: z.enum(['order', 'price', 'name', 'createdAt']).default('order'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  brandId: z.string().cuid().optional(),
});

export type CatalogCategoryQueryDto = z.infer<typeof catalogCategoryQuerySchema>;

export class CatalogCategoryQueryDtoClass {
  @ApiPropertyOptional({ example: 1, default: 1 })
  page?: number;

  @ApiPropertyOptional({ example: 12, default: 12 })
  limit?: number;

  @ApiPropertyOptional({ enum: ['order', 'price', 'name', 'createdAt'], default: 'order' })
  sortBy?: 'order' | 'price' | 'name' | 'createdAt';

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'asc' })
  sortOrder?: 'asc' | 'desc';

  @ApiPropertyOptional({ example: 10 })
  minPrice?: number;

  @ApiPropertyOptional({ example: 500 })
  maxPrice?: number;

  @ApiPropertyOptional({ example: 'clxxxxxxxxx' })
  brandId?: string;
}

// Schema para búsqueda
export const catalogSearchQuerySchema = z.object({
  q: z.string().max(100).default(''),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
  categoryId: z.string().cuid().optional(),
  brandId: z.string().cuid().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
});

export type CatalogSearchQueryDto = z.infer<typeof catalogSearchQuerySchema>;

export class CatalogSearchQueryDtoClass {
  @ApiPropertyOptional({ example: 'zapatilla', description: 'Query de búsqueda (vacío = todos los productos)' })
  q?: string;

  @ApiPropertyOptional({ example: 1, default: 1 })
  page?: number;

  @ApiPropertyOptional({ example: 12, default: 12 })
  limit?: number;

  @ApiPropertyOptional({ example: 'clxxxxxxxxx' })
  categoryId?: string;

  @ApiPropertyOptional({ example: 'clxxxxxxxxx' })
  brandId?: string;

  @ApiPropertyOptional({ example: 10 })
  minPrice?: number;

  @ApiPropertyOptional({ example: 500 })
  maxPrice?: number;
}
