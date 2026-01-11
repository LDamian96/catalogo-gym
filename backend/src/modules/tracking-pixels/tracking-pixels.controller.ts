import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { TrackingPixelsService } from './tracking-pixels.service';
import {
  CreateTrackingPixelDto,
  createTrackingPixelSchema,
  CreateTrackingPixelDtoClass,
  UpdateTrackingPixelDto,
  updateTrackingPixelSchema,
  UpdateTrackingPixelDtoClass,
} from './dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Tracking Pixels')
@Controller('tracking-pixels')
@ApiBearerAuth('JWT-auth')
export class TrackingPixelsController {
  constructor(private readonly trackingPixelsService: TrackingPixelsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos los pixels de tracking' })
  @ApiResponse({ status: 200, description: 'Lista de pixels' })
  async findAll() {
    return this.trackingPixelsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un pixel por ID' })
  @ApiParam({ name: 'id', description: 'ID del pixel' })
  @ApiResponse({ status: 200, description: 'Pixel encontrado' })
  @ApiResponse({ status: 404, description: 'Pixel no encontrado' })
  async findOne(@Param('id') id: string) {
    return this.trackingPixelsService.findOne(id);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Crear un nuevo pixel de tracking' })
  @ApiBody({ type: CreateTrackingPixelDtoClass })
  @ApiResponse({ status: 201, description: 'Pixel creado' })
  async create(@Body() dto: CreateTrackingPixelDto) {
    const validated = createTrackingPixelSchema.parse(dto);
    return this.trackingPixelsService.create(validated);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Actualizar un pixel de tracking' })
  @ApiParam({ name: 'id', description: 'ID del pixel' })
  @ApiBody({ type: UpdateTrackingPixelDtoClass })
  @ApiResponse({ status: 200, description: 'Pixel actualizado' })
  @ApiResponse({ status: 404, description: 'Pixel no encontrado' })
  async update(@Param('id') id: string, @Body() dto: UpdateTrackingPixelDto) {
    const validated = updateTrackingPixelSchema.parse(dto);
    return this.trackingPixelsService.update(id, validated);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un pixel de tracking' })
  @ApiParam({ name: 'id', description: 'ID del pixel' })
  @ApiResponse({ status: 204, description: 'Pixel eliminado' })
  @ApiResponse({ status: 404, description: 'Pixel no encontrado' })
  async delete(@Param('id') id: string) {
    await this.trackingPixelsService.delete(id);
  }
}
