import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Body,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { UpdateSettingsDto, updateSettingsSchema, UpdateSettingsDtoClass } from './dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Settings')
@Controller('settings')
@ApiBearerAuth('JWT-auth')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener configuracion del negocio' })
  @ApiResponse({ status: 200, description: 'Configuracion obtenida' })
  async getSettings() {
    return this.settingsService.getSettings();
  }

  @Patch()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Actualizar configuracion del negocio' })
  @ApiResponse({ status: 200, description: 'Configuracion actualizada' })
  @ApiBody({ type: UpdateSettingsDtoClass })
  async updateSettings(@Body() dto: UpdateSettingsDto) {
    // Validate with Zod
    const validated = updateSettingsSchema.parse(dto);
    return this.settingsService.updateSettings(validated);
  }

  @Post('logo')
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Subir logo del negocio' })
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
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: /^image\/(jpeg|png|webp|gif)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.settingsService.uploadLogo(file);
  }

  @Delete('logo')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Eliminar logo del negocio' })
  @ApiResponse({ status: 200, description: 'Logo eliminado' })
  async deleteLogo() {
    return this.settingsService.deleteLogo();
  }

  @Post('og-image')
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Subir imagen Open Graph (para compartir)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Imagen OG subida' })
  async uploadOgImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: /^image\/(jpeg|png|webp)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.settingsService.uploadOgImage(file);
  }

  @Delete('og-image')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Eliminar imagen Open Graph' })
  @ApiResponse({ status: 200, description: 'Imagen OG eliminada' })
  async deleteOgImage() {
    return this.settingsService.deleteOgImage();
  }
}
