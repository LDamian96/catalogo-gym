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
import { BrandsService } from './brands.service';
import {
  CreateBrandDto,
  createBrandSchema,
  CreateBrandDtoClass,
  UpdateBrandDto,
  updateBrandSchema,
  UpdateBrandDtoClass,
  ReorderBrandsDto,
  reorderBrandsSchema,
  ReorderBrandsDtoClass,
} from './dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Brands')
@Controller('brands')
@ApiBearerAuth('JWT-auth')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todas las marcas' })
  @ApiResponse({ status: 200, description: 'Lista de marcas' })
  async findAll() {
    return this.brandsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una marca por ID' })
  @ApiParam({ name: 'id', description: 'ID de la marca' })
  @ApiResponse({ status: 200, description: 'Marca encontrada' })
  @ApiResponse({ status: 404, description: 'Marca no encontrada' })
  async findOne(@Param('id') id: string) {
    return this.brandsService.findOne(id);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Crear una nueva marca' })
  @ApiBody({ type: CreateBrandDtoClass })
  @ApiResponse({ status: 201, description: 'Marca creada' })
  @ApiResponse({ status: 409, description: 'Slug ya existe' })
  async create(@Body() dto: CreateBrandDto) {
    const validated = createBrandSchema.parse(dto);
    return this.brandsService.create(validated);
  }

  @Patch('reorder')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Reordenar marcas' })
  @ApiBody({ type: ReorderBrandsDtoClass })
  @ApiResponse({ status: 200, description: 'Marcas reordenadas' })
  async reorder(@Body() dto: ReorderBrandsDto) {
    const validated = reorderBrandsSchema.parse(dto);
    return this.brandsService.reorder(validated);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Actualizar una marca' })
  @ApiParam({ name: 'id', description: 'ID de la marca' })
  @ApiBody({ type: UpdateBrandDtoClass })
  @ApiResponse({ status: 200, description: 'Marca actualizada' })
  @ApiResponse({ status: 404, description: 'Marca no encontrada' })
  async update(@Param('id') id: string, @Body() dto: UpdateBrandDto) {
    const validated = updateBrandSchema.parse(dto);
    return this.brandsService.update(id, validated);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar una marca' })
  @ApiParam({ name: 'id', description: 'ID de la marca' })
  @ApiResponse({ status: 204, description: 'Marca eliminada' })
  @ApiResponse({ status: 404, description: 'Marca no encontrada' })
  async delete(@Param('id') id: string) {
    await this.brandsService.delete(id);
  }

  @Post(':id/logo')
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Subir logo de marca' })
  @ApiParam({ name: 'id', description: 'ID de la marca' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Logo subido' })
  async uploadLogo(
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
    return this.brandsService.uploadLogo(id, file);
  }

  @Delete(':id/logo')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Eliminar logo de marca' })
  @ApiParam({ name: 'id', description: 'ID de la marca' })
  @ApiResponse({ status: 200, description: 'Logo eliminado' })
  async deleteLogo(@Param('id') id: string) {
    return this.brandsService.deleteLogo(id);
  }
}
