import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { DashboardQueryDto, ProductStatsQueryDto } from './dto';
import { StatType } from '@prisma/client';

@Injectable()
export class StatsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Calcula el rango de fechas según el período
   */
  private getDateRange(period: string, startDate?: string, endDate?: string) {
    const now = new Date();
    let start: Date;
    let end: Date = new Date(now);
    end.setHours(23, 59, 59, 999);

    switch (period) {
      case 'today':
        start = new Date(now);
        start.setHours(0, 0, 0, 0);
        break;
      case 'week':
        start = new Date(now);
        start.setDate(start.getDate() - 7);
        start.setHours(0, 0, 0, 0);
        break;
      case 'month':
        start = new Date(now);
        start.setMonth(start.getMonth() - 1);
        start.setHours(0, 0, 0, 0);
        break;
      case 'year':
        start = new Date(now);
        start.setFullYear(start.getFullYear() - 1);
        start.setHours(0, 0, 0, 0);
        break;
      case 'custom':
        start = startDate ? new Date(startDate) : new Date(now.setMonth(now.getMonth() - 1));
        end = endDate ? new Date(endDate) : new Date();
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      default:
        start = new Date(now);
        start.setMonth(start.getMonth() - 1);
        start.setHours(0, 0, 0, 0);
    }

    return { start, end };
  }

  /**
   * GET /stats/dashboard - Estadísticas generales
   */
  async getDashboard(query: DashboardQueryDto) {
    const { start, end } = this.getDateRange(query.period, query.startDate, query.endDate);

    // Obtener todas las stats en el rango
    const stats = await this.prisma.productStat.findMany({
      where: {
        date: {
          gte: start,
          lte: end,
        },
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            images: { take: 1, orderBy: { order: 'asc' } },
          },
        },
      },
    });

    // Contar totales por tipo
    const totals = {
      pageViews: 0,
      productViews: 0,
      whatsappClicks: 0,
      categoryViews: 0,
      searches: 0,
      addToCart: 0,
      checkoutStart: 0,
      purchases: 0,
    };

    const statTypeMap: Record<StatType, keyof typeof totals> = {
      PAGE_VIEW: 'pageViews',
      PRODUCT_VIEW: 'productViews',
      WHATSAPP_CLICK: 'whatsappClicks',
      CATEGORY_VIEW: 'categoryViews',
      SEARCH: 'searches',
      ADD_TO_CART: 'addToCart',
      CHECKOUT_START: 'checkoutStart',
      PURCHASE: 'purchases',
    };

    stats.forEach((stat) => {
      const key = statTypeMap[stat.type];
      if (key) {
        totals[key] += stat.count;
      }
    });

    // Agrupar por día para gráfico
    const dailyStats = new Map<string, { date: string; views: number; clicks: number }>();

    stats.forEach((stat) => {
      const dateKey = stat.date.toISOString().split('T')[0];

      if (!dailyStats.has(dateKey)) {
        dailyStats.set(dateKey, { date: dateKey, views: 0, clicks: 0 });
      }

      const daily = dailyStats.get(dateKey)!;
      if (stat.type === 'PRODUCT_VIEW' || stat.type === 'PAGE_VIEW') {
        daily.views += stat.count;
      } else if (stat.type === 'WHATSAPP_CLICK') {
        daily.clicks += stat.count;
      }
    });

    // Top productos más vistos
    const productViewsMap = new Map<string, { product: typeof stats[0]['product']; views: number }>();

    stats.forEach((stat) => {
      if (stat.type === 'PRODUCT_VIEW' && stat.product) {
        if (!productViewsMap.has(stat.productId!)) {
          productViewsMap.set(stat.productId!, { product: stat.product, views: 0 });
        }
        productViewsMap.get(stat.productId!)!.views += stat.count;
      }
    });

    const topProducts = Array.from(productViewsMap.values())
      .sort((a, b) => b.views - a.views)
      .slice(0, 10)
      .map((item) => ({
        id: item.product?.id,
        name: item.product?.name,
        slug: item.product?.slug,
        image: item.product?.images[0]?.url || null,
        views: item.views,
      }));

    // Productos con más clicks en WhatsApp
    const whatsappClicksMap = new Map<string, { product: typeof stats[0]['product']; clicks: number }>();

    stats.forEach((stat) => {
      if (stat.type === 'WHATSAPP_CLICK' && stat.product) {
        if (!whatsappClicksMap.has(stat.productId!)) {
          whatsappClicksMap.set(stat.productId!, { product: stat.product, clicks: 0 });
        }
        whatsappClicksMap.get(stat.productId!)!.clicks += stat.count;
      }
    });

    const topWhatsappProducts = Array.from(whatsappClicksMap.values())
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 10)
      .map((item) => ({
        id: item.product?.id,
        name: item.product?.name,
        slug: item.product?.slug,
        image: item.product?.images[0]?.url || null,
        clicks: item.clicks,
      }));

    // Ordenar por fecha
    const chartData = Array.from(dailyStats.values()).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return {
      period: query.period,
      dateRange: {
        start: start.toISOString(),
        end: end.toISOString(),
      },
      totals,
      chartData,
      topProducts,
      topWhatsappProducts,
    };
  }

  /**
   * GET /stats/products/:id - Stats de un producto específico
   */
  async getProductStats(productId: string, query: ProductStatsQueryDto) {
    const { start, end } = this.getDateRange(query.period, query.startDate, query.endDate);

    // Verificar que el producto existe
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        name: true,
        slug: true,
        images: { take: 1, orderBy: { order: 'asc' } },
      },
    });

    if (!product) {
      return null;
    }

    // Obtener stats del producto
    const stats = await this.prisma.productStat.findMany({
      where: {
        productId,
        date: {
          gte: start,
          lte: end,
        },
      },
      orderBy: { date: 'asc' },
    });

    // Calcular totales
    const totals = {
      views: 0,
      whatsappClicks: 0,
      addToCart: 0,
    };

    // Agrupar por día
    const dailyStats = new Map<string, { date: string; views: number; clicks: number }>();

    stats.forEach((stat) => {
      const dateKey = stat.date.toISOString().split('T')[0];

      if (!dailyStats.has(dateKey)) {
        dailyStats.set(dateKey, { date: dateKey, views: 0, clicks: 0 });
      }

      const daily = dailyStats.get(dateKey)!;

      switch (stat.type) {
        case 'PRODUCT_VIEW':
          totals.views += stat.count;
          daily.views += stat.count;
          break;
        case 'WHATSAPP_CLICK':
          totals.whatsappClicks += stat.count;
          daily.clicks += stat.count;
          break;
        case 'ADD_TO_CART':
          totals.addToCart += stat.count;
          break;
      }
    });

    const chartData = Array.from(dailyStats.values()).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return {
      product,
      period: query.period,
      dateRange: {
        start: start.toISOString(),
        end: end.toISOString(),
      },
      totals,
      chartData,
    };
  }

  /**
   * GET /stats/summary - Resumen rápido para el dashboard admin
   */
  async getSummary() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    // Stats de hoy
    const todayStats = await this.prisma.productStat.aggregate({
      where: { date: today },
      _sum: { count: true },
    });

    // Stats de ayer (para comparación)
    const yesterdayStats = await this.prisma.productStat.aggregate({
      where: { date: yesterday },
      _sum: { count: true },
    });

    // Stats de la semana
    const weekStats = await this.prisma.productStat.aggregate({
      where: {
        date: { gte: weekAgo },
      },
      _sum: { count: true },
    });

    // Conteos generales
    const [productsCount, categoriesCount, activeProductsCount] = await Promise.all([
      this.prisma.product.count(),
      this.prisma.category.count(),
      this.prisma.product.count({ where: { isActive: true } }),
    ]);

    const todayTotal = todayStats._sum.count || 0;
    const yesterdayTotal = yesterdayStats._sum.count || 0;
    const weekTotal = weekStats._sum.count || 0;

    // Calcular tendencia (porcentaje de cambio)
    const trend = yesterdayTotal > 0
      ? Math.round(((todayTotal - yesterdayTotal) / yesterdayTotal) * 100)
      : todayTotal > 0 ? 100 : 0;

    return {
      today: todayTotal,
      yesterday: yesterdayTotal,
      week: weekTotal,
      trend,
      counts: {
        products: productsCount,
        activeProducts: activeProductsCount,
        categories: categoriesCount,
      },
    };
  }
}
