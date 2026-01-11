'use client';

import { motion } from 'framer-motion';
import { ShoppingCart, Check } from 'lucide-react';
import { useState } from 'react';
import { useCart, CartItem } from '@/hooks/useCart';
import { cn } from '@/lib/utils';

interface AddToCartButtonProps {
  item: Omit<CartItem, 'quantity'>;
  quantity?: number;
  className?: string;
  showIcon?: boolean;
  fullWidth?: boolean;
}

export function AddToCartButton({
  item,
  quantity = 1,
  className,
  showIcon = true,
  fullWidth = true,
}: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const handleClick = () => {
    addItem({ ...item, quantity });
    setAdded(true);

    // Reset después de 2 segundos
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <motion.button
      onClick={handleClick}
      disabled={added}
      className={cn(
        'flex items-center justify-center gap-2',
        'px-6 py-4 rounded-xl font-semibold',
        'transition-all duration-300',
        added
          ? 'bg-emerald-500 text-white'
          : 'bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/30',
        fullWidth && 'flex-1',
        className
      )}
      whileHover={!added ? { scale: 1.02 } : undefined}
      whileTap={!added ? { scale: 0.98 } : undefined}
    >
      {showIcon && (
        added ? (
          <Check className="w-5 h-5" />
        ) : (
          <ShoppingCart className="w-5 h-5" />
        )
      )}
      {added ? 'Agregado al carrito' : 'Agregar al carrito'}
    </motion.button>
  );
}
