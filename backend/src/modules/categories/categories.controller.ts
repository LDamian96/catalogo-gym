import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
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
import { CategoriesService } from './categories.service';
import {
  CreateCategoryDto,
  createCategorySchema,
  CreateCategoryDtoClass,
  UpdateCategoryDto,
  updateCategorySchema,
  UpdateCategoryDtoClass,
  ReorderCategoriesDto,
  reorderCategoriesSchema,
  ReorderCategoriesDtoClass,
} from './dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Categories')
@Controller('categories')
@ApiBearerAuth('JWT-auth')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todas las categorias (plano)' })
  @ApiResponse({ status: 200, description: 'Lista de categorias' })
  async findAll() {
    return this.categoriesService.findAll();
  }

  @Get('tree')
  @ApiOperation({ summary: 'Obtener categorias en formato árbol jerárquico' })
  @ApiResponse({ status: 200, description: 'Árbol de categorias' })
  async findAllTree() {
    return this.categoriesService.findAllTree();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una categoria por ID' })
  @ApiParam({ name: 'id', description: 'ID de la categoria' })
  @ApiResponse({ status: 200, description: 'Categoria encontrada' })
  @ApiResponse({ status: 404, description: 'Categoria no encontrada' })
  async findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  @Get(':id/ancestors')
  @ApiOperation({ summary: 'Obtener ancestros (breadcrumb) de una categoria' })
  @ApiParam({ name: 'id', description: 'ID de la categoria' })
  @ApiResponse({ status: 200, description: 'Lista de ancestros' })
  async getAncestors(@Param('id') id: string) {
    return this.categoriesService.getAncestors(id);
  }

  @Get(':id/descendants')
  @ApiOperation({ summary: 'Obtener todos los descendientes de una categoria' })
  @ApiParam({ name: 'id', description: 'ID de la categoria' })
  @ApiResponse({ status: 200, description: 'Lista de descendientes' })
  async getDescendants(@Param('id') id: string) {
    return this.categoriesService.getDescendants(id);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Crear una nueva categoria' })
  @ApiBody({ type: CreateCategoryDtoClass })
  @ApiResponse({ status: 201, description: 'Categoria creada' })
  @ApiResponse({ status: 409, description: 'Slug ya existe' })
  async create(@Body() dto: CreateCategoryDto) {
    const validated = createCategorySchema.parse(dto);
    return this.categoriesService.create(validated);
  }

  @Patch('reorder')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Reordenar categorias' })
  @ApiBody({ type: ReorderCategoriesDtoClass })
  @ApiResponse({ status: 200, description: 'Categorias reordenadas' })
  async reorder(@Body() dto: ReorderCategoriesDto) {
    const validated = reorderCategoriesSchema.parse(dto);
    return this.categoriesService.reorder(validated);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Actualizar una categoria' })
  @ApiParam({ name: 'id', description: 'ID de la categoria' })
  @ApiBody({ type: UpdateCategoryDtoClass })
  @ApiResponse({ status: 200, description: 'Categoria actualizada' })
  @ApiResponse({ status: 404, description: 'Categoria no encontrada' })
  async update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    const validated = updateCategorySchema.parse(dto);
    return this.categoriesService.update(id, validated);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar una categoria' })
  @ApiParam({ name: 'id', description: 'ID de la categoria' })
  @ApiResponse({ status: 204, description: 'Categoria eliminada' })
  @ApiResponse({ status: 404, description: 'Categoria no encontrada' })
  async delete(@Param('id') id: string) {
    await this.categoriesService.delete(id);
  }

  @Post(':id/image')
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Subir imagen de categoria' })
  @ApiParam({ name: 'id', description: 'ID de la categoria' })
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
    return this.categoriesService.uploadImage(id, file);
  }

  @Delete(':id/image')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Eliminar imagen de categoria' })
  @ApiParam({ name: 'id', description: 'ID de la categoria' })
  @ApiResponse({ status: 200, description: 'Imagen eliminada' })
  async deleteImage(@Param('id') id: string) {
    return this.categoriesService.deleteImage(id);
  }
}

