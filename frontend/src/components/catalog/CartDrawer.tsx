'use client';

import { Fragment } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
  X,
  ShoppingBag,
  Minus,
  Plus,
  Trash2,
  MessageCircle,
} from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { cn } from '@/lib/utils';

interface CartDrawerProps {
  whatsapp: string;
  businessName: string;
  currency?: string;
}

export function CartDrawer({ whatsapp, businessName, currency = 'S/' }: CartDrawerProps) {
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice,
    getWhatsAppUrl,
  } = useCart();

  const handleCheckout = () => {
    if (items.length === 0) return;
    const url = getWhatsAppUrl(whatsapp, businessName);
    window.open(url, '_blank');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Fragment>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-[#0a0a0f] shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h2 className="font-semibold text-[#0a0a0f] dark:text-white">
                    Mi Carrito
                  </h2>
                  <p className="text-sm text-neutral-500">
                    {totalItems} {totalItems === 1 ? 'producto' : 'productos'}
                  </p>
                </div>
              </div>
              <button
                onClick={closeCart}
                className="w-10 h-10 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-neutral-500" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-6">
              {items.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center h-full text-center"
                >
                  <div className="w-24 h-24 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-4">
                    <ShoppingBag className="w-12 h-12 text-neutral-300 dark:text-neutral-600" />
                  </div>
                  <h3 className="text-lg font-medium text-[#0a0a0f] dark:text-white mb-2">
                    Tu carrito está vacío
                  </h3>
                  <p className="text-neutral-500 text-sm">
                    Agrega productos para comenzar tu pedido
                  </p>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence mode="popLayout">
                    {items.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20, height: 0 }}
                        className="flex gap-4 p-4 bg-slate-50 dark:bg-neutral-800/50 rounded-xl"
                      >
                        {/* Image */}
                        <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-neutral-200 dark:bg-slate-700 flex-shrink-0">
                          {item.image ? (
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-cover"
                              sizes="80px"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ShoppingBag className="w-8 h-8 text-slate-400" />
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-[#0a0a0f] dark:text-white truncate">
                            {item.name}
                          </h4>
                          {item.variant && (
                            <p className="text-xs text-neutral-500 mt-0.5">
                              {item.variant.values}
                            </p>
                          )}
                          <p className="text-sm font-semibold text-red-600 dark:text-red-400 mt-1">
                            {currency} {item.price.toFixed(2)}
                          </p>

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-7 h-7 rounded-full border border-neutral-200 dark:border-slate-700 flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-slate-700 transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-8 text-center text-sm font-medium text-[#0a0a0f] dark:text-white">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={
                                item.maxStock !== null &&
                                item.maxStock !== undefined &&
                                item.quantity >= item.maxStock
                              }
                              className={cn(
                                'w-7 h-7 rounded-full border border-neutral-200 dark:border-slate-700 flex items-center justify-center transition-colors',
                                item.maxStock !== null &&
                                  item.maxStock !== undefined &&
                                  item.quantity >= item.maxStock
                                  ? 'opacity-50 cursor-not-allowed'
                                  : 'hover:bg-neutral-100 dark:hover:bg-slate-700'
                              )}
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="ml-auto w-7 h-7 rounded-full text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 flex items-center justify-center transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Clear Cart Button */}
                  {items.length > 0 && (
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      onClick={clearCart}
                      className="w-full py-2 text-sm text-neutral-500 hover:text-rose-500 transition-colors"
                    >
                      Vaciar carrito
                    </motion.button>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="border-t border-neutral-200 dark:border-neutral-800 p-6 space-y-4"
              >
                {/* Total */}
                <div className="flex items-center justify-between">
                  <span className="text-neutral-600 dark:text-slate-400">Total</span>
                  <span className="text-2xl font-bold text-[#0a0a0f] dark:text-white">
                    {currency} {totalPrice.toFixed(2)}
                  </span>
                </div>

                {/* Checkout Button */}
                <motion.button
                  onClick={handleCheckout}
                  className={cn(
                    'w-full flex items-center justify-center gap-3',
                    'px-6 py-4 rounded-xl font-semibold text-white',
                    'bg-gradient-to-r from-green-500 to-green-600',
                    'shadow-lg shadow-green-500/25',
                    'hover:shadow-xl hover:shadow-green-500/30 transition-all'
                  )}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <MessageCircle className="w-5 h-5" />
                  Enviar pedido por WhatsApp
                </motion.button>

                <p className="text-xs text-center text-neutral-500">
                  Se abrirá WhatsApp con tu pedido listo para enviar
                </p>
              </motion.div>
            )}
          </motion.div>
        </Fragment>
      )}
    </AnimatePresence>
  );
}
