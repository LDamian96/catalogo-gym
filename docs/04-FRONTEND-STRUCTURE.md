# Frontend Structure - Next.js (App Router)

## Stack Frontend

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         FRONTEND STACK                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Next.js (App Router)     → Framework React con SSR/SSG/ISR            │
│  TypeScript               → Tipado estático                            │
│  Tailwind CSS             → Utilidades CSS                             │
│  shadcn/ui                → Componentes UI ultra modernos              │
│  Framer Motion            → Animaciones y transiciones fluidas         │
│  Zustand                  → Estado global                              │
│  React Hook Form + Zod    → Formularios y validación                   │
│  Lucide React             → Iconos                                     │
│  qrcode.react             → Generación de QR                           │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Estructura de Carpetas

```
frontend/
├── public/
│   ├── images/
│   │   ├── placeholder.png
│   │   └── logo-default.png
│   └── fonts/
│
├── src/
│   ├── app/                              # App Router
│   │   ├── layout.tsx                    # Root layout
│   │   ├── page.tsx                      # Catálogo público (/)
│   │   ├── loading.tsx                   # Loading UI global
│   │   ├── error.tsx                     # Error UI global
│   │   ├── not-found.tsx                 # 404 page
│   │   │
│   │   ├── (catalog)/                    # Grupo: Catálogo público
│   │   │   ├── layout.tsx                # Layout público con animaciones
│   │   │   ├── producto/
│   │   │   │   └── [slug]/
│   │   │   │       ├── page.tsx          # Detalle producto
│   │   │   │       ├── loading.tsx
│   │   │   │       └── opengraph-image.tsx
│   │   │   │
│   │   │   ├── categoria/
│   │   │   │   └── [slug]/
│   │   │   │       ├── page.tsx
│   │   │   │       └── loading.tsx
│   │   │   │
│   │   │   └── buscar/
│   │   │       ├── page.tsx
│   │   │       └── loading.tsx
│   │   │
│   │   ├── (admin)/                      # Grupo: Panel admin
│   │   │   ├── layout.tsx                # Layout admin con sidebar
│   │   │   │
│   │   │   ├── admin/
│   │   │   │   ├── page.tsx              # Dashboard
│   │   │   │   ├── configuracion/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── categorias/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── [id]/page.tsx
│   │   │   │   ├── productos/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── nuevo/page.tsx
│   │   │   │   │   └── [id]/
│   │   │   │   │       ├── page.tsx
│   │   │   │   │       └── variantes/page.tsx
│   │   │   │   ├── qr/
│   │   │   │   │   └── page.tsx          # Generador QR
│   │   │   │   ├── estadisticas/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── importar/
│   │   │   │       └── page.tsx
│   │   │   │
│   │   │   └── login/
│   │   │       └── page.tsx
│   │   │
│   │   └── api/
│   │       └── revalidate/
│   │           └── route.ts
│   │
│   ├── components/
│   │   ├── ui/                           # shadcn/ui components
│   │   │   ├── accordion.tsx
│   │   │   ├── alert-dialog.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── checkbox.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── form.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── popover.tsx
│   │   │   ├── select.tsx
│   │   │   ├── separator.tsx
│   │   │   ├── sheet.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── slider.tsx
│   │   │   ├── switch.tsx
│   │   │   ├── table.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── toaster.tsx
│   │   │   └── tooltip.tsx
│   │   │
│   │   ├── animations/                   # Framer Motion wrappers
│   │   │   ├── fade-in.tsx
│   │   │   ├── slide-up.tsx
│   │   │   ├── scale-in.tsx
│   │   │   ├── stagger-container.tsx
│   │   │   ├── page-transition.tsx
│   │   │   ├── animated-counter.tsx
│   │   │   ├── animated-presence.tsx
│   │   │   └── motion-config.tsx
│   │   │
│   │   ├── layout/
│   │   │   ├── header.tsx
│   │   │   ├── footer.tsx
│   │   │   ├── admin-sidebar.tsx
│   │   │   ├── admin-header.tsx
│   │   │   ├── mobile-nav.tsx
│   │   │   └── theme-toggle.tsx
│   │   │
│   │   ├── catalog/
│   │   │   ├── product-card.tsx
│   │   │   ├── product-grid.tsx
│   │   │   ├── product-gallery.tsx
│   │   │   ├── product-info.tsx
│   │   │   ├── variant-selector.tsx
│   │   │   ├── category-list.tsx
│   │   │   ├── category-card.tsx
│   │   │   ├── search-bar.tsx
│   │   │   ├── search-results.tsx
│   │   │   ├── featured-products.tsx
│   │   │   ├── price-display.tsx
│   │   │   ├── stock-badge.tsx
│   │   │   └── whatsapp-button.tsx
│   │   │
│   │   ├── cart/
│   │   │   ├── cart-provider.tsx
│   │   │   ├── cart-drawer.tsx
│   │   │   ├── cart-item.tsx
│   │   │   ├── cart-summary.tsx
│   │   │   ├── cart-button.tsx
│   │   │   └── checkout-whatsapp.tsx
│   │   │
│   │   ├── qr/                           # Generación de QR
│   │   │   ├── qr-generator.tsx
│   │   │   ├── qr-preview.tsx
│   │   │   ├── qr-download.tsx
│   │   │   └── qr-share.tsx
│   │   │
│   │   ├── admin/
│   │   │   ├── dashboard-stats.tsx
│   │   │   ├── settings-form.tsx
│   │   │   ├── category-form.tsx
│   │   │   ├── category-table.tsx
│   │   │   ├── product-form.tsx
│   │   │   ├── product-table.tsx
│   │   │   ├── variant-group-form.tsx
│   │   │   ├── variant-option-form.tsx
│   │   │   ├── image-uploader.tsx
│   │   │   ├── image-gallery-manager.tsx
│   │   │   ├── excel-importer.tsx
│   │   │   ├── sortable-list.tsx
│   │   │   └── confirm-dialog.tsx
│   │   │
│   │   ├── forms/
│   │   │   ├── form-field.tsx
│   │   │   ├── form-error.tsx
│   │   │   ├── image-field.tsx
│   │   │   ├── price-field.tsx
│   │   │   └── currency-input.tsx
│   │   │
│   │   └── shared/
│   │       ├── page-header.tsx
│   │       ├── empty-state.tsx
│   │       ├── error-boundary.tsx
│   │       ├── loading-overlay.tsx
│   │       └── seo-head.tsx
│   │
│   ├── hooks/
│   │   ├── use-cart.ts
│   │   ├── use-settings.ts
│   │   ├── use-debounce.ts
│   │   ├── use-media-query.ts
│   │   ├── use-scroll-lock.ts
│   │   ├── use-intersection.ts
│   │   └── use-local-storage.ts
│   │
│   ├── lib/
│   │   ├── api/
│   │   │   ├── client.ts
│   │   │   ├── auth.ts
│   │   │   ├── settings.ts
│   │   │   ├── categories.ts
│   │   │   ├── products.ts
│   │   │   ├── variants.ts
│   │   │   ├── stats.ts
│   │   │   └── catalog.ts
│   │   │
│   │   ├── validations/
│   │   │   ├── auth.schema.ts
│   │   │   ├── settings.schema.ts
│   │   │   ├── category.schema.ts
│   │   │   ├── product.schema.ts
│   │   │   └── variant.schema.ts
│   │   │
│   │   ├── utils/
│   │   │   ├── cn.ts
│   │   │   ├── format.ts
│   │   │   ├── whatsapp.ts
│   │   │   └── qr.ts
│   │   │
│   │   └── constants.ts
│   │
│   ├── store/
│   │   ├── cart-store.ts
│   │   ├── settings-store.ts
│   │   └── auth-store.ts
│   │
│   ├── types/
│   │   ├── api.types.ts
│   │   ├── settings.types.ts
│   │   ├── category.types.ts
│   │   ├── product.types.ts
│   │   ├── variant.types.ts
│   │   ├── cart.types.ts
│   │   └── stats.types.ts
│   │
│   └── styles/
│       └── globals.css
│
├── .env.local
├── .env.example
├── components.json              # shadcn/ui config
├── next.config.js
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
├── package.json
└── Dockerfile
```

