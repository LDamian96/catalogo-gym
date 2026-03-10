'use client';

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
    <button
      onClick={handleClick}
      disabled={added}
      className={cn(
        'flex items-center justify-center gap-2',
        'px-5 py-2.5 rounded-lg text-sm font-medium',
        'transition-colors duration-200',
        added
          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
          : 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100',
        fullWidth && 'w-full',
        className
      )}
    >
      {showIcon && (
        added ? (
          <Check className="w-4 h-4" />
        ) : (
          <ShoppingCart className="w-4 h-4" />
        )
      )}
      {added ? 'Agregado' : 'Agregar al carrito'}
    </button>
  );
}
