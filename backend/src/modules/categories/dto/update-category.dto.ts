import { z } from 'zod';
import { ApiPropertyOptional } from '@nestjs/swagger';

export const updateCategorySchema = z.object({
  name: z.string().min(2).max(100).optional(),
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/, 'Slug solo puede contener letras minúsculas, números y guiones').optional(),
  parentId: z.string().cuid().optional().nullable(), // Categoría padre (null = categoría raíz)
  isActive: z.boolean().optional(),
  order: z.number().int().min(0).optional(),
  // SEO
  seoTitle: z.string().max(70).optional().nullable(),
  seoDescription: z.string().max(160).optional().nullable(),
  seoKeywords: z.string().max(200).optional().nullable(),
});

export type UpdateCategoryDto = z.infer<typeof updateCategorySchema>;

export class UpdateCategoryDtoClass implements UpdateCategoryDto {
  @ApiPropertyOptional({ example: 'Electrónicos' })
  name?: string;

  @ApiPropertyOptional({ example: 'electronicos' })
  slug?: string;

  @ApiPropertyOptional({ example: 'clxyz123', description: 'ID de la categoría padre (null = categoría raíz)' })
  parentId?: string | null;

  @ApiPropertyOptional({ example: true })
  isActive?: boolean;

  @ApiPropertyOptional({ example: 0 })
  order?: number;

  @ApiPropertyOptional({ example: 'Productos electrónicos de calidad' })
  seoTitle?: string | null;

  @ApiPropertyOptional({ example: 'Encuentra los mejores electrónicos' })
  seoDescription?: string | null;

  @ApiPropertyOptional({ example: 'electrónicos,tecnología,gadgets' })
  seoKeywords?: string | null;
}
