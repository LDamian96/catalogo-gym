import { IsArray, ValidateNested, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class ReorderItemDto {
  @ApiProperty({ description: 'ID del tipo de variante' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'Nueva posición', minimum: 0 })
  @IsInt()
  @Min(0)
  order: number;
}

export class ReorderVariantTypesDto {
  @ApiProperty({ type: [ReorderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReorderItemDto)
  items: ReorderItemDto[];
}
