import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { VariantsService } from './variants.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import {
  CreateProductVariantDto,
  UpdateProductVariantDto,
  createVariantValueImageSchema,
  CreateVariantValueImageDto,
  reorderVariantValueImagesSchema,
  ReorderVariantValueImagesDto,
  setImageVariantTypeSchema,
  SetImageVariantTypeDto,
} from './dto';
import { IsArray, ValidateNested, IsString, IsInt, Min, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

class ReorderItemDto {
  @IsString()
  id: string;

  @IsInt()
  @Min(0)
  order: number;
}

class ReorderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReorderItemDto)
  items: ReorderItemDto[];
}

@ApiTags('Product Variants')
@ApiBearerAuth('JWT-auth')
@Controller()
export class VariantsController {
  constructor(private readonly variantsService: VariantsService) {}

  // =============================================
  // PRODUCT VARIANTS (Sub-productos)
  // =============================================

  @Get('products/:productId/variants')
  @ApiOperation({ summary: 'Listar variantes (sub-productos) de un producto' })
  @ApiParam({ name: 'productId', description: 'ID del producto' })
  @ApiResponse({ status: 200, description: 'Lista de variantes' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  async findByProduct(@Param('productId') productId: string) {
    return this.variantsService.findByProduct(productId);
  }

  @Get('product-variants/:id')
  @ApiOperation({ summary: 'Obtener una variante por ID' })
  @ApiParam({ name: 'id', description: 'ID de la variante' })
  @ApiResponse({ status: 200, description: 'Variante encontrada' })
  @ApiResponse({ status: 404, description: 'Variante no encontrada' })
  async findOne(@Param('id') id: string) {
    return this.variantsService.findOne(id);
  }

  @Post('products/:productId/variants')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Crear una variante (sub-producto)' })
  @ApiParam({ name: 'productId', description: 'ID del producto padre' })
  @ApiBody({ type: CreateProductVariantDto })
  @ApiResponse({ status: 201, description: 'Variante creada' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  async create(
    @Param('productId') productId: string,
    @Body() dto: CreateProductVariantDto,
  ) {
    return this.variantsService.create(productId, dto);
  }

  @Patch('product-variants/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Actualizar una variante' })
  @ApiParam({ name: 'id', description: 'ID de la variante' })
  @ApiBody({ type: UpdateProductVariantDto })
  @ApiResponse({ status: 200, description: 'Variante actualizada' })
  @ApiResponse({ status: 404, description: 'Variante no encontrada' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProductVariantDto,
  ) {
    return this.variantsService.update(id, dto);
  }

  @Delete('product-variants/:id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar una variante' })
  @ApiParam({ name: 'id', description: 'ID de la variante' })
  @ApiResponse({ status: 204, description: 'Variante eliminada' })
  @ApiResponse({ status: 404, description: 'Variante no encontrada' })
  async delete(@Param('id') id: string) {
    await this.variantsService.delete(id);
  }

  @Post('product-variants/:id/image')
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Subir imagen de variante' })
  @ApiParam({ name: 'id', description: 'ID de la variante' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Imagen subida' })
  @ApiResponse({ status: 404, description: 'Variante no encontrada' })
  async uploadImage(
    @Param('id') id: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /^image\/(jpeg|png|webp|gif)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.variantsService.uploadImage(id, file);
  }

  @Delete('product-variants/:id/image')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Eliminar imagen de variante' })
  @ApiParam({ name: 'id', description: 'ID de la variante' })
  @ApiResponse({ status: 200, description: 'Imagen eliminada' })
  @ApiResponse({ status: 404, description: 'Variante no encontrada' })
  async deleteImage(@Param('id') id: string) {
    return this.variantsService.deleteImage(id);
  }

  @Patch('products/:productId/variants/reorder')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Reordenar variantes de un producto' })
  @ApiParam({ name: 'productId', description: 'ID del producto' })
  @ApiBody({ type: ReorderDto })
  @ApiResponse({ status: 200, description: 'Variantes reordenadas' })
  async reorder(
    @Param('productId') productId: string,
    @Body() dto: ReorderDto,
  ) {
    return this.variantsService.reorder(productId, dto.items);
  }

  @Post('products/:productId/variants/generate')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Generar todas las combinaciones de variantes automáticamente' })
  @ApiParam({ name: 'productId', description: 'ID del producto' })
  @ApiResponse({
    status: 201,
    description: 'Combinaciones generadas',
    schema: {
      type: 'object',
      properties: {
        created: { type: 'number', description: 'Variantes creadas' },
        skipped: { type: 'number', description: 'Combinaciones ya existentes' },
        variants: { type: 'array', description: 'Lista de todas las variantes' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'No hay valores de variante configurados' })
  async generateCombinations(@Param('productId') productId: string) {
    return this.variantsService.generateCombinations(productId);
  }

  @Delete('products/:productId/variants')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar todas las variantes de un producto' })
  @ApiParam({ name: 'productId', description: 'ID del producto' })
  @ApiResponse({ status: 204, description: 'Variantes eliminadas' })
  async deleteAllVariants(@Param('productId') productId: string) {
    await this.variantsService.deleteAllVariants(productId);
  }

  // =============================================
  // VARIANT VALUE IMAGES (Imágenes por valor de variante)
  // Ejemplo: Color "Negro" tiene múltiples imágenes
  // =============================================

  @Get('products/:productId/variant-value-images')
  @ApiOperation({ summary: 'Obtener todas las imágenes por valor de variante' })
  @ApiParam({ name: 'productId', description: 'ID del producto' })
  @ApiResponse({ status: 200, description: 'Lista de imágenes agrupadas por valor' })
  async getVariantValueImages(@Param('productId') productId: string) {
    return this.variantsService.getVariantValueImages(productId);
  }

  @Get('products/:productId/variant-value-images/config')
  @ApiOperation({ summary: 'Obtener configuración de imágenes por variante' })
  @ApiParam({ name: 'productId', description: 'ID del producto' })
  @ApiResponse({ status: 200, description: 'Configuración con imágenes agrupadas' })
  async getImageVariantConfig(@Param('productId') productId: string) {
    return this.variantsService.getImageVariantConfig(productId);
  }

  @Get('products/:productId/variant-value-images/by-value')
  @ApiOperation({ summary: 'Obtener imágenes de un valor específico (ej: Color=Negro)' })
  @ApiParam({ name: 'productId', description: 'ID del producto' })
  @ApiResponse({ status: 200, description: 'Lista de imágenes del valor' })
  async getImagesByValue(
    @Param('productId') productId: string,
    @Query('variantTypeId') variantTypeId: string,
    @Query('value') value: string,
  ) {
    return this.variantsService.getImagesByValue(productId, variantTypeId, value);
  }

  @Post('products/:productId/variant-value-images')
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Subir imagen para un valor de variante (ej: Color=Negro)' })
  @ApiParam({ name: 'productId', description: 'ID del producto' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file', 'variantTypeId', 'value'],
      properties: {
        file: { type: 'string', format: 'binary' },
        variantTypeId: { type: 'string', description: 'ID del tipo de variante (ej: Color)' },
        value: { type: 'string', description: 'Valor (ej: Negro, Blanco)' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Imagen subida' })
  async uploadVariantValueImage(
    @Param('productId') productId: string,
    @Body(new ZodValidationPipe(createVariantValueImageSchema)) dto: CreateVariantValueImageDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /^image\/(jpeg|png|webp|gif)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.variantsService.uploadVariantValueImage(productId, dto, file);
  }

  @Delete('variant-value-images/:imageId')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar una imagen de valor de variante' })
  @ApiParam({ name: 'imageId', description: 'ID de la imagen' })
  @ApiResponse({ status: 204, description: 'Imagen eliminada' })
  async deleteVariantValueImage(@Param('imageId') imageId: string) {
    await this.variantsService.deleteVariantValueImage(imageId);
  }

  @Delete('products/:productId/variant-value-images/by-value')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar todas las imágenes de un valor específico' })
  @ApiParam({ name: 'productId', description: 'ID del producto' })
  @ApiResponse({ status: 204, description: 'Imágenes eliminadas' })
  async deleteAllImagesByValue(
    @Param('productId') productId: string,
    @Query('variantTypeId') variantTypeId: string,
    @Query('value') value: string,
  ) {
    await this.variantsService.deleteAllImagesByValue(productId, variantTypeId, value);
  }

  @Patch('products/:productId/variant-value-images/reorder')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Reordenar imágenes de valores de variante' })
  @ApiParam({ name: 'productId', description: 'ID del producto' })
  @ApiBody({ type: ReorderDto })
  @ApiResponse({ status: 200, description: 'Imágenes reordenadas' })
  async reorderVariantValueImages(
    @Param('productId') productId: string,
    @Body() dto: ReorderDto,
  ) {
    return this.variantsService.reorderVariantValueImages(productId, dto.items);
  }

  @Patch('products/:productId/image-variant-type')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Establecer qué tipo de variante tiene imágenes vinculadas' })
  @ApiParam({ name: 'productId', description: 'ID del producto' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        variantTypeId: { type: 'string', nullable: true, description: 'ID del tipo o null para desactivar' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Tipo de variante actualizado' })
  async setImageVariantType(
    @Param('productId') productId: string,
    @Body(new ZodValidationPipe(setImageVariantTypeSchema)) dto: SetImageVariantTypeDto,
  ) {
    return this.variantsService.setImageVariantType(productId, dto.variantTypeId);
  }
}
