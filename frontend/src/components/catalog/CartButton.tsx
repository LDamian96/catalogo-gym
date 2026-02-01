'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { cn } from '@/lib/utils';

interface CartButtonProps {
  className?: string;
}

export function CartButton({ className }: CartButtonProps) {
  const { toggleCart, totalItems } = useCart();

  return (
    <motion.button
      onClick={toggleCart}
      className={cn(
        'relative flex items-center justify-center',
        'w-12 h-12 rounded-full',
        'bg-cyan-600 hover:bg-cyan-700 text-white',
        'shadow-lg shadow-cyan-500/30',
        'transition-colors',
        className
      )}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      <ShoppingCart className="w-5 h-5" />

      {/* Badge */}
      <AnimatePresence>
        {totalItems > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className={cn(
              'absolute -top-1 -right-1',
              'min-w-[20px] h-5 px-1.5',
              'flex items-center justify-center',
              'bg-blue-500 text-white text-xs font-bold rounded-full'
            )}
          >
            {totalItems > 99 ? '99+' : totalItems}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
