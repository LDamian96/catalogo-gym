import { z } from 'zod';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export const createCategorySchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/, 'Slug solo puede contener letras minúsculas, números y guiones').optional(),
  parentId: z.string().cuid().optional().nullable(), // Categoría padre (null = categoría raíz)
  isActive: z.boolean().default(true),
  order: z.number().int().min(0).optional(),
  // SEO
  seoTitle: z.string().max(70).optional().nullable(),
  seoDescription: z.string().max(160).optional().nullable(),
  seoKeywords: z.string().max(200).optional().nullable(),
});

export type CreateCategoryDto = z.infer<typeof createCategorySchema>;

export class CreateCategoryDtoClass {
  @ApiProperty({ example: 'Electrónicos' })
  name: string;

  @ApiPropertyOptional({ example: 'electronicos' })
  slug?: string;

  @ApiPropertyOptional({ example: 'clxyz123', description: 'ID de la categoría padre (null = categoría raíz)' })
  parentId?: string | null;

  @ApiPropertyOptional({ example: true, default: true })
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
