'use client';

import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, Grid3X3, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', icon: Home, label: 'Inicio', gradient: 'from-violet-500 to-purple-600' },
  { href: '/categorias', icon: Grid3X3, label: 'Categorías', gradient: 'from-blue-500 to-cyan-500' },
  { href: '/productos', icon: Package, label: 'Productos', gradient: 'from-emerald-500 to-teal-500' },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  const handleNavClick = (href: string) => {
    router.push(href);
  };

  return (
    <motion.nav
      className="fixed bottom-0 left-0 right-0 z-50 lg:hidden"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      {/* Glassmorphism background */}
      <div className="absolute inset-0 bg-white/90 backdrop-blur-xl border-t border-slate-200 shadow-lg" />

      {/* Safe area padding for iPhone */}
      <div className="relative flex items-center justify-around px-4 pt-2 pb-safe">
        {navItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <button
              key={item.href}
              onClick={() => handleNavClick(item.href)}
              className="relative flex flex-col items-center justify-center min-w-[72px] py-2 touch-manipulation"
            >
              {/* Icon container */}
              <div
                className={cn(
                  'relative p-2 rounded-xl transition-all duration-200',
                  isActive ? `bg-gradient-to-br ${item.gradient}` : 'bg-transparent'
                )}
              >
                <Icon
                  className={cn(
                    'w-6 h-6 transition-colors duration-200',
                    isActive ? 'text-white' : 'text-slate-400'
                  )}
                />
              </div>

              {/* Label */}
              <span
                className={cn(
                  'mt-1 text-[10px] font-semibold transition-colors duration-200',
                  isActive ? 'text-slate-900' : 'text-slate-400'
                )}
              >
                {item.label}
              </span>

              {/* Active indicator dot */}
              {isActive && (
                <div
                  className={cn(
                    'absolute -bottom-0.5 w-1 h-1 rounded-full bg-gradient-to-r',
                    item.gradient
                  )}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Home indicator line for iPhone style */}
      <div className="flex justify-center pb-1">
        <div className="w-32 h-1 bg-slate-200 rounded-full" />
      </div>
    </motion.nav>
  );
}
