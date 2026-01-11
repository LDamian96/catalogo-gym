import {
  Controller,
  Get,
  Post,
  Query,
  Res,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ImportService } from './import.service';
import { ExportService } from './export.service';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import {
  exportProductsQuerySchema,
  exportCategoriesQuerySchema,
  exportStatsQuerySchema,
  ExportProductsQuery,
  ExportCategoriesQuery,
  ExportStatsQuery,
} from './dto/export.dto';

@Controller()
@UseGuards(JwtAuthGuard)
export class ImportExportController {
  constructor(
    private readonly importService: ImportService,
    private readonly exportService: ExportService,
  ) {}

  // =============================================
  // IMPORT ENDPOINTS
  // =============================================

  /**
   * POST /import/excel - Importar productos desde Excel o CSV
   */
  @Post('import/excel')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
      fileFilter: (req, file, cb) => {
        const allowedMimes = [
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.ms-excel',
          'text/csv',
          'application/csv',
        ];
        const isCSV = file.originalname?.endsWith('.csv');
        if (allowedMimes.includes(file.mimetype) || isCSV) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Solo se permiten archivos Excel (.xlsx, .xls) o CSV (.csv)'), false);
        }
      },
    }),
  )
  async importExcel(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No se proporcionó archivo');
    }
    return this.importService.importFromExcel(file);
  }

  /**
   * GET /import/template - Descargar plantilla de importación
   */
  @Get('import/template')
  async getImportTemplate(@Res() res: Response) {
    const buffer = await this.importService.getTemplate();

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=plantilla-importacion-productos.xlsx',
    );

    res.send(buffer);
  }

  // =============================================
  // EXPORT ENDPOINTS
  // =============================================

  /**
   * GET /export/products - Exportar productos a Excel
   */
  @Get('export/products')
  async exportProducts(
    @Query(new ZodValidationPipe(exportProductsQuerySchema)) query: ExportProductsQuery,
    @Res() res: Response,
  ) {
    const buffer = await this.exportService.exportProducts(query);

    const filename = `productos-${new Date().toISOString().split('T')[0]}.xlsx`;

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

    res.send(buffer);
  }

  /**
   * GET /export/categories - Exportar categorías a Excel
   */
  @Get('export/categories')
  async exportCategories(
    @Query(new ZodValidationPipe(exportCategoriesQuerySchema)) query: ExportCategoriesQuery,
    @Res() res: Response,
  ) {
    const buffer = await this.exportService.exportCategories(query);

    const filename = `categorias-${new Date().toISOString().split('T')[0]}.xlsx`;

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

    res.send(buffer);
  }

  /**
   * GET /export/stats - Exportar estadísticas a Excel
   */
  @Get('export/stats')
  async exportStats(
    @Query(new ZodValidationPipe(exportStatsQuerySchema)) query: ExportStatsQuery,
    @Res() res: Response,
  ) {
    const buffer = await this.exportService.exportStats(query);

    const filename = `estadisticas-${new Date().toISOString().split('T')[0]}.xlsx`;

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

    res.send(buffer);
  }

  /**
   * GET /export/template - Descargar plantilla vacía para importación
   */
  @Get('export/template')
  async getExportTemplate(@Res() res: Response) {
    const buffer = await this.exportService.getImportTemplate();

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', 'attachment; filename=plantilla-productos.xlsx');

    res.send(buffer);
  }
}
