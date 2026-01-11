'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import {
  QrCode,
  Download,
  Copy,
  Check,
  Share2,
  ExternalLink,
  Palette,
  Link as LinkIcon,
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { staggerContainer, staggerItem } from '@/lib/utils/animations';

const QR_COLORS = [
  { name: 'Negro', fg: '#000000', bg: '#FFFFFF' },
  { name: 'Violeta', fg: '#7c3aed', bg: '#FFFFFF' },
  { name: 'Azul', fg: '#2563eb', bg: '#FFFFFF' },
  { name: 'Verde', fg: '#16a34a', bg: '#FFFFFF' },
  { name: 'Rosa', fg: '#db2777', bg: '#FFFFFF' },
  { name: 'Naranja', fg: '#ea580c', bg: '#FFFFFF' },
];

export default function CompartirPage() {
  const [catalogUrl, setCatalogUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [selectedColor, setSelectedColor] = useState(QR_COLORS[1]); // Violeta por defecto
  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCatalogUrl(window.location.origin);
    }
  }, []);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(catalogUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error copying:', err);
    }
  };

  const handleDownloadQR = () => {
    if (!qrRef.current) return;

    const svg = qrRef.current.querySelector('svg');
    if (!svg) return;

    // Crear canvas para convertir SVG a PNG
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 1024; // Tamaño de descarga
    canvas.width = size;
    canvas.height = size;

    // Convertir SVG a imagen
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      // Fondo blanco
      ctx.fillStyle = selectedColor.bg;
      ctx.fillRect(0, 0, size, size);

      // Dibujar QR
      ctx.drawImage(img, 0, 0, size, size);

      // Descargar
      const pngUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = 'catalogo-qr.png';
      link.href = pngUrl;
      link.click();

      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Mi Catálogo Digital',
          text: 'Mira mi catálogo de productos',
          url: catalogUrl,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={staggerItem}>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Compartir Catálogo
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Genera un código QR y comparte tu catálogo
        </p>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* QR Code Card */}
        <motion.div variants={staggerItem}>
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="w-5 h-5" />
                Código QR
              </CardTitle>
              <CardDescription>
                Escanea o descarga para compartir
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-6">
              {/* QR Code */}
              <div
                ref={qrRef}
                className="p-6 bg-white rounded-2xl shadow-inner"
              >
                <QRCodeSVG
                  value={catalogUrl || 'https://example.com'}
                  size={220}
                  level="H"
                  includeMargin={true}
                  fgColor={selectedColor.fg}
                  bgColor={selectedColor.bg}
                />
              </div>

              {/* Color Selector */}
              <div className="space-y-2">
                <p className="text-sm text-slate-500 flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  Color del QR
                </p>
                <div className="flex gap-2">
                  {QR_COLORS.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        selectedColor.name === color.name
                          ? 'border-slate-900 dark:border-white scale-110'
                          : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: color.fg }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              {/* Download Button */}
              <motion.button
                onClick={handleDownloadQR}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl transition-colors"
              >
                <Download className="w-5 h-5" />
                Descargar QR (PNG)
              </motion.button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Link & Share Card */}
        <motion.div variants={staggerItem} className="space-y-6">
          {/* Link Card */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LinkIcon className="w-5 h-5" />
                Link del Catálogo
              </CardTitle>
              <CardDescription>
                Copia y comparte este link
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* URL Display */}
              <div className="flex items-center gap-2">
                <div className="flex-1 p-3 bg-slate-100 dark:bg-slate-800 rounded-lg font-mono text-sm overflow-x-auto">
                  {catalogUrl || 'Cargando...'}
                </div>
                <motion.button
                  onClick={handleCopyLink}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`p-3 rounded-lg transition-colors ${
                    copied
                      ? 'bg-green-500 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
                  }`}
                >
                  {copied ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </motion.button>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <motion.button
                  onClick={handleShare}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-semibold rounded-xl transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                  Compartir
                </motion.button>
                <motion.a
                  href={catalogUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <ExternalLink className="w-5 h-5" />
                  Abrir
                </motion.a>
              </div>
            </CardContent>
          </Card>

          {/* Tips Card */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-violet-500 to-purple-600 text-white">
            <CardHeader>
              <CardTitle className="text-white">Tips para Compartir</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-violet-100">
                <li className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold">1</span>
                  </div>
                  <span className="text-sm">
                    Imprime el QR y colócalo en tu local o productos
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold">2</span>
                  </div>
                  <span className="text-sm">
                    Comparte el link en tus redes sociales
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold">3</span>
                  </div>
                  <span className="text-sm">
                    Agrégalo a tu perfil de WhatsApp Business
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold">4</span>
                  </div>
                  <span className="text-sm">
                    Incluye el QR en tus tarjetas de presentación
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
