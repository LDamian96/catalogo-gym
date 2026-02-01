'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Download,
  FileSpreadsheet,
  Package,
  FolderOpen,
  BarChart3,
  Loader2,
  Calendar,
  Filter,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import {
  exportProducts,
  exportCategories,
  exportStats,
  downloadImportTemplate,
} from '@/lib/api/import-export';
import { getCategories, Category } from '@/lib/api/categories';
import { staggerContainer, staggerItem } from '@/lib/utils/animations';

export default function ExportarPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<string | null>(null);

  // Product export filters
  const [categoryId, setCategoryId] = useState<string>('all');
  const [onlyActive, setOnlyActive] = useState(false);

  // Stats export filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    getCategories()
      .then((cats) => setCategories(cats))
      .catch(console.error);
  }, []);

  const handleExportProducts = async () => {
    setLoading('products');
    try {
      await exportProducts({
        categoryId: categoryId !== 'all' ? categoryId : undefined,
        isActive: onlyActive ? true : undefined,
      });
      toast.success('Productos exportados correctamente');
    } catch (error) {
      toast.error('Error al exportar productos');
      console.error(error);
    } finally {
      setLoading(null);
    }
  };

  const handleExportCategories = async () => {
    setLoading('categories');
    try {
      await exportCategories();
      toast.success('Categorías exportadas correctamente');
    } catch (error) {
      toast.error('Error al exportar categorías');
      console.error(error);
    } finally {
      setLoading(null);
    }
  };

  const handleExportStats = async () => {
    setLoading('stats');
    try {
      await exportStats({
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      toast.success('Estadísticas exportadas correctamente');
    } catch (error) {
      toast.error('Error al exportar estadísticas');
      console.error(error);
    } finally {
      setLoading(null);
    }
  };

  const handleDownloadTemplate = async () => {
    setLoading('template');
    try {
      await downloadImportTemplate();
      toast.success('Plantilla descargada');
    } catch (error) {
      toast.error('Error al descargar plantilla');
      console.error(error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={staggerItem}>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl text-white">
            <Download className="w-6 h-6" />
          </div>
          Exportar Datos
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Descarga tus datos en formato Excel
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Export Products */}
        <motion.div variants={staggerItem}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-cyan-500" />
                Exportar Productos
              </CardTitle>
              <CardDescription>
                Descarga todos tus productos con sus variantes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Filters */}
              <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                  <Filter className="w-4 h-4" />
                  Filtros opcionales
                </div>

                <div className="space-y-2">
                  <Label>Categoría</Label>
                  <Select value={categoryId} onValueChange={setCategoryId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas las categorías" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las categorías</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="active-only">Solo productos activos</Label>
                  <Switch
                    id="active-only"
                    checked={onlyActive}
                    onCheckedChange={setOnlyActive}
                  />
                </div>
              </div>

              <Button
                onClick={handleExportProducts}
                disabled={loading === 'products'}
                className="w-full gap-2 bg-cyan-600 hover:bg-cyan-700"
              >
                {loading === 'products' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <FileSpreadsheet className="w-4 h-4" />
                )}
                Exportar Productos
              </Button>

              <p className="text-xs text-slate-500 text-center">
                Incluye nombre, precio, categoría, variantes y más
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Export Categories */}
        <motion.div variants={staggerItem}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-emerald-500" />
                Exportar Categorías
              </CardTitle>
              <CardDescription>
                Descarga la lista de categorías con estadísticas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl">
                <p className="text-sm text-emerald-600 dark:text-emerald-400">
                  Exporta todas las categorías con:
                </p>
                <ul className="mt-2 text-sm text-emerald-700 dark:text-emerald-300 space-y-1">
                  <li>• Nombre y descripción</li>
                  <li>• Configuración SEO</li>
                  <li>• Cantidad de productos</li>
                  <li>• Estado activo/inactivo</li>
                </ul>
              </div>

              <Button
                onClick={handleExportCategories}
                disabled={loading === 'categories'}
                className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700"
              >
                {loading === 'categories' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <FileSpreadsheet className="w-4 h-4" />
                )}
                Exportar Categorías
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Export Stats */}
        <motion.div variants={staggerItem}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-500" />
                Exportar Estadísticas
              </CardTitle>
              <CardDescription>
                Descarga el historial de eventos y métricas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Date Filters */}
              <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                  <Calendar className="w-4 h-4" />
                  Rango de fechas
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Desde</Label>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Hasta</Label>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <Button
                onClick={handleExportStats}
                disabled={loading === 'stats'}
                className="w-full gap-2 bg-blue-600 hover:bg-blue-700"
              >
                {loading === 'stats' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <FileSpreadsheet className="w-4 h-4" />
                )}
                Exportar Estadísticas
              </Button>

              <p className="text-xs text-slate-500 text-center">
                Incluye vistas, clics en WhatsApp y búsquedas
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Download Template */}
        <motion.div variants={staggerItem}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5 text-amber-500" />
                Plantilla de Importación
              </CardTitle>
              <CardDescription>
                Descarga la plantilla para importar productos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-amber-50 dark:bg-amber-500/10 rounded-xl">
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  La plantilla incluye:
                </p>
                <ul className="mt-2 text-sm text-amber-700 dark:text-amber-300 space-y-1">
                  <li>• Todos los campos necesarios</li>
                  <li>• Columnas de ejemplo para variantes</li>
                  <li>• Hoja con instrucciones detalladas</li>
                  <li>• Ejemplos de datos</li>
                </ul>
              </div>

              <Button
                onClick={handleDownloadTemplate}
                disabled={loading === 'template'}
                variant="outline"
                className="w-full gap-2"
              >
                {loading === 'template' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                Descargar Plantilla
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Tips */}
      <motion.div variants={staggerItem}>
        <Card className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-900/50 border-0">
          <CardContent className="p-6">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-3">
              Tips de Exportación
            </h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm text-slate-600 dark:text-slate-400">
              <div className="flex gap-2">
                <span className="text-cyan-500">•</span>
                <span>Los archivos se generan en formato .xlsx compatible con Excel y Google Sheets</span>
              </div>
              <div className="flex gap-2">
                <span className="text-emerald-500">•</span>
                <span>Las exportaciones incluyen todas las columnas de variante dinámicas</span>
              </div>
              <div className="flex gap-2">
                <span className="text-blue-500">•</span>
                <span>Usa los filtros para exportar solo los datos que necesitas</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