---

## shadcn/ui Setup

```bash
# Inicializar shadcn/ui
npx shadcn@latest init

# Instalar componentes necesarios
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add dialog
npx shadcn@latest add dropdown-menu
npx shadcn@latest add form
npx shadcn@latest add input
npx shadcn@latest add label
npx shadcn@latest add select
npx shadcn@latest add sheet
npx shadcn@latest add skeleton
npx shadcn@latest add switch
npx shadcn@latest add table
npx shadcn@latest add tabs
npx shadcn@latest add textarea
npx shadcn@latest add toast
npx shadcn@latest add tooltip
npx shadcn@latest add badge
npx shadcn@latest add avatar
npx shadcn@latest add separator
npx shadcn@latest add alert-dialog
npx shadcn@latest add popover
npx shadcn@latest add slider
npx shadcn@latest add checkbox
npx shadcn@latest add accordion
```

```json
// components.json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "src/styles/globals.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

---

## Framer Motion - Sistema de Animaciones Completo

### Configuración Global

```typescript
// components/animations/motion-config.tsx
'use client';

import { MotionConfig } from 'framer-motion';

export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      {children}
    </MotionConfig>
  );
}
```

### Variantes de Animación

```typescript
// lib/utils/animations.ts
import { Variants } from 'framer-motion';

