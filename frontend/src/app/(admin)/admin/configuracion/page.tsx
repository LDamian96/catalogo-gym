'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Save, Loader2, Store, Search, BarChart3 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { ImageUploader } from '@/components/shared';
import {
  getSettings,
  updateSettings,
  uploadLogo,
  deleteLogo,
  uploadOgImage,
  deleteOgImage,
} from '@/lib/api/settings';
import { getTrackingPixels, createTrackingPixel, deleteTrackingPixel } from '@/lib/api/tracking-pixels';
import type { Settings, TrackingPixel, PixelType } from '@/types';

const settingsSchema = z.object({
  businessName: z.string().min(2, 'Mínimo 2 caracteres').max(100),
  whatsapp: z.string().min(10, 'Número inválido').max(20),
  currency: z.string().min(1).max(5),
  description: z.string().max(500).nullable().optional(),
  address: z.string().max(200).nullable().optional(),
  schedule: z.string().max(200).nullable().optional(),
  cartEnabled: z.boolean(),
  welcomeMessage: z.string().max(500).nullable().optional(),
  // SEO
  seoTitle: z.string().max(70).nullable().optional(),
  seoDescription: z.string().max(160).nullable().optional(),
  seoKeywords: z.string().max(200).nullable().optional(),
  // Tracking
  googleAnalyticsId: z.string().max(50).nullable().optional(),
  googleTagManagerId: z.string().max(50).nullable().optional(),
  facebookPixelId: z.string().max(50).nullable().optional(),
  tiktokPixelId: z.string().max(50).nullable().optional(),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export default function ConfiguracionPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [trackingPixels, setTrackingPixels] = useState<TrackingPixel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingOg, setIsUploadingOg] = useState(false);

  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      businessName: '',
      whatsapp: '',
      currency: 'S/',
      description: '',
      address: '',
      schedule: '',
      cartEnabled: true,
      welcomeMessage: '',
      seoTitle: '',
      seoDescription: '',
      seoKeywords: '',
      googleAnalyticsId: '',
      googleTagManagerId: '',
      facebookPixelId: '',
      tiktokPixelId: '',
    },
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setIsLoading(true);
      const [settingsData, pixelsData] = await Promise.all([
        getSettings(),
        getTrackingPixels(),
      ]);
      setSettings(settingsData);
      setTrackingPixels(pixelsData);

      // Populate form
      form.reset({
        businessName: settingsData.businessName,
        whatsapp: settingsData.whatsapp,
        currency: settingsData.currency,
        description: settingsData.description || '',
        address: settingsData.address || '',
        schedule: settingsData.schedule || '',
        cartEnabled: settingsData.cartEnabled,
        welcomeMessage: settingsData.welcomeMessage || '',
        seoTitle: settingsData.seoTitle || '',
        seoDescription: settingsData.seoDescription || '',
        seoKeywords: settingsData.seoKeywords || '',
        googleAnalyticsId: settingsData.googleAnalyticsId || '',
        googleTagManagerId: settingsData.googleTagManagerId || '',
        facebookPixelId: settingsData.facebookPixelId || '',
        tiktokPixelId: settingsData.tiktokPixelId || '',
      });
    } catch (error) {
      console.error(error);
      toast.error('Error al cargar configuración');
    } finally {
      setIsLoading(false);
    }
  }

  async function onSubmit(data: SettingsFormData) {
    try {
      setIsSaving(true);
      const updated = await updateSettings(data);
      setSettings(updated);
      toast.success('Configuración guardada');
    } catch (error) {
      console.error(error);
      toast.error('Error al guardar');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleLogoUpload(file: File) {
    try {
      setIsUploadingLogo(true);
      const updated = await uploadLogo(file);
      setSettings(updated);
      toast.success('Logo actualizado');
    } catch (error) {
      console.error(error);
      toast.error('Error al subir logo');
    } finally {
      setIsUploadingLogo(false);
    }
  }

  async function handleLogoDelete() {
    try {
      setIsUploadingLogo(true);
      const updated = await deleteLogo();
      setSettings(updated);
      toast.success('Logo eliminado');
    } catch (error) {
      console.error(error);
      toast.error('Error al eliminar logo');
    } finally {
      setIsUploadingLogo(false);
    }
  }

  async function handleOgImageUpload(file: File) {
    try {
      setIsUploadingOg(true);
      const updated = await uploadOgImage(file);
      setSettings(updated);
      toast.success('Imagen OG actualizada');
    } catch (error) {
      console.error(error);
      toast.error('Error al subir imagen');
    } finally {
      setIsUploadingOg(false);
    }
  }

  async function handleOgImageDelete() {
    try {
      setIsUploadingOg(true);
      const updated = await deleteOgImage();
      setSettings(updated);
      toast.success('Imagen OG eliminada');
    } catch (error) {
      console.error(error);
      toast.error('Error al eliminar imagen');
    } finally {
      setIsUploadingOg(false);
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-[500px] w-full" />
      </div>
    );
  }

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={{ animate: { transition: { staggerChildren: 0.1 } } }}
      className="container mx-auto py-6 space-y-6"
    >
      <motion.div variants={fadeInUp} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">Configuración</h1>
          <p className="text-neutral-500 dark:text-neutral-400">Personaliza tu catálogo digital</p>
        </div>
        <Button onClick={form.handleSubmit(onSubmit)} disabled={isSaving}>
          {isSaving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Guardar cambios
        </Button>
      </motion.div>

      <motion.div variants={fadeInUp}>
        <Tabs defaultValue="negocio" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="negocio" className="gap-2">
              <Store className="h-4 w-4" />
              Negocio
            </TabsTrigger>
            <TabsTrigger value="seo" className="gap-2">
              <Search className="h-4 w-4" />
              SEO
            </TabsTrigger>
            <TabsTrigger value="tracking" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Tracking
            </TabsTrigger>
          </TabsList>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Tab: Negocio */}
              <TabsContent value="negocio" className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Logo */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Logo</CardTitle>
                      <CardDescription>Tu logo aparecerá en el catálogo</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ImageUploader
                        currentImage={settings?.logo ?? null}
                        onUpload={handleLogoUpload}
                        onDelete={handleLogoDelete}
                        isLoading={isUploadingLogo}
                        aspectRatio="square"
                      />
                    </CardContent>
                  </Card>

                  {/* Datos básicos */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Datos del negocio</CardTitle>
                      <CardDescription>Información principal</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="businessName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nombre del negocio</FormLabel>
                            <FormControl>
                              <Input placeholder="Mi Tienda" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="whatsapp"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>WhatsApp</FormLabel>
                            <FormControl>
                              <Input placeholder="+51999999999" {...field} />
                            </FormControl>
                            <FormDescription>Con código de país</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="currency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Moneda</FormLabel>
                            <FormControl>
                              <Input placeholder="S/" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </div>

                {/* Descripción y más */}
                <Card>
                  <CardHeader>
                    <CardTitle>Información adicional</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descripción</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe tu negocio..."
                              rows={3}
                              {...field}
                              value={field.value || ''}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Dirección</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Av. Principal 123"
                                {...field}
                                value={field.value || ''}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="schedule"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Horario</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Lun-Sab 9am-6pm"
                                {...field}
                                value={field.value || ''}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="welcomeMessage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mensaje de bienvenida (WhatsApp)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Hola! Gracias por contactarnos..."
                              rows={2}
                              {...field}
                              value={field.value || ''}
                            />
                          </FormControl>
                          <FormDescription>
                            Se usará como mensaje inicial en WhatsApp
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="cartEnabled"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-xl border border-neutral-200 dark:border-white/[0.08] p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Carrito de compras</FormLabel>
                            <FormDescription>
                              Permite agregar productos al carrito
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab: SEO */}
              <TabsContent value="seo" className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Imagen Open Graph</CardTitle>
                      <CardDescription>
                        Aparece al compartir tu catálogo en redes sociales
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ImageUploader
                        currentImage={settings?.ogImage ?? null}
                        onUpload={handleOgImageUpload}
                        onDelete={handleOgImageDelete}
                        isLoading={isUploadingOg}
                        aspectRatio="video"
                        label=""
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Meta tags SEO</CardTitle>
                      <CardDescription>
                        Optimiza cómo apareces en buscadores
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="seoTitle"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Título SEO</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Mi Tienda - Productos de calidad"
                                maxLength={70}
                                {...field}
                                value={field.value || ''}
                              />
                            </FormControl>
                            <FormDescription>
                              {(field.value?.length || 0)}/70 caracteres
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="seoDescription"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Descripción SEO</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Descubre nuestros productos..."
                                maxLength={160}
                                rows={3}
                                {...field}
                                value={field.value || ''}
                              />
                            </FormControl>
                            <FormDescription>
                              {(field.value?.length || 0)}/160 caracteres
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="seoKeywords"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Palabras clave</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="productos, tienda, calidad"
                                maxLength={200}
                                {...field}
                                value={field.value || ''}
                              />
                            </FormControl>
                            <FormDescription>Separadas por comas</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Tab: Tracking */}
              <TabsContent value="tracking" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Píxeles de seguimiento</CardTitle>
                    <CardDescription>
                      Conecta tus herramientas de analytics y publicidad
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="googleAnalyticsId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Google Analytics ID</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="G-XXXXXXXXXX"
                                {...field}
                                value={field.value || ''}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="googleTagManagerId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Google Tag Manager ID</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="GTM-XXXXXXX"
                                {...field}
                                value={field.value || ''}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="facebookPixelId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Facebook Pixel ID</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="123456789012345"
                                {...field}
                                value={field.value || ''}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="tiktokPixelId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>TikTok Pixel ID</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="XXXXXXXXXXXXXXXXXX"
                                {...field}
                                value={field.value || ''}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Tracking Pixels adicionales */}
                <Card>
                  <CardHeader>
                    <CardTitle>Píxeles adicionales</CardTitle>
                    <CardDescription>
                      Otros píxeles de tracking (Pinterest, Snapchat, etc.)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {trackingPixels.length === 0 ? (
                      <p className="text-sm text-neutral-500 dark:text-neutral-400 text-center py-4">
                        No hay píxeles adicionales configurados
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {trackingPixels.map((pixel) => (
                          <div
                            key={pixel.id}
                            className="flex items-center justify-between p-3 rounded-xl border border-neutral-200 dark:border-white/[0.08]"
                          >
                            <div>
                              <p className="font-medium text-neutral-900 dark:text-white">{pixel.name}</p>
                              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                {pixel.type} - {pixel.pixelId}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={async () => {
                                await deleteTrackingPixel(pixel.id);
                                setTrackingPixels((prev) =>
                                  prev.filter((p) => p.id !== pixel.id)
                                );
                                toast.success('Pixel eliminado');
                              }}
                            >
                              Eliminar
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </form>
          </Form>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}
