import { IsString, IsOptional, IsNumber, IsInt, IsBoolean, IsArray, ValidateNested, Min, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

class VariantValueDto {
  @ApiPropertyOptional({ description: 'ID del tipo de variante' })
  @IsString()
  variantTypeId: string;

  @ApiPropertyOptional({ description: 'Valor de la variante', example: 'M' })
  @IsString()
  @MaxLength(100)
  value: string;
}

export class UpdateProductVariantDto {
  @ApiPropertyOptional({ description: 'Nombre (null = hereda del padre)' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional({ description: 'Descripción (null = hereda del padre)' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({ description: 'Precio (null = hereda del padre)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({ description: 'Precio de oferta' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  salePrice?: number;

  @ApiPropertyOptional({ description: 'Porcentaje de descuento (0-100)' })
  @IsOptional()
  @IsInt()
  @Min(0)
  discountPercent?: number;

  @ApiPropertyOptional({ description: 'Stock (null = hereda del padre)' })
  @IsOptional()
  @IsInt()
  @Min(0)
  stock?: number;

  @ApiPropertyOptional({ description: 'SKU único' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  sku?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Valores de variante', type: [VariantValueDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VariantValueDto)
  variantValues?: VariantValueDto[];
}
