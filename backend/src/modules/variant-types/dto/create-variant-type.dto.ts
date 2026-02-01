import { IsString, IsOptional, IsBoolean, IsInt, MinLength, MaxLength, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateVariantTypeDto {
  @ApiProperty({ description: 'Nombre del tipo de variante', example: 'Talla' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ description: 'Descripción del tipo', example: 'Tallas de ropa y calzado' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Mostrar como filtro en /productos', default: false })
  @IsOptional()
  @IsBoolean()
  showAsFilter?: boolean;

  @ApiPropertyOptional({ description: 'Mostrar en landing page', default: false })
  @IsOptional()
  @IsBoolean()
  showInLanding?: boolean;
}
