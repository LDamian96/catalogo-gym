import { z } from 'zod';
import { ApiPropertyOptional } from '@nestjs/swagger';

// Schema para valores de variante del producto
const variantValueSchema = z.object({
  variantTypeId: z.string().cuid(),
  value: z.string().min(1).max(100),
});

export const updateProductSchema = z.object({
  categoryId: z.string().cuid().optional(),
  brandId: z.string().cuid().optional().nullable(),
  name: z.string().min(2).max(100).optional(),
  slug: z
    .string()
    .min(2)
    .max(100)
    .regex(
      /^[a-z0-9-]+$/,
      'Slug solo puede contener letras minúsculas, números y guiones',
    )
    .optional(),
  description: z.string().max(2000).optional().nullable(),
  price: z.number().positive().optional(),
  salePrice: z.number().positive().optional().nullable(),
  showPrice: z.boolean().optional(),
  stock: z.number().int().min(0).optional().nullable(),
  showStock: z.boolean().optional(),
  stockMessage: z.string().max(100).optional().nullable(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  order: z.number().int().min(0).optional(),
  // SEO
  seoTitle: z.string().max(70).optional().nullable(),
  seoDescription: z.string().max(160).optional().nullable(),
  seoKeywords: z.string().max(200).optional().nullable(),
  // Variant values (Talla=M, Color=Negro, etc.)
  variantValues: z.array(variantValueSchema).optional(),
});

export type UpdateProductDto = z.infer<typeof updateProductSchema>;

export class UpdateProductDtoClass {
  @ApiPropertyOptional({ example: 'clxxxxxxxxxxxxxxxxx' })
  categoryId?: string;

  @ApiPropertyOptional({ example: 'clxxxxxxxxxxxxxxxxx' })
  brandId?: string | null;

  @ApiPropertyOptional({ example: 'iPhone 15 Pro Max' })
  name?: string;

  @ApiPropertyOptional({ example: 'iphone-15-pro-max' })
  slug?: string;

  @ApiPropertyOptional({ example: 'El smartphone más avanzado de Apple' })
  description?: string | null;

  @ApiPropertyOptional({ example: 4999.99 })
  price?: number;

  @ApiPropertyOptional({ example: 4499.99 })
  salePrice?: number | null;

  @ApiPropertyOptional({ example: true })
  showPrice?: boolean;

  @ApiPropertyOptional({ example: 50 })
  stock?: number | null;

  @ApiPropertyOptional({ example: false })
  showStock?: boolean;

  @ApiPropertyOptional({ example: 'Últimas unidades disponibles' })
  stockMessage?: string | null;

  @ApiPropertyOptional({ example: true })
  isActive?: boolean;

  @ApiPropertyOptional({ example: false })
  isFeatured?: boolean;

  @ApiPropertyOptional({ example: 0 })
  order?: number;

  @ApiPropertyOptional({ example: 'iPhone 15 Pro Max - Mejor precio' })
  seoTitle?: string | null;

  @ApiPropertyOptional({ example: 'Compra el nuevo iPhone 15 Pro Max' })
  seoDescription?: string | null;

  @ApiPropertyOptional({ example: 'iphone,apple,smartphone' })
  seoKeywords?: string | null;

  @ApiPropertyOptional({
    example: [
      { variantTypeId: 'clxxx...', value: 'M' },
      { variantTypeId: 'clyyy...', value: 'Negro' },
    ],
    description: 'Valores de variante del producto (Talla=M, Color=Negro, etc.)',
  })
  variantValues?: { variantTypeId: string; value: string }[];
}
