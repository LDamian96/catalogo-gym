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
            className="fixed right-0 top-0 h-full w-full max-w-md z-50 flex flex-col bg-gradient-to-b from-[#EFF9FF] via-[#DBEAFE] to-[#E0F2FE] lg:bg-white lg:bg-none"
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
                  <div className="w-24 h-24 rounded-full bg-white/60 flex items-center justify-center mb-4">
                    <ShoppingBag className="w-12 h-12 text-[#94A3B8]" />
                  </div>
                  <h3 className="text-lg font-bold text-[#0F172A] mb-2" style={{ fontFamily: 'var(--font-heading, Plus Jakarta Sans, sans-serif)' }}>
                    Tu carrito está vacío
                  </h3>
                  <p className="text-[#64748B] text-sm">
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
                        className="flex items-center gap-3 p-2.5 bg-white rounded-[16px] shadow-[0_2px_8px_#0000000A]"
                      >
                        {/* Product Image - rounded square */}
                        <div className="relative w-[76px] h-[76px] rounded-[12px] overflow-hidden bg-neutral-100 flex-shrink-0">
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
                          <h4 className="text-[14px] font-bold text-[#0F172A] truncate" style={{ fontFamily: 'var(--font-heading, Plus Jakarta Sans, sans-serif)' }}>
                            {item.name}
                          </h4>
                          {item.variant && (
                            <p className="text-[11px] text-[#94A3B8] font-medium mt-0.5">
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
                              className="w-7 h-7 rounded-full border border-[#E2E8F0] flex items-center justify-center hover:bg-[#F0F9FF] transition-colors"
                            >
                              <Minus className="w-3 h-3 text-[#64748B]" />
                            </button>
                            <span className="w-6 text-center text-[13px] font-bold text-[#0F172A]">
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
                                'w-7 h-7 rounded-full border border-[#E2E8F0] flex items-center justify-center transition-colors',
                                item.maxStock !== null &&
                                  item.maxStock !== undefined &&
                                  item.quantity >= item.maxStock
                                  ? 'opacity-50 cursor-not-allowed'
                                  : 'hover:bg-[#F0F9FF]'
                              )}
                            >
                              <Plus className="w-3 h-3 text-[#64748B]" />
                            </button>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="ml-auto w-7 h-7 rounded-full text-rose-500 hover:bg-rose-50 flex items-center justify-center transition-colors"
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
                      className="w-full py-2 text-sm text-[#94A3B8] hover:text-rose-500 transition-colors"
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
                <div className="bg-white rounded-[20px] shadow-[0_4px_12px_#0000000A] p-[18px] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] text-[#64748B]">Subtotal ({totalItems} items)</span>
                    <span className="text-[14px] font-semibold text-[#0F172A]">
                      {currency} {subtotal.toFixed(2)}
                    </span>
                  </div>
                  {discount > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] text-[#64748B]">Descuento</span>
                      <span className="text-[14px] font-semibold text-red-500">
                        -{currency} {discount.toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="border-t border-[#E2E8F0] pt-3 flex items-center justify-between">
                    <span className="text-[14px] font-bold text-[#0F172A]">Total</span>
                    <span className="text-[22px] font-extrabold text-[#0891B2]" style={{ fontFamily: 'var(--font-heading, Plus Jakarta Sans, sans-serif)' }}>
                      {currency} {totalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* WhatsApp Button */}
                <motion.button
                  onClick={handleCheckout}
                  className="w-full flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl font-bold text-white text-[15px] bg-gradient-to-r from-[#25D366] to-[#128C7E] shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/30 transition-all"
                  style={{ fontFamily: 'var(--font-heading, Plus Jakarta Sans, sans-serif)' }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <MessageCircle className="w-5 h-5" />
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
