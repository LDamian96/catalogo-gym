'use client';

import Script from 'next/script';
import { createContext, useContext, useCallback, useMemo } from 'react';
import type { Product } from '@/types';
import type { CatalogSettings } from '@/lib/api/catalog';

// Tipos para eventos de tracking
export interface TrackingEvent {
  event: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params?: Record<string, any>;
}

export interface ViewItemParams {
  item_id: string;
  item_name: string;
  item_category?: string;
  item_brand?: string;
  price?: number;
  currency?: string;
}

export interface AddToCartParams extends ViewItemParams {
  quantity: number;
}

export interface PurchaseParams {
  transaction_id: string;
  value: number;
  currency: string;
  items: Array<{
    item_id: string;
    item_name: string;
    quantity: number;
    price: number;
  }>;
}

// Contexto de tracking
interface TrackingContextValue {
  trackPageView: (path?: string, title?: string) => void;
  trackViewItem: (product: Product, currency?: string) => void;
  trackAddToCart: (product: Product, quantity: number, currency?: string) => void;
  trackBeginCheckout: (items: AddToCartParams[], value: number, currency?: string) => void;
  trackPurchase: (params: PurchaseParams) => void;
  trackSearch: (searchTerm: string) => void;
  trackEvent: (event: TrackingEvent) => void;
  isEnabled: boolean;
}

const TrackingContext = createContext<TrackingContextValue | null>(null);

// Props del provider
interface TrackingProviderProps {
  children: React.ReactNode;
  settings: Pick<CatalogSettings, 'googleAnalyticsId' | 'googleTagManagerId' | 'facebookPixelId' | 'tiktokPixelId' | 'currency'> | null;
}

// Declaraciones globales para TypeScript
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
    ttq?: {
      load: (id: string) => void;
      page: () => void;
      track: (event: string, params?: Record<string, unknown>) => void;
      identify: (params: Record<string, unknown>) => void;
    };
  }
}

