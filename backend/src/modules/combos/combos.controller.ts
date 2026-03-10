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
import { CombosService } from './combos.service';
import {
  CreateComboDto,
  createComboSchema,
  CreateComboDtoClass,
  UpdateComboDto,
  updateComboSchema,
  UpdateComboDtoClass,
  ReorderCombosDto,
  reorderCombosSchema,
  ReorderCombosDtoClass,
} from './dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Combos')
@Controller('combos')
@ApiBearerAuth('JWT-auth')
export class CombosController {
  constructor(private readonly combosService: CombosService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos los combos' })
  @ApiResponse({ status: 200, description: 'Lista de combos' })
  async findAll() {
    return this.combosService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un combo por ID' })
  @ApiParam({ name: 'id', description: 'ID del combo' })
  @ApiResponse({ status: 200, description: 'Combo encontrado' })
  @ApiResponse({ status: 404, description: 'Combo no encontrado' })
  async findOne(@Param('id') id: string) {
    return this.combosService.findOne(id);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Crear un nuevo combo' })
  @ApiBody({ type: CreateComboDtoClass })
  @ApiResponse({ status: 201, description: 'Combo creado' })
  @ApiResponse({ status: 409, description: 'Slug ya existe' })
  async create(@Body() dto: CreateComboDto) {
    const validated = createComboSchema.parse(dto);
    return this.combosService.create(validated);
  }

  @Patch('reorder')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Reordenar combos' })
  @ApiBody({ type: ReorderCombosDtoClass })
  @ApiResponse({ status: 200, description: 'Combos reordenados' })
  async reorder(@Body() dto: ReorderCombosDto) {
    const validated = reorderCombosSchema.parse(dto);
    return this.combosService.reorder(validated);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Actualizar un combo' })
  @ApiParam({ name: 'id', description: 'ID del combo' })
  @ApiBody({ type: UpdateComboDtoClass })
  @ApiResponse({ status: 200, description: 'Combo actualizado' })
  @ApiResponse({ status: 404, description: 'Combo no encontrado' })
  async update(@Param('id') id: string, @Body() dto: UpdateComboDto) {
    const validated = updateComboSchema.parse(dto);
    return this.combosService.update(id, validated);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un combo' })
  @ApiParam({ name: 'id', description: 'ID del combo' })
  @ApiResponse({ status: 204, description: 'Combo eliminado' })
  @ApiResponse({ status: 404, description: 'Combo no encontrado' })
  async delete(@Param('id') id: string) {
    await this.combosService.delete(id);
  }

  @Post(':id/image')
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Subir imagen del combo' })
  @ApiParam({ name: 'id', description: 'ID del combo' })
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
    return this.combosService.uploadImage(id, file);
  }

  @Delete(':id/image')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Eliminar imagen del combo' })
  @ApiParam({ name: 'id', description: 'ID del combo' })
  @ApiResponse({ status: 200, description: 'Imagen eliminada' })
  async deleteImage(@Param('id') id: string) {
    return this.combosService.deleteImage(id);
  }

  @Post(':id/products')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Agregar producto al combo' })
  @ApiParam({ name: 'id', description: 'ID del combo' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        productId: { type: 'string' },
        quantity: { type: 'number', default: 1 },
      },
      required: ['productId'],
    },
  })
  @ApiResponse({ status: 200, description: 'Producto agregado al combo' })
  async addProduct(
    @Param('id') id: string,
    @Body() body: { productId: string; quantity?: number },
  ) {
    return this.combosService.addProduct(id, body.productId, body.quantity);
  }

  @Delete(':id/products/:productId')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Quitar producto del combo' })
  @ApiParam({ name: 'id', description: 'ID del combo' })
  @ApiParam({ name: 'productId', description: 'ID del producto' })
  @ApiResponse({ status: 200, description: 'Producto quitado del combo' })
  async removeProduct(
    @Param('id') id: string,
    @Param('productId') productId: string,
  ) {
    return this.combosService.removeProduct(id, productId);
  }
}
