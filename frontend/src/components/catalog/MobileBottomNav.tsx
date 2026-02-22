'use client';

import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Grid3X3, Package, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { v0Ease } from '@/lib/animations';
import { useCart } from '@/hooks/useCart';

const navItems = [
  { href: '/', icon: Home, label: 'Inicio' },
  { href: '/categorias', icon: Grid3X3, label: 'Categorías' },
  { href: '/productos', icon: Package, label: 'Productos' },
  { href: 'cart', icon: ShoppingCart, label: 'Carrito', showBadge: true, isCartAction: true },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { items, openCart } = useCart();

  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleNavClick = (href: string, isCartAction?: boolean) => {
    if (isCartAction) {
      openCart();
    } else {
      router.push(href);
    }
  };

  return (
    <motion.nav
      className="fixed bottom-0 left-0 right-0 z-50 lg:hidden"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.4, ease: v0Ease }}
    >
      {/* V0 Minimal Glass Background */}
      <div className="absolute inset-0 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-t border-black/[0.08] dark:border-white/[0.08]" />

      {/* Navigation Items */}
      <div className="relative flex items-center justify-around px-4 py-2 pb-safe">
        {navItems.map((item) => {
          const isActive = !item.isCartAction && (pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(item.href)));
          const Icon = item.icon;
          const showBadge = item.showBadge && cartItemCount > 0;

          return (
            <motion.button
              key={item.href}
              onClick={() => handleNavClick(item.href, item.isCartAction)}
              className="relative flex flex-col items-center justify-center px-4 py-1.5 touch-manipulation"
              whileTap={{ scale: 0.95 }}
            >
              {/* Icon */}
              <div className="relative">
                <Icon
                  className={cn(
                    'w-5 h-5 transition-colors duration-200',
                    isActive
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-neutral-400 dark:text-neutral-500'
                  )}
                  strokeWidth={isActive ? 2 : 1.5}
                />

                {/* Cart Badge */}
                {showBadge && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 flex items-center justify-center text-[10px] font-semibold rounded-full bg-gradient-to-r from-red-500 to-orange-500 text-white">
                    {cartItemCount > 9 ? '9+' : cartItemCount}
                  </span>
                )}
              </div>

              {/* Label */}
              <span
                className={cn(
                  'mt-1 text-[10px] font-medium transition-colors duration-200',
                  isActive
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-neutral-400 dark:text-neutral-500'
                )}
              >
                {item.label}
              </span>

              {/* Active Indicator */}
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-gradient-to-r from-red-500 to-orange-500"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  />
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>
    </motion.nav>
  );
}