export function TrackingProvider({ children, settings }: TrackingProviderProps) {
  const gaId = settings?.googleAnalyticsId;
  const gtmId = settings?.googleTagManagerId;
  const fbPixelId = settings?.facebookPixelId;
  const tiktokPixelId = settings?.tiktokPixelId;
  const defaultCurrency = settings?.currency || 'PEN';

  const isEnabled = !!(gaId || gtmId || fbPixelId || tiktokPixelId);

  // Google Analytics / GTM event
  const sendGAEvent = useCallback((eventName: string, params?: Record<string, unknown>) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventName, params);
    }
  }, []);

  // Facebook Pixel event
  const sendFBEvent = useCallback((eventName: string, params?: Record<string, unknown>) => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', eventName, params);
    }
  }, []);

  // TikTok Pixel event
  const sendTTEvent = useCallback((eventName: string, params?: Record<string, unknown>) => {
    if (typeof window !== 'undefined' && window.ttq) {
      window.ttq.track(eventName, params);
    }
  }, []);

  // Track page view
  const trackPageView = useCallback((path?: string, title?: string) => {
    const pageData = {
      page_path: path || (typeof window !== 'undefined' ? window.location.pathname : '/'),
      page_title: title || (typeof document !== 'undefined' ? document.title : ''),
    };

    sendGAEvent('page_view', pageData);

    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'PageView');
    }

    if (typeof window !== 'undefined' && window.ttq) {
      window.ttq.page();
    }
  }, [sendGAEvent]);

  // Track view item (product detail)
  const trackViewItem = useCallback((product: Product, currency?: string) => {
    const curr = currency || defaultCurrency;
    const price = typeof product.salePrice === 'number' && product.salePrice > 0
      ? product.salePrice
      : typeof product.price === 'number' ? product.price : parseFloat(String(product.price)) || 0;

    // GA4
    sendGAEvent('view_item', {
      currency: curr,
      value: price,
      items: [{
        item_id: product.id,
        item_name: product.name,
        item_category: product.category?.name,
        item_brand: product.brand?.name,
        price: price,
      }],
    });

    // Facebook
    sendFBEvent('ViewContent', {
      content_ids: [product.id],
      content_name: product.name,
      content_type: 'product',
      content_category: product.category?.name,
      value: price,
      currency: curr,
    });

    // TikTok
    sendTTEvent('ViewContent', {
      content_id: product.id,
      content_name: product.name,
      content_type: 'product',
      content_category: product.category?.name,
      value: price,
      currency: curr,
    });
  }, [defaultCurrency, sendGAEvent, sendFBEvent, sendTTEvent]);

  // Track add to cart
  const trackAddToCart = useCallback((product: Product, quantity: number, currency?: string) => {
    const curr = currency || defaultCurrency;
    const price = typeof product.salePrice === 'number' && product.salePrice > 0
      ? product.salePrice
      : typeof product.price === 'number' ? product.price : parseFloat(String(product.price)) || 0;

    // GA4
    sendGAEvent('add_to_cart', {
      currency: curr,
      value: price * quantity,
      items: [{
        item_id: product.id,
        item_name: product.name,
        item_category: product.category?.name,
        item_brand: product.brand?.name,
        price: price,
        quantity: quantity,
      }],
    });

    // Facebook
    sendFBEvent('AddToCart', {
      content_ids: [product.id],
      content_name: product.name,
      content_type: 'product',
      value: price * quantity,
      currency: curr,
      num_items: quantity,
    });

    // TikTok
    sendTTEvent('AddToCart', {
      content_id: product.id,
      content_name: product.name,
      content_type: 'product',
      value: price * quantity,
      currency: curr,
      quantity: quantity,
    });
  }, [defaultCurrency, sendGAEvent, sendFBEvent, sendTTEvent]);

  // Track begin checkout
  const trackBeginCheckout = useCallback((items: AddToCartParams[], value: number, currency?: string) => {
    const curr = currency || defaultCurrency;

    // GA4
    sendGAEvent('begin_checkout', {
      currency: curr,
      value: value,
      items: items.map(item => ({
        item_id: item.item_id,
        item_name: item.item_name,
        item_category: item.item_category,
        item_brand: item.item_brand,
        price: item.price,
        quantity: item.quantity,
      })),
    });

    // Facebook
    sendFBEvent('InitiateCheckout', {
      content_ids: items.map(i => i.item_id),
      content_type: 'product',
      value: value,
      currency: curr,
      num_items: items.reduce((sum, i) => sum + i.quantity, 0),
    });

    // TikTok
    sendTTEvent('InitiateCheckout', {
      content_ids: items.map(i => i.item_id),
      content_type: 'product',
      value: value,
      currency: curr,
      quantity: items.reduce((sum, i) => sum + i.quantity, 0),
    });
  }, [defaultCurrency, sendGAEvent, sendFBEvent, sendTTEvent]);

  // Track purchase
  const trackPurchase = useCallback((params: PurchaseParams) => {
    // GA4
    sendGAEvent('purchase', {
      transaction_id: params.transaction_id,
      value: params.value,
      currency: params.currency,
      items: params.items.map(item => ({
        item_id: item.item_id,
        item_name: item.item_name,
        price: item.price,
        quantity: item.quantity,
      })),
    });

    // Facebook
    sendFBEvent('Purchase', {
      content_ids: params.items.map(i => i.item_id),
      content_type: 'product',
      value: params.value,
      currency: params.currency,
      num_items: params.items.reduce((sum, i) => sum + i.quantity, 0),
    });

    // TikTok
    sendTTEvent('CompletePayment', {
      content_ids: params.items.map(i => i.item_id),
      content_type: 'product',
      value: params.value,
      currency: params.currency,
      quantity: params.items.reduce((sum, i) => sum + i.quantity, 0),
    });
  }, [sendGAEvent, sendFBEvent, sendTTEvent]);

  // Track search
  const trackSearch = useCallback((searchTerm: string) => {
    sendGAEvent('search', { search_term: searchTerm });
    sendFBEvent('Search', { search_string: searchTerm });
    sendTTEvent('Search', { query: searchTerm });
  }, [sendGAEvent, sendFBEvent, sendTTEvent]);

  // Generic event tracking
  const trackEvent = useCallback((event: TrackingEvent) => {
    sendGAEvent(event.event, event.params);
  }, [sendGAEvent]);

  const value = useMemo<TrackingContextValue>(() => ({
    trackPageView,
    trackViewItem,
    trackAddToCart,
    trackBeginCheckout,
    trackPurchase,
    trackSearch,
    trackEvent,
    isEnabled,
  }), [trackPageView, trackViewItem, trackAddToCart, trackBeginCheckout, trackPurchase, trackSearch, trackEvent, isEnabled]);

  return (
    <TrackingContext.Provider value={value}>
      {/* Google Tag Manager */}
      {gtmId && (
        <>
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
        </>
      )}

      {/* Google Analytics 4 */}
      {gaId && !gtmId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            strategy="afterInteractive"
          />
          <Script
            id="ga4-config"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}', {
                  page_path: window.location.pathname,
                });
              `,
            }}
          />
        </>
      )}

      {/* Facebook Pixel */}
      {fbPixelId && (
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
              fbq('init', '${fbPixelId}');
              fbq('track', 'PageView');
            `,
          }}
        />
      )}

      {/* TikTok Pixel */}
      {tiktokPixelId && (
        <Script
          id="tiktok-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function (w, d, t) {
                w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
                ttq.load('${tiktokPixelId}');
                ttq.page();
              }(window, document, 'ttq');
            `,
          }}
        />
      )}

      {children}
    </TrackingContext.Provider>
  );
}

// Hook para usar el tracking
export function useTracking() {
  const context = useContext(TrackingContext);

  // Si no hay provider, retornamos funciones vacías (para SSR o cuando no hay tracking)
  if (!context) {
    return {
      trackPageView: () => {},
      trackViewItem: () => {},
      trackAddToCart: () => {},
      trackBeginCheckout: () => {},
      trackPurchase: () => {},
      trackSearch: () => {},
      trackEvent: () => {},
      isEnabled: false,
    };
  }

  return context;
}
