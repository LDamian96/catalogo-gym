'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import {
  Package,
  FolderOpen,
  Eye,
  TrendingUp,
  MessageCircle,
  ArrowUpRight,
  ArrowDownRight,
  QrCode,
  Settings,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { staggerContainer, staggerItem } from '@/lib/utils/animations';
import { useAuthStore } from '@/lib/stores/auth.store';
import { getStatsSummary, getDashboardStats, type StatsSummary, type DashboardStats } from '@/lib/api/stats';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [summary, setSummary] = useState<StatsSummary | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [summaryData, statsData] = await Promise.all([
          getStatsSummary(),
          getDashboardStats({ period: 'month' }),
        ]);
        setSummary(summaryData);
        setDashboardStats(statsData);
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const stats = [
    {
      name: 'Total Productos',
      value: summary?.counts.products.toString() || '0',
      subtext: `${summary?.counts.activeProducts || 0} activos`,
      icon: Package,
      color: 'from-blue-500 to-blue-600',
    },
    {
      name: 'Categorías',
      value: summary?.counts.categories.toString() || '0',
      subtext: 'disponibles',
      icon: FolderOpen,
      color: 'from-blue-500 to-blue-600',
    },
    {
      name: 'Visitas Hoy',
      value: summary?.today.toString() || '0',
      change: summary?.trend || 0,
      icon: Eye,
      color: 'from-green-500 to-green-600',
    },
    {
      name: 'Esta Semana',
      value: summary?.week.toString() || '0',
      subtext: 'interacciones',
      icon: MessageCircle,
      color: 'from-emerald-500 to-emerald-600',
    },
  ];

  // Formatear datos del gráfico
  const chartData = dashboardStats?.chartData.map((d) => ({
    date: new Date(d.date).toLocaleDateString('es', { day: '2-digit', month: 'short' }),
    views: d.views,
    clicks: d.clicks,
  })) || [];

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="space-y-8"
    >
      {/* Welcome Header */}
      <motion.div variants={staggerItem} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
            Hola, {user?.name || 'Usuario'}
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">
            Bienvenido a tu panel de administración
          </p>
        </div>
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          Ver Catálogo
        </Link>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={staggerContainer}
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        {stats.map((stat, index) => (
          <motion.div key={stat.name} variants={staggerItem} custom={index}>
            <Card className="relative overflow-hidden">
              <CardContent className="p-6">
                {loading ? (
                  <div className="flex items-center justify-center h-24">
                    <Loader2 className="w-6 h-6 animate-spin text-neutral-400 dark:text-neutral-500" />
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                        {stat.name}
                      </p>
                      <p className="text-3xl font-bold text-neutral-900 dark:text-white mt-2">
                        {stat.value}
                      </p>
                      {'change' in stat && stat.change !== undefined ? (
                        <div className="flex items-center gap-1 mt-2">
                          {stat.change >= 0 ? (
                            <ArrowUpRight className="w-4 h-4 text-green-500" />
                          ) : (
                            <ArrowDownRight className="w-4 h-4 text-red-500" />
                          )}
                          <span className={`text-sm font-medium ${stat.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {stat.change >= 0 ? '+' : ''}{stat.change}%
                          </span>
                          <span className="text-sm text-neutral-400 dark:text-neutral-500">vs ayer</span>
                        </div>
                      ) : stat.subtext ? (
                        <p className="text-sm text-neutral-400 dark:text-neutral-500 mt-2">{stat.subtext}</p>
                      ) : null}
                    </div>
                    <div className={`p-4 rounded-2xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Chart Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Chart */}
        <motion.div variants={staggerItem} className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-neutral-900 dark:text-white">Actividad del Mes</CardTitle>
              <CardDescription>Visitas y clics en WhatsApp</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-[300px]">
                  <Loader2 className="w-8 h-8 animate-spin text-neutral-400 dark:text-neutral-500" />
                </div>
              ) : chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chartData}>
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
                    <XAxis dataKey="date" className="text-neutral-500 dark:text-neutral-400" fontSize={12} />
                    <YAxis className="text-neutral-500 dark:text-neutral-400" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#fff',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="views"
                      stroke="#22d3ee"
                      fillOpacity={1}
                      fill="url(#colorViews)"
                      name="Visitas"
                    />
                    <Area
                      type="monotone"
                      dataKey="clicks"
                      stroke="#22c55e"
                      fillOpacity={1}
                      fill="url(#colorClicks)"
                      name="WhatsApp"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-[300px] text-neutral-400 dark:text-neutral-500">
                  <TrendingUp className="w-12 h-12 mb-4 opacity-50" />
                  <p>No hay datos de actividad aún</p>
                  <p className="text-sm">Las estadísticas aparecerán cuando los clientes visiten tu catálogo</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Products */}
        <motion.div variants={staggerItem}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg text-neutral-900 dark:text-white">Productos Más Vistos</CardTitle>
              <CardDescription>Top 5 del mes</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-[250px]">
                  <Loader2 className="w-6 h-6 animate-spin text-neutral-400 dark:text-neutral-500" />
                </div>
              ) : dashboardStats?.topProducts && dashboardStats.topProducts.length > 0 ? (
                <div className="space-y-4">
                  {dashboardStats.topProducts.slice(0, 5).map((product, index) => (
                    <div key={product.id} className="flex items-center gap-3">
                      <span className="text-sm font-bold text-neutral-400 dark:text-neutral-500 w-5">
                        {index + 1}
                      </span>
                      <div className="w-10 h-10 rounded-lg bg-neutral-100 dark:bg-neutral-800 overflow-hidden flex-shrink-0">
                        {product.image ? (
                          <Image
                            src={product.image}
                            alt={product.name}
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-4 h-4 text-neutral-400 dark:text-neutral-500" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                          {product.name}
                        </p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">{product.views} visitas</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[250px] text-neutral-400 dark:text-neutral-500">
                  <Package className="w-10 h-10 mb-2 opacity-50" />
                  <p className="text-sm">Sin datos aún</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions & QR */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Quick Actions */}
        <motion.div variants={staggerItem}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg text-neutral-900 dark:text-white">Acciones Rápidas</CardTitle>
              <CardDescription>Gestiona tu catálogo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: 'Agregar Producto', icon: Package, href: '/admin/productos', color: 'from-blue-500 to-blue-600' },
                { label: 'Categorías', icon: FolderOpen, href: '/admin/categorias', color: 'from-blue-500 to-blue-600' },
                { label: 'Tipos de Variante', icon: TrendingUp, href: '/admin/tipos-variante', color: 'from-green-500 to-green-600' },
                { label: 'Configuración', icon: Settings, href: '/admin/configuracion', color: 'from-orange-500 to-orange-600' },
              ].map((action) => (
                <Link
                  key={action.label}
                  href={action.href}
                >
                  <motion.div
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-4 p-4 rounded-xl bg-neutral-50 dark:bg-white/[0.04] hover:bg-neutral-100 dark:hover:bg-white/[0.08] transition-colors cursor-pointer"
                  >
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${action.color}`}>
                      <action.icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-medium text-neutral-700 dark:text-neutral-200">
                      {action.label}
                    </span>
                    <ArrowUpRight className="w-4 h-4 ml-auto text-neutral-400 dark:text-neutral-500" />
                  </motion.div>
                </Link>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Share / QR Card */}
        <motion.div variants={staggerItem}>
          <Card className="h-full bg-gradient-to-br from-cyan-500 to-blue-600 text-white border-0">
            <CardHeader>
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <QrCode className="w-5 h-5" />
                Comparte tu Catálogo
              </CardTitle>
              <CardDescription className="text-cyan-100">
                Genera un código QR para compartir
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-cyan-100 text-sm">
                  Tus clientes pueden escanear el código QR o acceder directamente al link de tu catálogo.
                </p>

                <div className="bg-white/10 rounded-xl p-4">
                  <p className="text-xs text-cyan-200 mb-2">Link del catálogo:</p>
                  <p className="font-mono text-sm break-all">
                    {typeof window !== 'undefined' ? window.location.origin : 'tu-dominio.com'}
                  </p>
                </div>

                <Link href="/admin/compartir">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 px-4 bg-white text-cyan-600 font-semibold rounded-xl hover:bg-cyan-50 transition-colors"
                  >
                    Generar Código QR
                  </motion.button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
