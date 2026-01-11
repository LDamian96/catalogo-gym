import { z } from 'zod';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PixelType } from '@prisma/client';

export const updateTrackingPixelSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  type: z.nativeEnum(PixelType).optional(),
  pixelId: z.string().min(5).max(100).optional(),
  isActive: z.boolean().optional(),
  config: z.any().optional(),
});

export type UpdateTrackingPixelDto = z.infer<typeof updateTrackingPixelSchema>;

export class UpdateTrackingPixelDtoClass {
  @ApiPropertyOptional({ example: 'Mi Pixel de Facebook' })
  name?: string;

  @ApiPropertyOptional({
    enum: PixelType,
    example: 'FACEBOOK',
  })
  type?: PixelType;

  @ApiPropertyOptional({ example: '123456789012345' })
  pixelId?: string;

  @ApiPropertyOptional({ example: true })
  isActive?: boolean;

  @ApiPropertyOptional({
    example: { customEvent: 'Purchase' },
  })
  config?: unknown;
}
