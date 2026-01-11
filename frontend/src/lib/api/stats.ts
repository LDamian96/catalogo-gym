import { api } from './client';

// Types
export interface DashboardTotals {
  pageViews: number;
  productViews: number;
  whatsappClicks: number;
  categoryViews: number;
  searches: number;
  addToCart: number;
  checkoutStart: number;
  purchases: number;
}

export interface ChartDataPoint {
  date: string;
  views: number;
  clicks: number;
}

export interface TopProduct {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  views: number;
}

export interface TopWhatsappProduct {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  clicks: number;
}

export interface DashboardStats {
  period: string;
  dateRange: {
    start: string;
    end: string;
  };
  totals: DashboardTotals;
  chartData: ChartDataPoint[];
  topProducts: TopProduct[];
  topWhatsappProducts: TopWhatsappProduct[];
}

export interface StatsSummary {
  today: number;
  yesterday: number;
  week: number;
  trend: number;
  counts: {
    products: number;
    activeProducts: number;
    categories: number;
  };
}

export interface ProductStats {
  product: {
    id: string;
    name: string;
    slug: string;
    images: { url: string }[];
  };
  period: string;
  dateRange: {
    start: string;
    end: string;
  };
  totals: {
    views: number;
    whatsappClicks: number;
    addToCart: number;
  };
  chartData: ChartDataPoint[];
}

export interface StatsQueryParams {
  period?: 'today' | 'week' | 'month' | 'year' | 'custom';
  startDate?: string;
  endDate?: string;
}

// API Functions

/**
 * GET /stats/dashboard - Obtiene estadísticas del dashboard
 */
export async function getDashboardStats(params?: StatsQueryParams): Promise<DashboardStats> {
  const searchParams = new URLSearchParams();

  if (params?.period) searchParams.set('period', params.period);
  if (params?.startDate) searchParams.set('startDate', params.startDate);
  if (params?.endDate) searchParams.set('endDate', params.endDate);

  const query = searchParams.toString();
  const url = `/stats/dashboard${query ? `?${query}` : ''}`;

  const response = await api.get<DashboardStats>(url);
  return response.data;
}

/**
 * GET /stats/summary - Obtiene resumen rápido
 */
export async function getStatsSummary(): Promise<StatsSummary> {
  const response = await api.get<StatsSummary>('/stats/summary');
  return response.data;
}

/**
 * GET /stats/products/:id - Estadísticas de un producto
 */
export async function getProductStats(
  productId: string,
  params?: StatsQueryParams
): Promise<ProductStats> {
  const searchParams = new URLSearchParams();

  if (params?.period) searchParams.set('period', params.period);
  if (params?.startDate) searchParams.set('startDate', params.startDate);
  if (params?.endDate) searchParams.set('endDate', params.endDate);

  const query = searchParams.toString();
  const url = `/stats/products/${productId}${query ? `?${query}` : ''}`;

  const response = await api.get<ProductStats>(url);
  return response.data;
}
