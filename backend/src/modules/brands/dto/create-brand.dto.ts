import { z } from 'zod';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export const createBrandSchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/, 'Slug solo puede contener letras minúsculas, números y guiones').optional(),
  description: z.string().max(500).optional().nullable(),
  isActive: z.boolean().default(true),
  order: z.number().int().min(0).optional(),
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
}
