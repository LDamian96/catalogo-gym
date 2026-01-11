import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { UserRole } from '@prisma/client';
import { ProductsService } from './products.service';
import {
  CreateProductDto,
  createProductSchema,
  CreateProductDtoClass,
} from './dto/create-product.dto';
import {
  UpdateProductDto,
  updateProductSchema,
  UpdateProductDtoClass,
} from './dto/update-product.dto';
import {
  ProductQueryDto,
  productQuerySchema,
  ProductQueryDtoClass,
} from './dto/product-query.dto';
import {
  ReorderImagesDto,
  reorderImagesSchema,
  ReorderImagesDtoClass,
} from './dto/reorder-images.dto';

@ApiTags('Products')
@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @ApiOperation({ summary: 'Listar productos con paginación y filtros' })
  @ApiQuery({ type: ProductQueryDtoClass })
  @ApiResponse({ status: 200, description: 'Lista de productos paginada' })
  async findAll(
    @Query(new ZodValidationPipe(productQuerySchema)) query: ProductQueryDto,
  ) {
    return this.productsService.findAll(query);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @ApiOperation({ summary: 'Obtener producto por ID' })
  @ApiParam({ name: 'id', description: 'ID del producto' })
  @ApiResponse({ status: 200, description: 'Producto encontrado' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  async findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Crear nuevo producto' })
  @ApiBody({ type: CreateProductDtoClass })
  @ApiResponse({ status: 201, description: 'Producto creado' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 409, description: 'Slug duplicado' })
  async create(
    @Body(new ZodValidationPipe(createProductSchema)) dto: CreateProductDto,
  ) {
    return this.productsService.create(dto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Actualizar producto' })
  @ApiParam({ name: 'id', description: 'ID del producto' })
  @ApiBody({ type: UpdateProductDtoClass })
  @ApiResponse({ status: 200, description: 'Producto actualizado' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  @ApiResponse({ status: 409, description: 'Slug duplicado' })
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateProductSchema)) dto: UpdateProductDto,
  ) {
    return this.productsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Eliminar producto' })
  @ApiParam({ name: 'id', description: 'ID del producto' })
  @ApiResponse({ status: 200, description: 'Producto eliminado' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  async delete(@Param('id') id: string) {
    await this.productsService.delete(id);
    return { message: 'Producto eliminado correctamente' };
  }

  @Post(':id/duplicate')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Duplicar producto' })
  @ApiParam({ name: 'id', description: 'ID del producto a duplicar' })
  @ApiResponse({ status: 201, description: 'Producto duplicado' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  async duplicate(@Param('id') id: string) {
    return this.productsService.duplicate(id);
  }

  @Post(':id/images')
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FilesInterceptor('files', 10)) // Max 10 images
  @ApiOperation({ summary: 'Subir imágenes al producto' })
  @ApiParam({ name: 'id', description: 'ID del producto' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Imágenes subidas' })
  @ApiResponse({ status: 400, description: 'Archivo inválido' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  async uploadImages(
    @Param('id') id: string,
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB per file
          new FileTypeValidator({ fileType: /^image\/(jpeg|png|webp|gif)$/ }),
        ],
        fileIsRequired: true,
      }),
    )
    files: Express.Multer.File[],
  ) {
    return this.productsService.uploadImages(id, files);
  }

  @Delete(':id/images/:imageId')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Eliminar imagen del producto' })
  @ApiParam({ name: 'id', description: 'ID del producto' })
  @ApiParam({ name: 'imageId', description: 'ID de la imagen' })
  @ApiResponse({ status: 200, description: 'Imagen eliminada' })
  @ApiResponse({ status: 404, description: 'Imagen no encontrada' })
  async deleteImage(
    @Param('id') id: string,
    @Param('imageId') imageId: string,
  ) {
    return this.productsService.deleteImage(id, imageId);
  }

  @Patch(':id/images/reorder')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Reordenar imágenes del producto' })
  @ApiParam({ name: 'id', description: 'ID del producto' })
  @ApiBody({ type: ReorderImagesDtoClass })
  @ApiResponse({ status: 200, description: 'Imágenes reordenadas' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  async reorderImages(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(reorderImagesSchema)) dto: ReorderImagesDto,
  ) {
    return this.productsService.reorderImages(id, dto);
  }
}
