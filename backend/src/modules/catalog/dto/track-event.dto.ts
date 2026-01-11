import { z } from 'zod';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// Tipos de evento válidos
const eventTypes = [
  'PAGE_VIEW',
  'PRODUCT_VIEW',
  'WHATSAPP_CLICK',
  'CATEGORY_VIEW',
  'SEARCH',
  'ADD_TO_CART',
  'CHECKOUT_START',
  'PURCHASE',
] as const;

export const trackEventSchema = z.object({
  type: z.enum(eventTypes),
  productId: z.string().cuid().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export type TrackEventDto = z.infer<typeof trackEventSchema>;

export class TrackEventDtoClass {
  @ApiProperty({
    enum: eventTypes,
    example: 'PRODUCT_VIEW',
    description: 'Tipo de evento a trackear',
  })
  type: (typeof eventTypes)[number];

  @ApiPropertyOptional({
    example: 'clxxxxxxxxx',
    description: 'ID del producto (si aplica)',
  })
  productId?: string;

  @ApiPropertyOptional({
    example: { searchTerm: 'zapatilla', results: 10 },
    description: 'Metadata adicional del evento',
  })
  metadata?: Record<string, unknown>;
}
