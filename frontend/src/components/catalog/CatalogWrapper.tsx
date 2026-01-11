'use client';

import { ReactNode } from 'react';
import { TrackingProvider } from '@/components/tracking';
import { CartProvider } from '@/hooks/useCart';
import { CartDrawer } from './CartDrawer';
import { CartButton } from './CartButton';
import type { CatalogSettings } from '@/lib/api/catalog';

interface CatalogWrapperProps {
  children: ReactNode;
  settings: CatalogSettings | null;
}

/**
 * Wrapper para el catálogo público que provee el contexto de tracking y carrito.
 * Inyecta los scripts de Google Analytics, Facebook Pixel y TikTok Pixel
 * basándose en los IDs configurados en settings.
 * CartProvider siempre se incluye para que el Navbar pueda usar useCart.
 * Si cartEnabled está activo, muestra el drawer y botón flotante del carrito.
 */
export function CatalogWrapper({ children, settings }: CatalogWrapperProps) {
  const cartEnabled = settings?.cartEnabled ?? false;
  const whatsapp = settings?.whatsapp || '';
  const businessName = settings?.businessName || 'la tienda';

  return (
    <TrackingProvider settings={settings}>
      <CartProvider>
        {children}
        {cartEnabled && (
          <>
            <CartDrawer
              whatsapp={whatsapp}
              businessName={businessName}
              currency="S/"
            />
            {/* Botón flotante del carrito */}
            <div className="fixed bottom-24 right-6 z-40">
              <CartButton />
            </div>
          </>
        )}
      </CartProvider>
    </TrackingProvider>
  );
}
