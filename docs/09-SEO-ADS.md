# SEO & Ads Integration - Catálogo Digital

## Arquitectura SEO

El sistema implementa SEO jerárquico con herencia:

```
Settings (Global)
    ↓ hereda si null
Category (Por categoría)
    ↓ hereda si null
Product (Por producto)
```

---

## Campos SEO por Entidad

### Settings (SEO Global)

```typescript
interface SettingsSEO {
  // Meta tags básicos
  seoTitle: string | null;        // <title> por defecto del sitio
  seoDescription: string | null;  // <meta name="description">
  seoKeywords: string | null;     // <meta name="keywords"> (separados por coma)

  // Open Graph (Facebook, WhatsApp, LinkedIn)
  ogImage: string | null;         // URL de imagen para compartir
  ogImagePublicId: string | null; // Cloudinary public ID

  // Píxeles principales (acceso rápido)
  googleAnalyticsId: string | null;   // GA4: G-XXXXXXXXXX
  googleTagManagerId: string | null;  // GTM-XXXXXXX
  facebookPixelId: string | null;     // Facebook/Meta Pixel ID
  tiktokPixelId: string | null;       // TikTok Pixel ID
}
```

### Category (SEO por Categoría)

```typescript
interface CategorySEO {
  seoTitle: string | null;        // Título para página de categoría
  seoDescription: string | null;  // Descripción para categoría
  seoKeywords: string | null;     // Keywords específicos
}
```

### Product (SEO por Producto)

```typescript
interface ProductSEO {
  seoTitle: string | null;        // Título para página de producto
  seoDescription: string | null;  // Descripción para producto
  seoKeywords: string | null;     // Keywords específicos
}
```

---

## Implementación Frontend (Next.js)

### 1. Metadata API (App Router)

```typescript
// app/(catalog)/page.tsx
import { Metadata } from 'next';
import { getCatalog } from '@/lib/api/catalog';

export async function generateMetadata(): Promise<Metadata> {
  const { settings } = await getCatalog();

  return {
    title: settings.seoTitle || settings.businessName,
    description: settings.seoDescription || settings.description,
    keywords: settings.seoKeywords?.split(',').map(k => k.trim()),
    openGraph: {
      title: settings.seoTitle || settings.businessName,
      description: settings.seoDescription || settings.description,
      images: settings.ogImage ? [settings.ogImage] : [],
      type: 'website',
      locale: 'es_PE',
    },
    twitter: {
      card: 'summary_large_image',
      title: settings.seoTitle || settings.businessName,
      description: settings.seoDescription || settings.description,
      images: settings.ogImage ? [settings.ogImage] : [],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}
```

### 2. Producto con SEO

```typescript
// app/(catalog)/producto/[slug]/page.tsx
import { Metadata } from 'next';

export async function generateMetadata({ params }): Promise<Metadata> {
  const { product } = await getPublicProduct(params.slug);
  const { settings } = await getCatalog();

  // Herencia: producto → categoría → settings
  const title = product.seoTitle || product.name;
  const description = product.seoDescription || product.description || settings.seoDescription;
  const image = product.images[0]?.url || settings.ogImage;

  return {
    title: `${title} | ${settings.businessName}`,
    description,
    keywords: product.seoKeywords?.split(',').map(k => k.trim()),
    openGraph: {
      title,
      description,
      images: image ? [image] : [],
      type: 'product',
      locale: 'es_PE',
    },
    // Structured Data para productos
    other: {
      'product:price:amount': product.salePrice || product.price,
      'product:price:currency': settings.currency === 'S/' ? 'PEN' : 'USD',
      'product:availability': product.stock > 0 ? 'in stock' : 'out of stock',
    },
  };
}
```

### 3. JSON-LD Structured Data

```typescript
// components/seo/ProductJsonLd.tsx
export function ProductJsonLd({ product, settings }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images.map(img => img.url),
    sku: product.id,
    offers: {
      '@type': 'Offer',
      price: product.salePrice || product.price,
      priceCurrency: settings.currency === 'S/' ? 'PEN' : 'USD',
      availability: product.stock > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: settings.businessName,
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
```

### 4. Organization JSON-LD

```typescript
// components/seo/OrganizationJsonLd.tsx
export function OrganizationJsonLd({ settings }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: settings.businessName,
    description: settings.description,
    logo: settings.logo,
    address: settings.address,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: settings.whatsapp,
      contactType: 'sales',
      availableLanguage: 'Spanish',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
```

### 5. BreadcrumbList JSON-LD

```typescript
// components/seo/BreadcrumbJsonLd.tsx
export function BreadcrumbJsonLd({ items }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
```

---

## Integración de Píxeles de Ads

### 1. Google Analytics 4 + Tag Manager

