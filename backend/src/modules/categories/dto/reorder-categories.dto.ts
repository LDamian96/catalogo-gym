import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

export const reorderCategoriesSchema = z.object({
  items: z.array(
    z.object({
      id: z.string().cuid(),
      order: z.number().int().min(0),
    }),
  ).min(1),
});

export type ReorderCategoriesDto = z.infer<typeof reorderCategoriesSchema>;

class ReorderItemDto {
  @ApiProperty({ example: 'clx123456' })
  id: string;

  @ApiProperty({ example: 0 })
  order: number;
}

export class ReorderCategoriesDtoClass implements ReorderCategoriesDto {
  @ApiProperty({ type: [ReorderItemDto] })
  items: ReorderItemDto[];
}
