import { z } from 'zod';
import { ApiPropertyOptional } from '@nestjs/swagger';

export const updateBrandSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/, 'Slug solo puede contener letras minúsculas, números y guiones').optional(),
  description: z.string().max(500).optional().nullable(),
  isActive: z.boolean().optional(),
  order: z.number().int().min(0).optional(),
});

export type UpdateBrandDto = z.infer<typeof updateBrandSchema>;

export class UpdateBrandDtoClass {
  @ApiPropertyOptional({ example: 'Nike' })
  name?: string;

  @ApiPropertyOptional({ example: 'nike' })
  slug?: string;

  @ApiPropertyOptional({ example: 'Marca deportiva líder mundial' })
  description?: string | null;

  @ApiPropertyOptional({ example: true })
  isActive?: boolean;

  @ApiPropertyOptional({ example: 0 })
  order?: number;
}
