import { z } from 'zod';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export const createComboSchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/, 'Slug solo puede contener letras minúsculas, números y guiones').optional(),
  description: z.string().max(500).optional().nullable(),
  price: z.number().positive(),
  salePrice: z.number().positive().optional().nullable(),
  discountPercent: z.number().int().min(0).max(100).optional().nullable(),
  isActive: z.boolean().default(true),
  order: z.number().int().min(0).optional(),
  // SEO
  seoTitle: z.string().max(70).optional().nullable(),
  seoDescription: z.string().max(160).optional().nullable(),
  seoKeywords: z.string().max(200).optional().nullable(),
});

export type CreateComboDto = z.infer<typeof createComboSchema>;

export class CreateComboDtoClass {
  @ApiProperty({ example: 'Combo Fuerza' })
  name: string;

  @ApiPropertyOptional({ example: 'combo-fuerza' })
  slug?: string;

  @ApiPropertyOptional({ example: 'Whey 5lb + Creatina 300g' })
  description?: string | null;

  @ApiProperty({ example: 89.99 })
  price: number;

  @ApiPropertyOptional({ example: 74.99 })
  salePrice?: number | null;

  @ApiPropertyOptional({ example: 15 })
  discountPercent?: number | null;

  @ApiPropertyOptional({ example: true, default: true })
  isActive?: boolean;

  @ApiPropertyOptional({ example: 0 })
  order?: number;

  @ApiPropertyOptional({ example: 'Combo Fuerza - Whey + Creatina' })
  seoTitle?: string | null;

  @ApiPropertyOptional({ example: 'Ahorra con nuestro combo de fuerza' })
  seoDescription?: string | null;

  @ApiPropertyOptional({ example: 'combo,fuerza,whey,creatina' })
  seoKeywords?: string | null;
}