// ========================================
// FADE ANIMATIONS
// ========================================
export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export const fadeInDown: Variants = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
};

export const fadeInLeft: Variants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
};

export const fadeInRight: Variants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

// ========================================
// SCALE ANIMATIONS
// ========================================
export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
};

export const scaleInBounce: Variants = {
  initial: { opacity: 0, scale: 0.3 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 20,
    },
  },
  exit: { opacity: 0, scale: 0.3 },
};

export const popIn: Variants = {
  initial: { opacity: 0, scale: 0.8, y: 10 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 25,
    },
  },
  exit: { opacity: 0, scale: 0.8, y: 10 },
};

// ========================================
// SLIDE ANIMATIONS
// ========================================
export const slideInFromLeft: Variants = {
  initial: { x: '-100%', opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: '-100%', opacity: 0 },
};

export const slideInFromRight: Variants = {
  initial: { x: '100%', opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: '100%', opacity: 0 },
};

export const slideInFromBottom: Variants = {
  initial: { y: '100%', opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: { y: '100%', opacity: 0 },
};

export const slideInFromTop: Variants = {
  initial: { y: '-100%', opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: { y: '-100%', opacity: 0 },
};

// ========================================
// STAGGER ANIMATIONS (para listas)
// ========================================
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
  exit: {
    transition: {
      staggerChildren: 0.03,
      staggerDirection: -1,
    },
  },
};

export const staggerItem: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 24,
    },
  },
  exit: { opacity: 0, y: 20 },
};

export const staggerItemScale: Variants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 24,
    },
  },
  exit: { opacity: 0, scale: 0.8 },
};

// ========================================
// HOVER ANIMATIONS
// ========================================
export const hoverScale = {
  scale: 1.02,
  transition: { type: 'spring', stiffness: 400, damping: 17 },
};

export const hoverLift = {
  y: -4,
  boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
  transition: { type: 'spring', stiffness: 400, damping: 17 },
};

export const tapScale = {
  scale: 0.98,
};

// ========================================
// PAGE TRANSITIONS
// ========================================
export const pageTransition: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

// ========================================
// MODAL/DIALOG ANIMATIONS
// ========================================
export const modalOverlay: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const modalContent: Variants = {
  initial: { opacity: 0, scale: 0.95, y: 10 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 25,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: { duration: 0.2 },
  },
};

export const drawerContent: Variants = {
  initial: { x: '100%' },
  animate: {
    x: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
  },
  exit: {
    x: '100%',
    transition: { duration: 0.2 },
  },
};

// ========================================
// SPECIAL ANIMATIONS
// ========================================
export const shimmer: Variants = {
  initial: { x: '-100%' },
  animate: {
    x: '100%',
    transition: {
      repeat: Infinity,
      duration: 1.5,
      ease: 'linear',
    },
  },
};

export const pulse: Variants = {
  initial: { scale: 1 },
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      repeat: Infinity,
      duration: 2,
      ease: 'easeInOut',
    },
  },
};

export const float: Variants = {
  initial: { y: 0 },
  animate: {
    y: [-5, 5, -5],
    transition: {
      repeat: Infinity,
      duration: 3,
      ease: 'easeInOut',
    },
  },
};
```

### Componentes de Animación Reutilizables

```typescript
// components/animations/fade-in.tsx
'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { fadeIn, fadeInUp, fadeInDown, fadeInLeft, fadeInRight } from '@/lib/utils/animations';

interface FadeInProps extends HTMLMotionProps<'div'> {
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  delay?: number;
  duration?: number;
}

