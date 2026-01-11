'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  FileUp,
  Info,
  Package,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';

import { importExcel, downloadImportTemplate, ImportResult } from '@/lib/api/import-export';
import { fadeIn, staggerContainer, staggerItem } from '@/lib/utils/animations';

export default function ImportarPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [progress, setProgress] = useState(0);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && isValidFile(droppedFile)) {
      setFile(droppedFile);
      setResult(null);
    } else {
      toast.error('Por favor, sube un archivo Excel (.xlsx, .xls) o CSV (.csv)');
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && isValidFile(selectedFile)) {
      setFile(selectedFile);
      setResult(null);
    } else {
      toast.error('Por favor, sube un archivo Excel (.xlsx, .xls) o CSV (.csv)');
    }
  };

  const isValidFile = (file: File): boolean => {
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv',
      'application/csv',
    ];
    return validTypes.includes(file.type) ||
           file.name.endsWith('.xlsx') ||
           file.name.endsWith('.xls') ||
           file.name.endsWith('.csv');
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 10, 90));
    }, 200);

    try {
      const importResult = await importExcel(file);
      setResult(importResult);
      setProgress(100);

      if (importResult.success) {
        toast.success(`Se importaron ${importResult.created} productos correctamente`);
      } else {
        toast.warning(`Importación completada con ${importResult.errors} errores`);
      }
    } catch (error) {
      toast.error('Error al importar el archivo');
      console.error(error);
    } finally {
      clearInterval(progressInterval);
      setIsUploading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      await downloadImportTemplate();
      toast.success('Plantilla descargada');
    } catch (error) {
      toast.error('Error al descargar la plantilla');
      console.error(error);
    }
  };

  const resetForm = () => {
    setFile(null);
    setResult(null);
    setProgress(0);
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
          <div className="p-2 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl text-white">
            <Upload className="w-6 h-6" />
          </div>
          Importar Productos
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Carga productos masivamente desde un archivo Excel o CSV
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Area */}
        <motion.div variants={staggerItem} className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-500" />
                Subir Archivo
              </CardTitle>
              <CardDescription>
                Arrastra y suelta tu archivo Excel o CSV, o haz clic para seleccionarlo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
                  isDragging
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10'
                    : file
                      ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-500/5'
                      : 'border-slate-300 dark:border-slate-700 hover:border-emerald-400'
                }`}
              >
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />

                <AnimatePresence mode="wait">
                  {file ? (
                    <motion.div
                      key="file"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="flex flex-col items-center gap-3"
                    >
                      <div className="p-4 bg-emerald-100 dark:bg-emerald-500/20 rounded-full">
                        <FileSpreadsheet className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">{file.name}</p>
                        <p className="text-sm text-slate-500">
                          {(file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center gap-3"
                    >
                      <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full">
                        <FileUp className="w-10 h-10 text-slate-400" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {isDragging ? 'Suelta el archivo aquí' : 'Arrastra tu archivo Excel o CSV aquí'}
                        </p>
                        <p className="text-sm text-slate-500">
                          o haz clic para seleccionar (.xlsx, .xls, .csv)
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Progress Bar */}
              {isUploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Procesando...</span>
                    <span className="text-emerald-600 font-medium">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={handleUpload}
                  disabled={!file || isUploading}
                  className="gap-2 bg-emerald-600 hover:bg-emerald-700"
                >
                  {isUploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  {isUploading ? 'Importando...' : 'Importar Productos'}
                </Button>

                {file && !isUploading && (
                  <Button variant="outline" onClick={resetForm}>
                    Cambiar archivo
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Instructions */}
        <motion.div variants={staggerItem}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-500" />
                Instrucciones
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                variant="outline"
                onClick={handleDownloadTemplate}
                className="w-full gap-2"
              >
                <Download className="w-4 h-4" />
                Descargar Plantilla
              </Button>

              <div className="text-sm space-y-3 text-slate-600 dark:text-slate-400">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <p className="font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Campos requeridos:
                  </p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>nombre</li>
                    <li>precio</li>
                  </ul>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <p className="font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Variantes:
                  </p>
                  <p className="text-xs">
                    Agrega columnas como <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded">variante_talla</code> con valores separados por coma (S,M,L)
                  </p>
                </div>

                <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg">
                  <p className="font-medium text-emerald-700 dark:text-emerald-300 mb-1">
                    Auto-generación:
                  </p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">
                    El sistema crea automáticamente tipos de variante, valores y todas las combinaciones de sub-productos
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Results */}
      {result && (
        <motion.div
          variants={fadeIn}
          initial="initial"
          animate="animate"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {result.success ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                )}
                Resultado de Importación
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-center">
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {result.totalRows}
                  </p>
                  <p className="text-sm text-slate-500">Total filas</p>
                </div>
                <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl text-center">
                  <p className="text-2xl font-bold text-emerald-600">{result.created}</p>
                  <p className="text-sm text-emerald-600">Creados</p>
                </div>
                <div className="p-4 bg-red-50 dark:bg-red-500/10 rounded-xl text-center">
                  <p className="text-2xl font-bold text-red-600">{result.errors}</p>
                  <p className="text-sm text-red-600">Errores</p>
                </div>
                <div className="p-4 bg-blue-50 dark:bg-blue-500/10 rounded-xl text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {result.results.reduce((acc, r) => acc + (r.variantsCreated || 0), 0)}
                  </p>
                  <p className="text-sm text-blue-600">Sub-productos</p>
                </div>
              </div>

              {/* Variant Types Created */}
              {result.variantTypesCreated.length > 0 && (
                <Alert>
                  <Package className="h-4 w-4" />
                  <AlertTitle>Tipos de variante creados</AlertTitle>
                  <AlertDescription>
                    Se crearon los siguientes tipos de variante: {result.variantTypesCreated.join(', ')}
                  </AlertDescription>
                </Alert>
              )}

              {/* Details Table */}
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Fila</TableHead>
                      <TableHead>Producto</TableHead>
                      <TableHead className="w-24">Estado</TableHead>
                      <TableHead className="w-24">Variantes</TableHead>
                      <TableHead>Mensaje</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {result.results.map((row) => (
                      <TableRow key={row.row}>
                        <TableCell className="font-mono text-sm">{row.row}</TableCell>
                        <TableCell className="font-medium">{row.productName}</TableCell>
                        <TableCell>
                          {row.success ? (
                            <span className="flex items-center gap-1 text-emerald-600">
                              <CheckCircle2 className="w-4 h-4" />
                              OK
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-red-600">
                              <XCircle className="w-4 h-4" />
                              Error
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {row.variantsCreated !== undefined && (
                            <span className="text-blue-600">{row.variantsCreated}</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-slate-500">
                          {row.error || (row.success ? 'Importado correctamente' : '')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
