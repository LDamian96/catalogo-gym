import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

export const reorderImagesSchema = z.object({
  items: z.array(
    z.object({
      id: z.string().cuid(),
      order: z.number().int().min(0),
    }),
  ),
});

export type ReorderImagesDto = z.infer<typeof reorderImagesSchema>;

class ReorderItem {
  @ApiProperty({ example: 'clxxxxxxxxxxxxxxxxx' })
  id: string;

  @ApiProperty({ example: 0 })
  order: number;
}

export class ReorderImagesDtoClass {
  @ApiProperty({ type: [ReorderItem] })
  items: ReorderItem[];
}
