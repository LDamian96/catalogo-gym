import { z } from 'zod';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PixelType } from '@prisma/client';

export const createTrackingPixelSchema = z.object({
  name: z.string().min(2).max(50),
  type: z.nativeEnum(PixelType),
  pixelId: z.string().min(5).max(100),
  isActive: z.boolean().optional().default(true),
  config: z.any().optional(),
});

export type CreateTrackingPixelDto = z.infer<typeof createTrackingPixelSchema>;

export class CreateTrackingPixelDtoClass {
  @ApiProperty({ example: 'Mi Pixel de Facebook' })
  name: string;

  @ApiProperty({
    enum: PixelType,
    example: 'FACEBOOK',
    description: 'Tipo de pixel: GOOGLE_ADS, FACEBOOK, TIKTOK, SNAPCHAT, PINTEREST, TWITTER, LINKEDIN, CUSTOM',
  })
  type: PixelType;

  @ApiProperty({ example: '123456789012345' })
  pixelId: string;

  @ApiPropertyOptional({ example: true, default: true })
  isActive?: boolean;

  @ApiPropertyOptional({
    example: { customEvent: 'Purchase' },
    description: 'Configuración adicional del pixel',
  })
  config?: unknown;
}
