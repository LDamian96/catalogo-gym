import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsBoolean, IsInt, IsOptional, Min, MinLength, MaxLength } from 'class-validator';

export class CreateVariantTypeValueDto {
  @ApiProperty({ description: 'Valor (ej: S, M, L, Negro, Blanco)', example: 'M' })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  value: string;

  @ApiPropertyOptional({ description: 'Orden de display', example: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;

  @ApiPropertyOptional({ description: 'Estado activo', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
