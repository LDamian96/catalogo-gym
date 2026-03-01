import { z } from 'zod';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export const createBrandSchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/, 'Slug solo puede contener letras minúsculas, números y guiones').optional(),
  description: z.string().max(500).optional().nullable(),
  isActive: z.boolean().default(true),
  order: z.number().int().min(0).optional(),
  // SEO
  seoTitle: z.string().max(70).optional().nullable(),
  seoDescription: z.string().max(160).optional().nullable(),
  seoKeywords: z.string().max(200).optional().nullable(),
});

export type CreateBrandDto = z.infer<typeof createBrandSchema>;

export class CreateBrandDtoClass {
  @ApiProperty({ example: 'Nike' })
  name: string;

  @ApiPropertyOptional({ example: 'nike' })
  slug?: string;

  @ApiPropertyOptional({ example: 'Marca deportiva líder mundial' })
  description?: string | null;

  @ApiPropertyOptional({ example: true, default: true })
  isActive?: boolean;

  @ApiPropertyOptional({ example: 0 })
  order?: number;

  @ApiPropertyOptional({ example: 'Nike - Zapatillas y Ropa Deportiva' })
  seoTitle?: string | null;

  @ApiPropertyOptional({ example: 'Descubre la colección Nike' })
  seoDescription?: string | null;

  @ApiPropertyOptional({ example: 'nike,zapatillas,deportiva' })
  seoKeywords?: string | null;
}