const variants = {
  none: fadeIn,
  up: fadeInUp,
  down: fadeInDown,
  left: fadeInLeft,
  right: fadeInRight,
};

export function FadeIn({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.5,
  ...props
}: FadeInProps) {
  return (
    <motion.div
      variants={variants[direction]}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration, delay, ease: [0.25, 0.1, 0.25, 1] }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
```

```typescript
// components/animations/stagger-container.tsx
'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { staggerContainer, staggerItem } from '@/lib/utils/animations';

interface StaggerContainerProps extends HTMLMotionProps<'div'> {
  staggerDelay?: number;
}

export function StaggerContainer({
  children,
  staggerDelay = 0.05,
  ...props
}: StaggerContainerProps) {
  return (
    <motion.div
      variants={{
        ...staggerContainer,
        animate: {
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: 0.1,
          },
        },
      }}
      initial="initial"
      animate="animate"
      exit="exit"
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, ...props }: HTMLMotionProps<'div'>) {
  return (
    <motion.div variants={staggerItem} {...props}>
      {children}
    </motion.div>
  );
}
```

```typescript
// components/animations/page-transition.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { pageTransition } from '@/lib/utils/animations';

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        variants={pageTransition}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
```

```typescript
// components/animations/animated-counter.tsx
'use client';

import { motion, useSpring, useTransform } from 'framer-motion';
import { useEffect } from 'react';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  className?: string;
}

export function AnimatedCounter({
  value,
  duration = 1,
  className,
}: AnimatedCounterProps) {
  const spring = useSpring(0, {
    stiffness: 100,
    damping: 30,
    duration: duration * 1000,
  });

  const display = useTransform(spring, (current) =>
    Math.round(current).toLocaleString()
  );

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return <motion.span className={className}>{display}</motion.span>;
}
```

---

## Componentes con Animaciones

### Product Card con Animación

```typescript
// components/catalog/product-card.tsx
'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { hoverLift, tapScale } from '@/lib/utils/animations';
import { Product } from '@/types/product.types';
import { formatPrice } from '@/lib/utils/format';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const hasDiscount = product.salePrice && product.salePrice < product.price;

  return (
    <Link href={`/producto/${product.slug}`}>
      <motion.div
        whileHover={hoverLift}
        whileTap={tapScale}
        className="h-full"
      >
        <Card className="overflow-hidden h-full bg-white border-0 shadow-sm hover:shadow-xl transition-shadow duration-300">
          <div className="relative aspect-square overflow-hidden bg-gray-100">
            <motion.div
              className="absolute inset-0"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            >
              <Image
                src={product.images[0]?.url || '/images/placeholder.png'}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
            </motion.div>

            {/* Badges animados */}
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {hasDiscount && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Badge variant="destructive" className="text-xs">
                    OFERTA
                  </Badge>
                </motion.div>
              )}
              {product.isFeatured && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Badge className="text-xs bg-amber-500">
                    DESTACADO
                  </Badge>
                </motion.div>
              )}
            </div>
          </div>

          <CardContent className="p-4">
            <motion.h3
              className="font-medium text-gray-900 line-clamp-2 mb-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              {product.name}
            </motion.h3>

            {product.showPrice && (
              <motion.div
                className="flex items-center gap-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {hasDiscount ? (
                  <>
                    <span className="text-lg font-bold text-primary">
                      {formatPrice(product.salePrice!, product.currency)}
                    </span>
                    <span className="text-sm text-gray-400 line-through">
                      {formatPrice(product.price, product.currency)}
                    </span>
                  </>
                ) : (
                  <span className="text-lg font-bold text-gray-900">
                    {formatPrice(product.price, product.currency)}
                  </span>
                )}
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  );
}
```

### Product Grid con Stagger

```typescript
// components/catalog/product-grid.tsx
'use client';

import { motion } from 'framer-motion';
import { ProductCard } from './product-card';
import { staggerContainer, staggerItem } from '@/lib/utils/animations';
import { Product } from '@/types/product.types';

interface ProductGridProps {
  products: Product[];
}

export function ProductGrid({ products }: ProductGridProps) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
    >
      {products.map((product) => (
        <motion.div key={product.id} variants={staggerItem}>
          <ProductCard product={product} />
        </motion.div>
      ))}
    </motion.div>
  );
}
```

### Cart Drawer con Slide Animation

```typescript
// components/cart/cart-drawer.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useCartStore } from '@/store/cart-store';
import { CartItem } from './cart-item';
import { CartSummary } from './cart-summary';
import { modalOverlay, drawerContent, staggerContainer, staggerItem } from '@/lib/utils/animations';

