'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Eye,
  MousePointerClick,
  MessageCircle,
  ShoppingCart,
  Package,
  Search,
  Calendar,
  RefreshCw,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

import {
  getDashboardStats,
  getStatsSummary,
  type DashboardStats,
  type StatsSummary,
  type StatsQueryParams,
} from '@/lib/api/stats';
import { staggerContainer, staggerItem } from '@/lib/utils/animations';

const periodOptions = [
  { value: 'today', label: 'Hoy' },
  { value: 'week', label: 'Última semana' },
  { value: 'month', label: 'Último mes' },
  { value: 'year', label: 'Último año' },
];

export default function EstadisticasPage() {
  const [period, setPeriod] = useState<StatsQueryParams['period']>('month');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [summary, setSummary] = useState<StatsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadStats = async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    else setLoading(true);

    try {
      const [dashboardData, summaryData] = await Promise.all([
        getDashboardStats({ period }),
        getStatsSummary(),
      ]);
      setStats(dashboardData);
      setSummary(summaryData);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, [period]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatDate = (dateStr: unknown) => {
    const date = new Date(String(dateStr));
    return date.toLocaleDateString('es-PE', { day: '2-digit', month: 'short' });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-80" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={staggerItem} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl text-white">
              <BarChart3 className="w-6 h-6" />
            </div>
            Estadísticas
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 dark:text-neutral-500 mt-1">
            Analiza el rendimiento de tu catálogo
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={period} onValueChange={(v) => setPeriod(v as StatsQueryParams['period'])}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {periodOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={() => loadStats(true)}
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <motion.div variants={staggerItem} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Visitas Hoy */}
        <Card className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 dark:text-neutral-500">Visitas Hoy</p>
                <p className="text-3xl font-bold text-neutral-900 dark:text-white mt-1">
                  {formatNumber(summary?.today || 0)}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  {(summary?.trend || 0) >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500" />
                  )}
                  <span className={`text-sm font-medium ${(summary?.trend || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {summary?.trend || 0}%
                  </span>
                  <span className="text-xs text-neutral-400 dark:text-neutral-500">vs ayer</span>
                </div>
              </div>
              <div className="p-3 bg-cyan-100 dark:bg-cyan-500/20 rounded-xl">
                <Eye className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-blue-500" />
          </CardContent>
        </Card>

        {/* Total Productos */}
        <Card className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 dark:text-neutral-500">Productos</p>
                <p className="text-3xl font-bold text-neutral-900 dark:text-white mt-1">
                  {summary?.counts.products || 0}
                </p>
                <p className="text-sm text-neutral-400 dark:text-neutral-500 mt-2">
                  {summary?.counts.activeProducts || 0} activos
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-500/20 rounded-xl">
                <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-500" />
          </CardContent>
        </Card>

        {/* Clicks WhatsApp */}
        <Card className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 dark:text-neutral-500">WhatsApp Clicks</p>
                <p className="text-3xl font-bold text-neutral-900 dark:text-white mt-1">
                  {formatNumber(stats?.totals.whatsappClicks || 0)}
                </p>
                <p className="text-sm text-neutral-400 dark:text-neutral-500 mt-2">
                  en {periodOptions.find(p => p.value === period)?.label.toLowerCase()}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-500/20 rounded-xl">
                <MessageCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-emerald-500" />
          </CardContent>
        </Card>

        {/* Búsquedas */}
        <Card className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 dark:text-neutral-500">Búsquedas</p>
                <p className="text-3xl font-bold text-neutral-900 dark:text-white mt-1">
                  {formatNumber(stats?.totals.searches || 0)}
                </p>
                <p className="text-sm text-neutral-400 dark:text-neutral-500 mt-2">
                  en {periodOptions.find(p => p.value === period)?.label.toLowerCase()}
                </p>
              </div>
              <div className="p-3 bg-amber-100 dark:bg-amber-500/20 rounded-xl">
                <Search className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
          </CardContent>
        </Card>
      </motion.div>

      {/* Chart */}
      <motion.div variants={staggerItem}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-cyan-500" />
              Actividad del Catálogo
            </CardTitle>
            <CardDescription>
              Visitas y clicks de WhatsApp por día
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats?.chartData && stats.chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={stats.chartData}>
                  <defs>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-neutral-200 dark:stroke-neutral-700" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatDate}
                    className="text-xs"
                    stroke="#94a3b8"
                  />
                  <YAxis className="text-xs" stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                    labelFormatter={formatDate}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="views"
                    name="Visitas"
                    stroke="#22d3ee"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorViews)"
                  />
                  <Area
                    type="monotone"
                    dataKey="clicks"
                    name="WhatsApp"
                    stroke="#22c55e"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorClicks)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[350px] flex items-center justify-center text-neutral-400 dark:text-neutral-500">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No hay datos para este período</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Top Products */}
      <motion.div variants={staggerItem} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Productos más vistos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-cyan-500" />
              Productos Más Vistos
            </CardTitle>
            <CardDescription>
              Top 10 productos con más visitas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats?.topProducts && stats.topProducts.length > 0 ? (
              <div className="space-y-3">
                {stats.topProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50  hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-neutral-200 dark:bg-neutral-700  flex-shrink-0">
                      {product.image ? (
                        <Image
                          src={product.image}
                          alt={product.name}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-5 h-5 text-neutral-400 dark:text-neutral-500" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-neutral-900 dark:text-white truncate">
                        {product.name}
                      </p>
                    </div>
                    <Badge variant="secondary" className="flex-shrink-0">
                      {formatNumber(product.views)} visitas
                    </Badge>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-neutral-400 dark:text-neutral-500">
                <div className="text-center">
                  <Package className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p>No hay datos de productos</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Productos con más clicks en WhatsApp */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-green-500" />
              Top WhatsApp
            </CardTitle>
            <CardDescription>
              Productos con más consultas por WhatsApp
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats?.topWhatsappProducts && stats.topWhatsappProducts.length > 0 ? (
              <div className="space-y-3">
                {stats.topWhatsappProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50  hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-neutral-200 dark:bg-neutral-700  flex-shrink-0">
                      {product.image ? (
                        <Image
                          src={product.image}
                          alt={product.name}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-5 h-5 text-neutral-400 dark:text-neutral-500" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-neutral-900 dark:text-white truncate">
                        {product.name}
                      </p>
                    </div>
                    <Badge className="flex-shrink-0 bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400">
                      {formatNumber(product.clicks)} clicks
                    </Badge>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-neutral-400 dark:text-neutral-500">
                <div className="text-center">
                  <MessageCircle className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p>No hay datos de WhatsApp</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Additional Stats */}
      <motion.div variants={staggerItem}>
        <Card>
          <CardHeader>
            <CardTitle>Resumen de Actividad</CardTitle>
            <CardDescription>
              Métricas detalladas del período seleccionado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50  text-center">
                <Eye className="w-6 h-6 mx-auto text-cyan-500 mb-2" />
                <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                  {formatNumber(stats?.totals.productViews || 0)}
                </p>
                <p className="text-xs text-neutral-500">Vistas de productos</p>
              </div>
              <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50  text-center">
                <MousePointerClick className="w-6 h-6 mx-auto text-blue-500 mb-2" />
                <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                  {formatNumber(stats?.totals.pageViews || 0)}
                </p>
                <p className="text-xs text-neutral-500">Vistas de página</p>
              </div>
              <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50  text-center">
                <ShoppingCart className="w-6 h-6 mx-auto text-amber-500 mb-2" />
                <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                  {formatNumber(stats?.totals.addToCart || 0)}
                </p>
                <p className="text-xs text-neutral-500">Añadidos al carrito</p>
              </div>
              <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50  text-center">
                <Package className="w-6 h-6 mx-auto text-green-500 mb-2" />
                <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                  {formatNumber(stats?.totals.categoryViews || 0)}
                </p>
                <p className="text-xs text-neutral-500">Vistas de categorías</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
