'use client';

import { ReactNode } from 'react';
import { TrackingProvider } from '@/components/tracking';
import { CartProvider } from '@/hooks/useCart';
import { CartDrawer } from './CartDrawer';
import { CartButton } from './CartButton';
import { PageTransitionProvider } from './PageTransition';
import type { CatalogSettings } from '@/lib/api/catalog';

interface CatalogWrapperProps {
  children: ReactNode;
  settings: CatalogSettings | null;
}

/**
 * Wrapper para el catálogo público que provee el contexto de tracking y carrito.
 * Incluye PageTransitionProvider para transiciones suaves entre páginas.
 */
export function CatalogWrapper({ children, settings }: CatalogWrapperProps) {
  const cartEnabled = settings?.cartEnabled ?? false;
  const whatsapp = settings?.whatsapp || '';
  const businessName = settings?.businessName || 'la tienda';

  return (
    <TrackingProvider settings={settings}>
      <CartProvider>
        <PageTransitionProvider>
          {children}
          {cartEnabled && (
            <>
              <CartDrawer
                whatsapp={whatsapp}
                businessName={businessName}
                currency="S/"
              />
              {/* Botón flotante del carrito - Solo en desktop */}
              <div className="fixed bottom-24 right-6 z-40 hidden lg:block">
                <CartButton />
              </div>
            </>
          )}
        </PageTransitionProvider>
      </CartProvider>
    </TrackingProvider>
  );
}
