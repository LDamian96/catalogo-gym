'use client';

import { Fragment } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
  ShoppingBag,
  Minus,
  Plus,
  Trash2,

  ArrowLeft,
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

  // Calculate discount (if any items have sale prices)
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = subtotal - totalPrice;

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

          {/* Drawer - BETA.pen Screen 06 style */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md z-50 flex flex-col bg-gradient-to-b from-[#EFF9FF] via-[#DBEAFE] to-[#E0F2FE] dark:from-[#0A0A0A] dark:via-[#0A0A0A] dark:to-[#111111] lg:bg-white lg:dark:bg-neutral-950 lg:bg-none"
          >
            {/* Hero Header - Gradient cyan-to-blue */}
            <div className="bg-gradient-to-br from-[#06B6D4] via-[#0284C7] to-[#1D4ED8] rounded-b-[26px] shadow-[0_8px_24px_#0EA5E926] px-4 pt-5 pb-4 flex flex-col gap-2.5 lg:rounded-none lg:shadow-none">
              {/* Top row */}
              <div className="flex items-center justify-between">
                <button
                  onClick={closeCart}
                  className="flex items-center gap-1.5 text-white/90"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                {totalItems > 0 && (
                  <span className="bg-white/20 text-white text-[12px] font-semibold px-3 py-1 rounded-full">
                    {totalItems} {totalItems === 1 ? 'item' : 'items'}
                  </span>
                )}
              </div>
              {/* Title */}
              <div>
                <h2 className="text-[20px] font-extrabold text-white" style={{ fontFamily: 'var(--font-heading, Plus Jakarta Sans, sans-serif)' }}>
                  Mi Carrito
                </h2>
                <p className="text-[13px] text-sky-200 font-medium">
                  Revisa tu pedido antes de continuar
                </p>
              </div>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-3.5 py-3">
              {items.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center h-full text-center"
                >
                  <div className="w-24 h-24 rounded-full bg-white/60 dark:bg-white/10 flex items-center justify-center mb-4">
                    <ShoppingBag className="w-12 h-12 text-[#94A3B8] dark:text-neutral-500" />
                  </div>
                  <h3 className="text-lg font-bold text-[#0F172A] dark:text-white mb-2" style={{ fontFamily: 'var(--font-heading, Plus Jakarta Sans, sans-serif)' }}>
                    Tu carrito está vacío
                  </h3>
                  <p className="text-[#64748B] dark:text-neutral-400 text-sm">
                    Agrega productos para comenzar tu pedido
                  </p>
                </motion.div>
              ) : (
                <div className="space-y-2.5">
                  <AnimatePresence mode="popLayout">
                    {items.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20, height: 0 }}
                        className="flex items-center gap-3 p-2.5 bg-white dark:bg-neutral-900 rounded-[16px] shadow-[0_2px_8px_#0000000A] dark:shadow-none dark:border dark:border-white/[0.06]"
                      >
                        {/* Product Image - rounded square */}
                        <div className="relative w-[76px] h-[76px] rounded-[12px] overflow-hidden bg-neutral-100 dark:bg-neutral-800 flex-shrink-0">
                          {item.image ? (
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-cover"
                              sizes="76px"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ShoppingBag className="w-8 h-8 text-neutral-300" />
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-[14px] font-bold text-[#0F172A] dark:text-white truncate" style={{ fontFamily: 'var(--font-heading, Plus Jakarta Sans, sans-serif)' }}>
                            {item.name}
                          </h4>
                          {item.variant && (
                            <p className="text-[11px] text-[#94A3B8] dark:text-neutral-400 font-medium mt-0.5">
                              {item.variant.values}
                            </p>
                          )}
                          <p className="text-[15px] font-extrabold text-[#0891B2] mt-1" style={{ fontFamily: 'var(--font-heading, Plus Jakarta Sans, sans-serif)' }}>
                            {currency} {item.price.toFixed(2)}
                          </p>

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-2 mt-1.5">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-7 h-7 rounded-full border border-[#E2E8F0] dark:border-neutral-700 flex items-center justify-center hover:bg-[#F0F9FF] dark:hover:bg-neutral-800 transition-colors"
                            >
                              <Minus className="w-3 h-3 text-[#64748B] dark:text-neutral-400" />
                            </button>
                            <span className="w-6 text-center text-[13px] font-bold text-[#0F172A] dark:text-white">
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
                                'w-7 h-7 rounded-full border border-[#E2E8F0] dark:border-neutral-700 flex items-center justify-center transition-colors',
                                item.maxStock !== null &&
                                  item.maxStock !== undefined &&
                                  item.quantity >= item.maxStock
                                  ? 'opacity-50 cursor-not-allowed'
                                  : 'hover:bg-[#F0F9FF] dark:hover:bg-neutral-800'
                              )}
                            >
                              <Plus className="w-3 h-3 text-[#64748B] dark:text-neutral-400" />
                            </button>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="ml-auto w-7 h-7 rounded-full text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 flex items-center justify-center transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Clear Cart */}
                  {items.length > 0 && (
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      onClick={clearCart}
                      className="w-full py-2 text-sm text-[#94A3B8] dark:text-neutral-500 hover:text-rose-500 dark:hover:text-rose-400 transition-colors"
                    >
                      Vaciar carrito
                    </motion.button>
                  )}
                </div>
              )}
            </div>

            {/* Summary Card + WhatsApp Button - BETA.pen Screen 06 */}
            {items.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-3.5 pb-4 pt-0 space-y-3"
              >
                {/* Summary Card */}
                <div className="bg-white dark:bg-neutral-900 rounded-[20px] shadow-[0_4px_12px_#0000000A] dark:shadow-none dark:border dark:border-white/[0.06] p-[18px] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] text-[#64748B] dark:text-neutral-400">Subtotal ({totalItems} items)</span>
                    <span className="text-[14px] font-semibold text-[#0F172A] dark:text-white">
                      {currency} {subtotal.toFixed(2)}
                    </span>
                  </div>
                  {discount > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] text-[#64748B] dark:text-neutral-400">Descuento</span>
                      <span className="text-[14px] font-semibold text-red-500">
                        -{currency} {discount.toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="border-t border-[#E2E8F0] dark:border-neutral-700 pt-3 flex items-center justify-between">
                    <span className="text-[14px] font-bold text-[#0F172A] dark:text-white">Total</span>
                    <span className="text-[22px] font-extrabold text-[#0891B2]" style={{ fontFamily: 'var(--font-heading, Plus Jakarta Sans, sans-serif)' }}>
                      {currency} {totalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* WhatsApp Button */}
                <motion.button
                  onClick={handleCheckout}
                  className="w-full flex items-center justify-center gap-2.5 h-[50px] rounded-full font-semibold text-white text-[14px] bg-[#25D366] shadow-[0_2px_12px_rgba(37,211,102,0.3)] transition-all duration-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  Pedir por WhatsApp
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        </Fragment>
      )}
    </AnimatePresence>
  );
}
