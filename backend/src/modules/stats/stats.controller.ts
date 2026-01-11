import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { StatsService } from './stats.service';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import {
  dashboardQuerySchema,
  productStatsQuerySchema,
  DashboardQueryDto,
  ProductStatsQueryDto,
} from './dto';

@Controller('stats')
@UseGuards(JwtAuthGuard)
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  /**
   * GET /stats/dashboard - Estadísticas generales del catálogo
   */
  @Get('dashboard')
  async getDashboard(
    @Query(new ZodValidationPipe(dashboardQuerySchema)) query: DashboardQueryDto,
  ) {
    return this.statsService.getDashboard(query);
  }

  /**
   * GET /stats/summary - Resumen rápido para el panel admin
   */
  @Get('summary')
  async getSummary() {
    return this.statsService.getSummary();
  }

  /**
   * GET /stats/products/:id - Estadísticas de un producto específico
   */
  @Get('products/:id')
  async getProductStats(
    @Param('id') id: string,
    @Query(new ZodValidationPipe(productStatsQuerySchema)) query: ProductStatsQueryDto,
  ) {
    const result = await this.statsService.getProductStats(id, query);

    if (!result) {
      throw new NotFoundException('Producto no encontrado');
    }

    return result;
  }
}