```typescript
// components/tracking/GoogleAnalytics.tsx
'use client';

import Script from 'next/script';

export function GoogleAnalytics({ gaId, gtmId }: { gaId?: string; gtmId?: string }) {
  if (!gaId && !gtmId) return null;

  return (
    <>
      {/* Google Tag Manager */}
      {gtmId && (
        <Script
          id="gtm-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${gtmId}');
            `,
          }}
        />
      )}

      {/* Google Analytics 4 */}
      {gaId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            strategy="afterInteractive"
          />
          <Script
            id="ga4-script"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}');
              `,
            }}
          />
        </>
      )}
    </>
  );
}
```

### 2. Facebook/Meta Pixel

```typescript
// components/tracking/FacebookPixel.tsx
'use client';

import Script from 'next/script';

export function FacebookPixel({ pixelId }: { pixelId?: string }) {
  if (!pixelId) return null;

  return (
    <Script
      id="fb-pixel"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${pixelId}');
          fbq('track', 'PageView');
        `,
      }}
    />
  );
}
```

### 3. TikTok Pixel

```typescript
// components/tracking/TikTokPixel.tsx
'use client';

import Script from 'next/script';

export function TikTokPixel({ pixelId }: { pixelId?: string }) {
  if (!pixelId) return null;

  return (
    <Script
      id="tiktok-pixel"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          !function (w, d, t) {
            w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];
            ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"];
            ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};
            for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);
            ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};
            ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";
            ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};
            var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;
            var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
            ttq.load('${pixelId}');
            ttq.page();
          }(window, document, 'ttq');
        `,
      }}
    />
  );
}
```

### 4. Tracking Provider (Combina todos)

```typescript
// components/tracking/TrackingProvider.tsx
'use client';

import { GoogleAnalytics } from './GoogleAnalytics';
import { FacebookPixel } from './FacebookPixel';
import { TikTokPixel } from './TikTokPixel';

interface TrackingProviderProps {
  settings: {
    googleAnalyticsId?: string;
    googleTagManagerId?: string;
    facebookPixelId?: string;
    tiktokPixelId?: string;
  };
}

export function TrackingProvider({ settings }: TrackingProviderProps) {
  return (
    <>
      <GoogleAnalytics
        gaId={settings.googleAnalyticsId}
        gtmId={settings.googleTagManagerId}
      />
      <FacebookPixel pixelId={settings.facebookPixelId} />
      <TikTokPixel pixelId={settings.tiktokPixelId} />
    </>
  );
}
```

---

## Eventos de Tracking para Ads

### Hook de Tracking

```typescript
// hooks/useTracking.ts
'use client';

import { useCallback } from 'react';

interface TrackingEvent {
  type: 'PAGE_VIEW' | 'PRODUCT_VIEW' | 'ADD_TO_CART' | 'CHECKOUT_START' | 'PURCHASE' | 'WHATSAPP_CLICK';
  productId?: string;
  productName?: string;
  productPrice?: number;
  currency?: string;
  quantity?: number;
  value?: number;
}

export function useTracking() {
  const track = useCallback((event: TrackingEvent) => {
    // 1. Enviar al backend para estadísticas internas
    fetch('/api/catalog/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    });

    // 2. Google Analytics 4
    if (typeof window !== 'undefined' && window.gtag) {
      switch (event.type) {
        case 'PRODUCT_VIEW':
          window.gtag('event', 'view_item', {
            currency: event.currency || 'PEN',
            value: event.productPrice,
            items: [{ item_id: event.productId, item_name: event.productName }],
          });
          break;
        case 'ADD_TO_CART':
          window.gtag('event', 'add_to_cart', {
            currency: event.currency || 'PEN',
            value: event.value,
            items: [{ item_id: event.productId, item_name: event.productName, quantity: event.quantity }],
          });
          break;
        case 'CHECKOUT_START':
          window.gtag('event', 'begin_checkout', {
            currency: event.currency || 'PEN',
            value: event.value,
          });
          break;
        case 'PURCHASE':
          window.gtag('event', 'purchase', {
            currency: event.currency || 'PEN',
            value: event.value,
            transaction_id: Date.now().toString(),
          });
          break;
      }
    }

    // 3. Facebook Pixel
    if (typeof window !== 'undefined' && window.fbq) {
      switch (event.type) {
        case 'PRODUCT_VIEW':
          window.fbq('track', 'ViewContent', {
            content_ids: [event.productId],
            content_name: event.productName,
            content_type: 'product',
            value: event.productPrice,
            currency: event.currency || 'PEN',
          });
          break;
        case 'ADD_TO_CART':
          window.fbq('track', 'AddToCart', {
            content_ids: [event.productId],
            content_name: event.productName,
            content_type: 'product',
            value: event.value,
            currency: event.currency || 'PEN',
          });
          break;
        case 'CHECKOUT_START':
          window.fbq('track', 'InitiateCheckout', {
            value: event.value,
            currency: event.currency || 'PEN',
          });
          break;
        case 'PURCHASE':
          window.fbq('track', 'Purchase', {
            value: event.value,
            currency: event.currency || 'PEN',
          });
          break;
        case 'WHATSAPP_CLICK':
          window.fbq('track', 'Contact');
          break;
      }
    }

    // 4. TikTok Pixel
    if (typeof window !== 'undefined' && window.ttq) {
      switch (event.type) {
        case 'PRODUCT_VIEW':
          window.ttq.track('ViewContent', {
            content_id: event.productId,
            content_name: event.productName,
            content_type: 'product',
            value: event.productPrice,
            currency: event.currency || 'PEN',
          });
          break;
        case 'ADD_TO_CART':
          window.ttq.track('AddToCart', {
            content_id: event.productId,
            content_name: event.productName,
            value: event.value,
            currency: event.currency || 'PEN',
          });
          break;
        case 'CHECKOUT_START':
          window.ttq.track('InitiateCheckout', {
            value: event.value,
            currency: event.currency || 'PEN',
          });
          break;
        case 'PURCHASE':
          window.ttq.track('CompletePayment', {
            value: event.value,
            currency: event.currency || 'PEN',
          });
          break;
        case 'WHATSAPP_CLICK':
          window.ttq.track('Contact');
          break;
      }
    }
  }, []);

  return { track };
}
```

