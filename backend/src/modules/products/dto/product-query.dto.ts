import { z } from 'zod';
import { ApiPropertyOptional } from '@nestjs/swagger';

export const productQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  categoryId: z.string().cuid().optional(),
  brandId: z.string().cuid().optional(),
  search: z.string().max(100).optional(),
  isActive: z
    .string()
    .optional()
    .transform((val) => {
      if (val === 'true') return true;
      if (val === 'false') return false;
      return undefined;
    }),
  isFeatured: z
    .string()
    .optional()
    .transform((val) => {
      if (val === 'true') return true;
      if (val === 'false') return false;
      return undefined;
    }),
  sortBy: z.enum(['name', 'price', 'createdAt', 'order']).default('order'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export type ProductQueryDto = z.infer<typeof productQuerySchema>;

export class ProductQueryDtoClass {
  @ApiPropertyOptional({ example: 1, default: 1 })
  page?: number;

  @ApiPropertyOptional({ example: 20, default: 20 })
  limit?: number;

  @ApiPropertyOptional({ example: 'clxxxxxxxxxxxxxxxxx' })
  categoryId?: string;

  @ApiPropertyOptional({ example: 'clxxxxxxxxxxxxxxxxx' })
  brandId?: string;

  @ApiPropertyOptional({ example: 'iphone' })
  search?: string;

  @ApiPropertyOptional({ example: 'true' })
  isActive?: string;

  @ApiPropertyOptional({ example: 'true' })
  isFeatured?: string;

  @ApiPropertyOptional({ example: 'order', enum: ['name', 'price', 'createdAt', 'order'] })
  sortBy?: string;

  @ApiPropertyOptional({ example: 'asc', enum: ['asc', 'desc'] })
  sortOrder?: string;
}

// Response type for paginated products
export interface PaginatedProducts<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}
