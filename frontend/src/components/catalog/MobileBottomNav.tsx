'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, Grid3X3, Package, ShoppingCart, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { useCart } from '@/hooks/useCart';

const navItems = [
  { href: '/', icon: Home, label: 'Inicio' },
  { href: '/categorias', icon: Grid3X3, label: 'Categorías' },
  { href: '/productos', icon: Package, label: 'Productos' },
  { href: 'cart', icon: ShoppingCart, label: 'Carrito', showBadge: true, isCartAction: true },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const { items, openCart } = useCart();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-white/90 dark:bg-black/90 backdrop-blur-xl border-t border-black/[0.08] dark:border-white/[0.08]" />

      <div className="relative flex items-center justify-around px-4 py-2 pb-[env(safe-area-inset-bottom)]">
        {navItems.map((item) => {
          const isActive = !item.isCartAction && (pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(item.href)));
          const Icon = item.icon;
          const showBadge = item.showBadge && cartItemCount > 0;

          if (item.isCartAction) {
            return (
              <button
                key={item.href}
                onClick={openCart}
                className="relative flex flex-col items-center justify-center px-3 py-1.5 touch-manipulation active:scale-90 transition-transform duration-75"
              >
                <div className="relative">
                  <Icon className="w-5 h-5 text-neutral-400 dark:text-neutral-500" strokeWidth={1.5} />
                  {showBadge && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 flex items-center justify-center text-[10px] font-semibold rounded-full bg-cyan-500 text-white">
                      {cartItemCount > 9 ? '9+' : cartItemCount}
                    </span>
                  )}
                </div>
                <span className="mt-1 text-[10px] font-medium text-neutral-400 dark:text-neutral-500">
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={true}
              className={cn(
                'relative flex flex-col items-center justify-center px-3 py-1.5 touch-manipulation active:scale-90 transition-transform duration-75',
                isActive
                  ? 'text-cyan-600 dark:text-white'
                  : 'text-neutral-400 dark:text-neutral-500'
              )}
            >
              <Icon className="w-5 h-5" strokeWidth={isActive ? 2 : 1.5} />
              <span className="mt-1 text-[10px] font-medium">{item.label}</span>
              {isActive && (
                <div className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-cyan-500 dark:bg-white" />
              )}
            </Link>
          );
        })}

        {mounted && (
          <button
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            className="relative flex flex-col items-center justify-center px-3 py-1.5 touch-manipulation active:scale-90 transition-transform duration-75"
          >
            {resolvedTheme === 'dark' ? (
              <Sun className="w-5 h-5 text-neutral-400 dark:text-neutral-500" strokeWidth={1.5} />
            ) : (
              <Moon className="w-5 h-5 text-neutral-400 dark:text-neutral-500" strokeWidth={1.5} />
            )}
            <span className="mt-1 text-[10px] font-medium text-neutral-400 dark:text-neutral-500">Tema</span>
          </button>
        )}
      </div>
    </nav>
  );
}
