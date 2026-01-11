import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { VariantTypesService } from './variant-types.service';
import {
  CreateVariantTypeDto,
  UpdateVariantTypeDto,
  ReorderVariantTypesDto,
  CreateVariantTypeValueDto,
  UpdateVariantTypeValueDto,
} from './dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { IsArray, ValidateNested, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

class ReorderValueItemDto {
  @IsString()
  id: string;

  @IsInt()
  @Min(0)
  order: number;
}

class ReorderValuesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReorderValueItemDto)
  items: ReorderValueItemDto[];
}

@ApiTags('Variant Types')
@ApiBearerAuth('JWT-auth')
@Controller('variant-types')
export class VariantTypesController {
  constructor(private readonly variantTypesService: VariantTypesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos los tipos de variante' })
  @ApiQuery({ name: 'includeInactive', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Lista de tipos de variante' })
  async findAll(@Query('includeInactive') includeInactive?: string) {
    return this.variantTypesService.findAll(includeInactive === 'true');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un tipo de variante por ID' })
  @ApiResponse({ status: 200, description: 'Tipo de variante encontrado' })
  @ApiResponse({ status: 404, description: 'Tipo de variante no encontrado' })
  async findOne(@Param('id') id: string) {
    return this.variantTypesService.findOne(id);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Crear un nuevo tipo de variante' })
  @ApiResponse({ status: 201, description: 'Tipo de variante creado' })
  @ApiResponse({ status: 409, description: 'Ya existe un tipo con ese nombre' })
  async create(@Body() dto: CreateVariantTypeDto) {
    return this.variantTypesService.create(dto);
  }

  @Patch('reorder')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Reordenar tipos de variante' })
  @ApiResponse({ status: 200, description: 'Tipos reordenados' })
  async reorder(@Body() dto: ReorderVariantTypesDto) {
    return this.variantTypesService.reorder(dto.items);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Actualizar un tipo de variante' })
  @ApiResponse({ status: 200, description: 'Tipo de variante actualizado' })
  @ApiResponse({ status: 404, description: 'Tipo de variante no encontrado' })
  async update(@Param('id') id: string, @Body() dto: UpdateVariantTypeDto) {
    return this.variantTypesService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un tipo de variante' })
  @ApiResponse({ status: 204, description: 'Tipo de variante eliminado' })
  @ApiResponse({ status: 404, description: 'Tipo de variante no encontrado' })
  @ApiResponse({ status: 409, description: 'No se puede eliminar porque está en uso' })
  async delete(@Param('id') id: string) {
    await this.variantTypesService.delete(id);
  }

  // =============================================
  // VARIANT TYPE VALUES (Valores predefinidos)
  // =============================================

  @Post(':id/values')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Agregar un valor a un tipo de variante' })
  @ApiParam({ name: 'id', description: 'ID del tipo de variante' })
  @ApiResponse({ status: 201, description: 'Valor creado' })
  @ApiResponse({ status: 404, description: 'Tipo de variante no encontrado' })
  @ApiResponse({ status: 409, description: 'Ya existe ese valor' })
  async createValue(
    @Param('id') variantTypeId: string,
    @Body() dto: CreateVariantTypeValueDto,
  ) {
    return this.variantTypesService.createValue(variantTypeId, dto);
  }

  @Patch('values/:valueId')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Actualizar un valor' })
  @ApiParam({ name: 'valueId', description: 'ID del valor' })
  @ApiResponse({ status: 200, description: 'Valor actualizado' })
  @ApiResponse({ status: 404, description: 'Valor no encontrado' })
  async updateValue(
    @Param('valueId') valueId: string,
    @Body() dto: UpdateVariantTypeValueDto,
  ) {
    return this.variantTypesService.updateValue(valueId, dto);
  }

  @Delete('values/:valueId')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un valor' })
  @ApiParam({ name: 'valueId', description: 'ID del valor' })
  @ApiResponse({ status: 204, description: 'Valor eliminado' })
  @ApiResponse({ status: 404, description: 'Valor no encontrado' })
  async deleteValue(@Param('valueId') valueId: string) {
    await this.variantTypesService.deleteValue(valueId);
  }

  @Patch(':id/values/reorder')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Reordenar valores de un tipo de variante' })
  @ApiParam({ name: 'id', description: 'ID del tipo de variante' })
  @ApiResponse({ status: 200, description: 'Valores reordenados' })
  async reorderValues(
    @Param('id') variantTypeId: string,
    @Body() dto: ReorderValuesDto,
  ) {
    return this.variantTypesService.reorderValues(variantTypeId, dto.items);
  }
}
