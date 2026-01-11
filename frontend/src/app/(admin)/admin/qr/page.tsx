'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import {
  QrCode,
  Download,
  Copy,
  Check,
  Palette,
  Maximize,
  Link2,
  Smartphone,
  Share2,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { getSettings } from '@/lib/api/settings';
import { fadeIn, staggerContainer, staggerItem } from '@/lib/utils/animations';

const presetColors = [
  { name: 'Negro', fg: '#000000', bg: '#ffffff' },
  { name: 'Violeta', fg: '#7c3aed', bg: '#ffffff' },
  { name: 'Azul', fg: '#2563eb', bg: '#ffffff' },
  { name: 'Verde', fg: '#16a34a', bg: '#ffffff' },
  { name: 'Rojo', fg: '#dc2626', bg: '#ffffff' },
  { name: 'Naranja', fg: '#ea580c', bg: '#ffffff' },
];

export default function QRPage() {
  const [catalogUrl, setCatalogUrl] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [qrSize, setQrSize] = useState(256);
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Set the catalog URL based on current origin
    if (typeof window !== 'undefined') {
      setCatalogUrl(window.location.origin);
    }

    // Load business name from settings
    getSettings()
      .then((settings) => {
        setBusinessName(settings.businessName || 'Mi Catálogo');
      })
      .catch(console.error);
  }, []);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(catalogUrl);
      setCopied(true);
      toast.success('Link copiado al portapapeles');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Error al copiar');
    }
  };

  const handleDownloadPNG = () => {
    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = qrSize + 40; // Add padding
    canvas.width = size;
    canvas.height = size;

    // White background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, size, size);

    // Convert SVG to image
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 20, 20, qrSize, qrSize);
      URL.revokeObjectURL(url);

      // Download
      const link = document.createElement('a');
      link.download = `qr-${businessName.toLowerCase().replace(/\s+/g, '-')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast.success('QR descargado');
    };
    img.src = url;
  };

  const handleDownloadSVG = () => {
    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    const link = document.createElement('a');
    link.download = `qr-${businessName.toLowerCase().replace(/\s+/g, '-')}.svg`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('QR descargado como SVG');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: businessName,
          text: `Visita mi catálogo: ${businessName}`,
          url: catalogUrl,
        });
      } catch {
        // User cancelled
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
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={staggerItem}>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl text-white">
            <QrCode className="w-6 h-6" />
          </div>
          Código QR
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Genera y descarga el código QR de tu catálogo
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* QR Preview */}
        <motion.div variants={staggerItem}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-violet-500" />
                Vista Previa
              </CardTitle>
              <CardDescription>
                Escanea con cualquier cámara de celular
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div
                ref={qrRef}
                className="p-6 bg-white rounded-2xl shadow-lg"
                style={{ backgroundColor: bgColor }}
              >
                <QRCodeSVG
                  value={catalogUrl || 'https://ejemplo.com'}
                  size={qrSize}
                  fgColor={fgColor}
                  bgColor={bgColor}
                  level="H"
                  includeMargin={false}
                />
              </div>

              <div className="mt-6 text-center">
                <p className="font-semibold text-slate-900 dark:text-white">
                  {businessName}
                </p>
                <div className="flex items-center justify-center gap-2 mt-2 text-sm text-slate-500">
                  <Link2 className="w-4 h-4" />
                  <span className="truncate max-w-[200px]">{catalogUrl}</span>
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-3 mt-6">
                <Button onClick={handleDownloadPNG} className="gap-2">
                  <Download className="w-4 h-4" />
                  Descargar PNG
                </Button>
                <Button variant="outline" onClick={handleDownloadSVG} className="gap-2">
                  <Download className="w-4 h-4" />
                  SVG
                </Button>
                <Button variant="outline" onClick={handleShare} className="gap-2">
                  <Share2 className="w-4 h-4" />
                  Compartir
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Options */}
        <motion.div variants={staggerItem}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-violet-500" />
                Personalizar
              </CardTitle>
              <CardDescription>
                Ajusta el tamaño y colores del QR
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* URL */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Link2 className="w-4 h-4" />
                  URL del Catálogo
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={catalogUrl}
                    onChange={(e) => setCatalogUrl(e.target.value)}
                    placeholder="https://tu-catalogo.com"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopyLink}
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Size */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Maximize className="w-4 h-4" />
                  Tamaño del QR
                </Label>
                <Select value={qrSize.toString()} onValueChange={(v) => setQrSize(parseInt(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="128">128px - Pequeño</SelectItem>
                    <SelectItem value="192">192px - Mediano</SelectItem>
                    <SelectItem value="256">256px - Normal</SelectItem>
                    <SelectItem value="320">320px - Grande</SelectItem>
                    <SelectItem value="384">384px - Extra grande</SelectItem>
                    <SelectItem value="512">512px - Máximo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Colors */}
              <Tabs defaultValue="presets" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="presets">Presets</TabsTrigger>
                  <TabsTrigger value="custom">Personalizado</TabsTrigger>
                </TabsList>

                <TabsContent value="presets" className="space-y-4">
                  <div className="grid grid-cols-3 gap-3 mt-4">
                    {presetColors.map((preset) => (
                      <button
                        key={preset.name}
                        onClick={() => {
                          setFgColor(preset.fg);
                          setBgColor(preset.bg);
                        }}
                        className={`p-3 rounded-xl border-2 transition-all ${
                          fgColor === preset.fg && bgColor === preset.bg
                            ? 'border-violet-500 ring-2 ring-violet-500/20'
                            : 'border-slate-200 dark:border-slate-700 hover:border-violet-300'
                        }`}
                      >
                        <div
                          className="w-8 h-8 rounded-lg mx-auto mb-1"
                          style={{ backgroundColor: preset.fg }}
                        />
                        <span className="text-xs text-slate-600 dark:text-slate-400">
                          {preset.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="custom" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="space-y-2">
                      <Label>Color QR</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={fgColor}
                          onChange={(e) => setFgColor(e.target.value)}
                          className="w-12 h-10 p-1 cursor-pointer"
                        />
                        <Input
                          value={fgColor}
                          onChange={(e) => setFgColor(e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Color Fondo</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={bgColor}
                          onChange={(e) => setBgColor(e.target.value)}
                          className="w-12 h-10 p-1 cursor-pointer"
                        />
                        <Input
                          value={bgColor}
                          onChange={(e) => setBgColor(e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Tips */}
              <div className="p-4 bg-violet-50 dark:bg-violet-500/10 rounded-xl">
                <h4 className="font-medium text-violet-700 dark:text-violet-300 mb-2">
                  💡 Tips
                </h4>
                <ul className="text-sm text-violet-600 dark:text-violet-400 space-y-1">
                  <li>• Usa colores con buen contraste para mejor lectura</li>
                  <li>• PNG es ideal para impresión y redes sociales</li>
                  <li>• SVG es mejor para escalado sin pérdida de calidad</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Usage Examples */}
      <motion.div variants={staggerItem}>
        <Card>
          <CardHeader>
            <CardTitle>¿Dónde usar tu código QR?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: '🏪', title: 'En tu tienda', desc: 'Imprime y coloca en el mostrador' },
                { icon: '📦', title: 'En empaques', desc: 'Agrega a bolsas y cajas' },
                { icon: '🎴', title: 'Tarjetas', desc: 'Incluye en tu tarjeta de presentación' },
                { icon: '📱', title: 'Redes sociales', desc: 'Comparte en stories e historias' },
              ].map((item, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-center"
                >
                  <div className="text-3xl mb-2">{item.icon}</div>
                  <h4 className="font-medium text-slate-900 dark:text-white">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
