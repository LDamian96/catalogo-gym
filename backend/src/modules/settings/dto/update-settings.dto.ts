import { z } from 'zod';
import { ApiPropertyOptional } from '@nestjs/swagger';

export const updateSettingsSchema = z.object({
  businessName: z.string().min(2).max(100).optional(),
  whatsapp: z.string().min(8).max(20).optional(),
  currency: z.string().max(5).optional(),
  description: z.string().max(500).optional().nullable(),
  address: z.string().max(200).optional().nullable(),
  schedule: z.string().max(200).optional().nullable(),
  cartEnabled: z.boolean().optional(),
  variantsEnabled: z.boolean().optional(),
  brandsFilterEnabled: z.boolean().optional(),
  welcomeMessage: z.string().max(500).optional().nullable(),
  // SEO
  seoTitle: z.string().max(70).optional().nullable(),
  seoDescription: z.string().max(160).optional().nullable(),
  seoKeywords: z.string().max(200).optional().nullable(),
  // Tracking
  googleAnalyticsId: z.string().max(50).optional().nullable(),
  googleTagManagerId: z.string().max(50).optional().nullable(),
  facebookPixelId: z.string().max(50).optional().nullable(),
  tiktokPixelId: z.string().max(50).optional().nullable(),
});

export type UpdateSettingsDto = z.infer<typeof updateSettingsSchema>;

export class UpdateSettingsDtoClass implements UpdateSettingsDto {
  @ApiPropertyOptional({ example: 'Mi Negocio' })
  businessName?: string;

  @ApiPropertyOptional({ example: '+51999999999' })
  whatsapp?: string;

  @ApiPropertyOptional({ example: 'S/' })
  currency?: string;

  @ApiPropertyOptional({ example: 'La mejor tienda online' })
  description?: string | null;

  @ApiPropertyOptional({ example: 'Av. Principal 123' })
  address?: string | null;

  @ApiPropertyOptional({ example: 'Lun-Vie: 9am-6pm' })
  schedule?: string | null;

  @ApiPropertyOptional({ example: true })
  cartEnabled?: boolean;

  @ApiPropertyOptional({ example: true })
  variantsEnabled?: boolean;

  @ApiPropertyOptional({ example: true })
  brandsFilterEnabled?: boolean;

  @ApiPropertyOptional({ example: 'Bienvenido a nuestra tienda!' })
  welcomeMessage?: string | null;

  @ApiPropertyOptional({ example: 'Mi Negocio - Productos de Calidad' })
  seoTitle?: string | null;

  @ApiPropertyOptional({ example: 'Descubre nuestros productos' })
  seoDescription?: string | null;

  @ApiPropertyOptional({ example: 'tienda,productos,calidad' })
  seoKeywords?: string | null;

  @ApiPropertyOptional({ example: 'G-XXXXXXXXXX' })
  googleAnalyticsId?: string | null;

  @ApiPropertyOptional({ example: 'GTM-XXXXXXX' })
  googleTagManagerId?: string | null;

  @ApiPropertyOptional({ example: '123456789012345' })
  facebookPixelId?: string | null;

  @ApiPropertyOptional({ example: 'XXXXXXXXXXXXXXXX' })
  tiktokPixelId?: string | null;
}