---

## Endpoints Backend para SEO

### GET /settings (incluye campos SEO)

```json
{
  "success": true,
  "data": {
    "id": "main",
    "businessName": "Mi Tienda",
    "seoTitle": "Mi Tienda - Los mejores productos",
    "seoDescription": "Encuentra los mejores productos...",
    "seoKeywords": "tienda, productos, ofertas",
    "ogImage": "https://cloudinary.com/og-image.jpg",
    "googleAnalyticsId": "G-XXXXXXXXXX",
    "googleTagManagerId": "GTM-XXXXXXX",
    "facebookPixelId": "123456789",
    "tiktokPixelId": "XXXXXXXXX"
  }
}
```

### PATCH /settings (actualizar SEO)

```json
{
  "seoTitle": "Mi Tienda - Los mejores productos al mejor precio",
  "seoDescription": "Descubre nuestra colección de productos...",
  "seoKeywords": "tienda, productos, ofertas, descuentos",
  "googleAnalyticsId": "G-XXXXXXXXXX",
  "facebookPixelId": "123456789"
}
```

### POST /settings/og-image

```
Content-Type: multipart/form-data
ogImage: [archivo de imagen 1200x630px]
```

---

## Sitemap Dinámico

```typescript
// app/sitemap.ts
import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;

  // Obtener datos del catálogo
  const { categories, products } = await getCatalog();

  const categoryUrls = categories.map(cat => ({
    url: `${baseUrl}/categoria/${cat.slug}`,
    lastModified: cat.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const productUrls = products.items.map(prod => ({
    url: `${baseUrl}/producto/${prod.slug}`,
    lastModified: prod.updatedAt,
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...categoryUrls,
    ...productUrls,
  ];
}
```

---

## Robots.txt Dinámico

```typescript
// app/robots.ts
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
```

---

## Panel Admin - Sección SEO

### Campos a mostrar en Settings

1. **SEO General**
   - Título del sitio (seoTitle)
   - Descripción del sitio (seoDescription)
   - Palabras clave (seoKeywords)
   - Imagen para compartir (ogImage) - Upload con preview

2. **Píxeles de Tracking**
   - Google Analytics ID (GA4)
   - Google Tag Manager ID
   - Facebook Pixel ID
   - TikTok Pixel ID
   - [Botón] Agregar píxel adicional → TrackingPixel

3. **Preview**
   - Vista previa de Google Search
   - Vista previa de Facebook/WhatsApp share
   - Vista previa de Twitter card

### Campos a mostrar en Categoría

- Título SEO (seoTitle) - placeholder: "Usa el nombre de categoría"
- Descripción SEO (seoDescription)
- Palabras clave (seoKeywords)

### Campos a mostrar en Producto

- Título SEO (seoTitle) - placeholder: "Usa el nombre del producto"
- Descripción SEO (seoDescription) - placeholder: "Usa la descripción del producto"
- Palabras clave (seoKeywords)

---

## Checklist SEO

### Antes del Deploy

- [ ] Settings tiene seoTitle, seoDescription, ogImage configurados
- [ ] Todos los productos tienen imágenes (primera imagen = og:image)
- [ ] Google Analytics configurado
- [ ] Facebook Pixel configurado (si usas Facebook Ads)
- [ ] Sitemap generándose correctamente
- [ ] Robots.txt configurado
- [ ] SSL/HTTPS activo
- [ ] URLs amigables (slugs)

### Google Search Console

1. Verificar propiedad
2. Enviar sitemap
3. Monitorear indexación
4. Revisar errores de rastreo

### Facebook Business

1. Verificar dominio
2. Configurar Conversions API (opcional, avanzado)
3. Crear públicos personalizados
4. Configurar eventos de conversión
