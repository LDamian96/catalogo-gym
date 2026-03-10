import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

export const reorderCombosSchema = z.object({
  items: z.array(
    z.object({
      id: z.string().cuid(),
      order: z.number().int().min(0),
    }),
  ),
});

export type ReorderCombosDto = z.infer<typeof reorderCombosSchema>;

class ReorderItemClass {
  @ApiProperty({ example: 'clj1234567890' })
  id: string;

  @ApiProperty({ example: 0 })
  order: number;
}

export class ReorderCombosDtoClass {
  @ApiProperty({ type: [ReorderItemClass] })
  items: ReorderItemClass[];
}