export function CartDrawer() {
  const { items, isOpen, toggleCart, getTotal, getItemCount } = useCartStore();

  return (
    <Sheet open={isOpen} onOpenChange={toggleCart}>
      <SheetContent className="w-full sm:max-w-lg p-0 overflow-hidden">
        <motion.div
          variants={drawerContent}
          initial="initial"
          animate="animate"
          exit="exit"
          className="h-full flex flex-col"
        >
          <SheetHeader className="p-6 border-b">
            <SheetTitle className="flex items-center gap-2">
              <motion.div
                initial={{ rotate: -10, scale: 0.9 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <ShoppingBag className="h-5 w-5" />
              </motion.div>
              <span>Tu Carrito</span>
              <motion.span
                key={getItemCount()}
                initial={{ scale: 1.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="ml-auto text-sm text-muted-foreground"
              >
                ({getItemCount()} items)
              </motion.span>
            </SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto p-6">
            {items.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
              >
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <ShoppingBag className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                </motion.div>
                <p className="text-gray-500">Tu carrito está vacío</p>
              </motion.div>
            ) : (
              <motion.div
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                className="space-y-4"
              >
                <AnimatePresence mode="popLayout">
                  {items.map((item, index) => (
                    <motion.div
                      key={`${item.productId}-${JSON.stringify(item.variants)}`}
                      variants={staggerItem}
                      layout
                      exit={{ opacity: 0, x: -100, transition: { duration: 0.2 } }}
                    >
                      <CartItem item={item} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </div>

          {items.length > 0 && (
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="border-t p-6"
            >
              <CartSummary />
            </motion.div>
          )}
        </motion.div>
      </SheetContent>
    </Sheet>
  );
}
```

---

## QR Generator Component

```typescript
// components/qr/qr-generator.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Copy, Share2, Check, Link2, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { scaleInBounce, fadeInUp } from '@/lib/utils/animations';

interface QRGeneratorProps {
  baseUrl: string;
  categories: { id: string; name: string; slug: string }[];
  products: { id: string; name: string; slug: string }[];
}

export function QRGenerator({ baseUrl, categories, products }: QRGeneratorProps) {
  const [qrType, setQrType] = useState<'catalog' | 'category' | 'product'>('catalog');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const getQRUrl = () => {
    switch (qrType) {
      case 'category':
        return selectedCategory ? `${baseUrl}/categoria/${selectedCategory}` : baseUrl;
      case 'product':
        return selectedProduct ? `${baseUrl}/producto/${selectedProduct}` : baseUrl;
      default:
        return baseUrl;
    }
  };

  const qrUrl = getQRUrl();

  const handleCopy = async () => {
    await navigator.clipboard.writeText(qrUrl);
    setCopied(true);
    toast({ title: 'Link copiado', description: 'El link ha sido copiado al portapapeles' });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPNG = () => {
    const svg = document.getElementById('qr-code');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = 1024;
      canvas.height = 1024;
      ctx?.drawImage(img, 0, 0, 1024, 1024);
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `qr-${qrType}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: 'Mi Catálogo',
        url: qrUrl,
      });
    } else {
      handleCopy();
    }
  };

  return (
    <motion.div
      variants={fadeInUp}
      initial="initial"
      animate="animate"
      className="space-y-6"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Generador de QR
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={qrType} onValueChange={(v) => setQrType(v as typeof qrType)}>
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="catalog">Catálogo</TabsTrigger>
              <TabsTrigger value="category">Categoría</TabsTrigger>
              <TabsTrigger value="product">Producto</TabsTrigger>
            </TabsList>

            <TabsContent value="category" className="mb-6">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.slug}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </TabsContent>

            <TabsContent value="product" className="mb-6">
              <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un producto" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((prod) => (
                    <SelectItem key={prod.id} value={prod.slug}>
                      {prod.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </TabsContent>
          </Tabs>

          <div className="flex flex-col items-center">
            {/* QR Code con animación */}
            <AnimatePresence mode="wait">
              <motion.div
                key={qrUrl}
                variants={scaleInBounce}
                initial="initial"
                animate="animate"
                exit="exit"
                className="bg-white p-6 rounded-2xl shadow-lg mb-6"
              >
                <QRCodeSVG
                  id="qr-code"
                  value={qrUrl}
                  size={256}
                  level="H"
                  includeMargin
                  className="rounded-lg"
                />
              </motion.div>
            </AnimatePresence>

            {/* URL Display */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-2 bg-gray-100 rounded-lg px-4 py-2 mb-6 max-w-full"
            >
              <Link2 className="h-4 w-4 text-gray-500 flex-shrink-0" />
              <span className="text-sm text-gray-600 truncate">{qrUrl}</span>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap gap-3 justify-center"
            >
              <Button
                variant="outline"
                onClick={handleCopy}
                className="gap-2"
              >
                <AnimatePresence mode="wait">
                  {copied ? (
                    <motion.div
                      key="check"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <Check className="h-4 w-4 text-green-500" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="copy"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <Copy className="h-4 w-4" />
                    </motion.div>
                  )}
                </AnimatePresence>
                {copied ? 'Copiado' : 'Copiar Link'}
              </Button>

              <Button
                onClick={handleDownloadPNG}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Descargar PNG
              </Button>

              <Button
                variant="secondary"
                onClick={handleShare}
                className="gap-2"
              >
                <Share2 className="h-4 w-4" />
                Compartir
              </Button>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
```

---

## Loading States Ultra Modernos

```typescript
// components/ui/skeleton.tsx (enhanced)
'use client';

import { cn } from '@/lib/utils/cn';
import { motion } from 'framer-motion';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'shimmer' | 'pulse';
}

export function Skeleton({ className, variant = 'shimmer', ...props }: SkeletonProps) {
  if (variant === 'shimmer') {
    return (
      <div
        className={cn(
          'relative overflow-hidden rounded-md bg-gray-200',
          className
        )}
        {...props}
      >
        <motion.div
          className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent"
          animate={{ translateX: ['calc(-100%)', 'calc(100%)'] }}
          transition={{
            repeat: Infinity,
            duration: 1.5,
            ease: 'linear',
          }}
        />
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <motion.div
        className={cn('rounded-md bg-gray-200', className)}
        animate={{ opacity: [1, 0.5, 1] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
        {...props}
      />
    );
  }

  return (
    <div
      className={cn('animate-pulse rounded-md bg-gray-200', className)}
      {...props}
    />
  );
}

// Product Card Skeleton
export function ProductCardSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="rounded-xl border bg-white overflow-hidden"
    >
      <Skeleton className="aspect-square w-full" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-6 w-1/3" />
      </div>
    </motion.div>
  );
}

// Grid Skeleton
export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          <ProductCardSkeleton />
        </motion.div>
      ))}
    </div>
  );
}
```

---

## Error UI Ultra Moderno

```typescript
// app/(catalog)/error.tsx
'use client';

import { motion } from 'framer-motion';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-[60vh] flex items-center justify-center px-4"
    >
      <div className="text-center max-w-md">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: 'spring',
            stiffness: 200,
            damping: 15,
            delay: 0.1,
          }}
          className="w-24 h-24 mx-auto mb-8 rounded-full bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center"
        >
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              repeat: Infinity,
              duration: 2,
              ease: 'easeInOut',
            }}
          >
            <AlertCircle className="w-12 h-12 text-red-500" />
          </motion.div>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold text-gray-900 mb-3"
        >
          ¡Ups! Algo salió mal
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-gray-600 mb-8"
        >
          No pudimos cargar esta página. Por favor intenta de nuevo.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <Button onClick={reset} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Reintentar
          </Button>
          <Button variant="outline" asChild>
            <Link href="/" className="gap-2">
              <Home className="w-4 h-4" />
              Ir al inicio
            </Link>
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}
```

---

## Estrategia de Rendering

### SSG con Revalidación
```typescript
// app/(catalog)/page.tsx
export const revalidate = 300; // 5 minutos

export default async function CatalogPage() {
  const data = await getCatalog();
  return <CatalogView {...data} />;
}
```

### ISR para Productos
```typescript
// app/(catalog)/producto/[slug]/page.tsx
export async function generateStaticParams() {
  const products = await getAllProductSlugs();
  return products.map((p) => ({ slug: p.slug }));
}

export const revalidate = 600; // 10 minutos
```

### Dynamic para Búsqueda
```typescript
// app/(catalog)/buscar/page.tsx
export const dynamic = 'force-dynamic';
```
