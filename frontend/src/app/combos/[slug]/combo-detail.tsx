'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import {
  Gift,
  Share2,
  ChevronRight,
  ChevronLeft,
  Tag,
  MessageCircle,
  Package,
  Check,
  ShoppingBag,
  Flame,
  Percent,
} from 'lucide-react';
import { Navbar, Footer, WhatsAppButton, MobileBottomNav } from '@/components/catalog';
import type { CatalogSettings, CatalogCategory, CatalogCombo } from '@/lib/api/catalog';

const v0Ease = [0.22, 1, 0.36, 1] as const;

interface ComboDetailProps {
  combo: CatalogCombo;
  settings: CatalogSettings;
  categories: CatalogCategory[];
  otherCombos?: CatalogCombo[];
}

export function ComboDetail({ combo, settings, categories, otherCombos = [] }: ComboDetailProps) {
  const [quantity, setQuantity] = useState(1);

  const price = Number(combo.price);
  const salePrice = combo.salePrice ? Number(combo.salePrice) : null;
  const displayPrice = salePrice || price;
  const discount = combo.discountPercent;

  // Calculate total value of individual products
  const totalProductsValue = combo.comboProducts?.reduce((sum, cp) => {
    return sum + Number(cp.product.price) * cp.quantity;
  }, 0) || 0;

  const savings = totalProductsValue > displayPrice ? totalProductsValue - displayPrice : 0;

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: combo.name,
        text: combo.description || `Mira este combo: ${combo.name}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleWhatsAppOrder = () => {
    const productsList = combo.comboProducts?.map(cp =>
      `  - ${cp.product.name} x${cp.quantity}`
    ).join('\n') || '';
    const message = `Hola! Me interesa el combo:\n\n*${combo.name}*\nCantidad: ${quantity}\nPrecio: ${settings.currency} ${(displayPrice * quantity).toFixed(2)}\n\nProductos incluidos:\n${productsList}\n\n${window.location.href}`;
    const phone = settings.whatsapp?.replace(/\D/g, '') || '';
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#000000]">
      <Navbar settings={settings} categories={categories} />

      {/* Mobile Image Header */}
      <div className="lg:hidden relative">
        <div className="relative w-full h-[300px] bg-neutral-100 dark:bg-[#0a0a0a] overflow-hidden">
          {combo.image ? (
            <Image
              src={combo.image}
              alt={combo.name}
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
              <Gift className="w-20 h-20 text-white/60" />
            </div>
          )}

          <Link
            href="/combos"
            className="absolute top-3.5 left-3.5 z-10 w-[42px] h-[42px] rounded-full bg-cyan-600 flex items-center justify-center shadow-lg"
          >
            <ChevronLeft className="w-[22px] h-[22px] text-white" />
          </Link>

          <button
            onClick={handleShare}
            className="absolute top-3.5 right-3.5 z-10 w-[42px] h-[42px] rounded-full bg-cyan-600 flex items-center justify-center shadow-lg"
          >
            <Share2 className="w-[22px] h-[22px] text-white" />
          </button>

          {discount && (
            <div className="absolute bottom-10 left-3.5 z-10">
              <span className="inline-flex items-center gap-1 px-2.5 py-[5px] bg-red-500 rounded-[10px] text-white text-[11px] font-bold">
                <Tag className="w-3 h-3" />
                -{discount}% OFF
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Desktop Breadcrumb */}
      <div className="hidden lg:block border-b border-black/[0.06] dark:border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <motion.nav
            className="flex items-center gap-2 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, ease: v0Ease }}
          >
            <Link href="/" className="text-neutral-400 hover:text-cyan-500 transition-colors">Inicio</Link>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-300 dark:text-neutral-600" />
            <Link href="/combos" className="text-neutral-400 hover:text-cyan-500 transition-colors">Combos</Link>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-300 dark:text-neutral-600" />
            <span className="text-neutral-700 dark:text-white font-medium truncate max-w-[200px]">{combo.name}</span>
          </motion.nav>
        </div>
      </div>

      {/* ========= MOBILE Main Content ========= */}
      <div className="lg:hidden max-w-7xl mx-auto relative -mt-6 bg-gradient-to-b from-white to-[#EFF9FF] dark:bg-[#000000] rounded-t-3xl z-10 px-4 pt-4 pb-24">
        <div className="space-y-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-full text-xs font-bold">
            <Gift className="w-3.5 h-3.5" />
            COMBO
          </div>
          <h1 className="text-2xl font-black text-neutral-900 dark:text-white tracking-tight leading-tight">{combo.name}</h1>
          {combo.description && <p className="text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed">{combo.description}</p>}
          <div className="flex items-end gap-3">
            <span className="text-3xl font-black text-neutral-900 dark:text-white">{settings.currency} {displayPrice.toFixed(2)}</span>
            {salePrice && <span className="text-lg text-neutral-400 line-through mb-1">{settings.currency} {price.toFixed(2)}</span>}
          </div>
          {savings > 0 && (
            <div className="bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-xl p-3 flex items-center gap-2">
              <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
              <p className="text-sm text-green-700 dark:text-green-400 font-medium">Ahorras {settings.currency} {savings.toFixed(2)}</p>
            </div>
          )}
          <div className="flex items-center gap-3 pt-2">
            <div className="flex items-center bg-neutral-100 dark:bg-white/[0.06] rounded-xl overflow-hidden">
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-10 h-10 flex items-center justify-center text-neutral-600 dark:text-neutral-300">-</button>
              <span className="w-10 text-center font-bold text-neutral-900 dark:text-white">{quantity}</span>
              <button onClick={() => setQuantity(q => q + 1)} className="w-10 h-10 flex items-center justify-center text-neutral-600 dark:text-neutral-300">+</button>
            </div>
            <button onClick={handleWhatsAppOrder} className="flex-1 h-12 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 active:scale-[0.97]">
              <MessageCircle className="w-5 h-5" />
              Pedir por WhatsApp
            </button>
          </div>
          {quantity > 1 && (
            <p className="text-sm text-neutral-500">Total: <span className="font-bold text-neutral-900 dark:text-white">{settings.currency} {(displayPrice * quantity).toFixed(2)}</span></p>
          )}
          {combo.comboProducts && combo.comboProducts.length > 0 && (
            <div className="pt-4 border-t border-neutral-200 dark:border-white/[0.08]">
              <h3 className="text-base font-bold text-neutral-900 dark:text-white mb-3 flex items-center gap-2">
                <Package className="w-4 h-4 text-cyan-500" />
                Productos incluidos ({combo.comboProducts.length})
              </h3>
              <div className="space-y-2.5">
                {combo.comboProducts.map((cp) => {
                  const productImage = cp.product.images?.[0]?.url;
                  const productPrice = Number(cp.product.price);
                  const productSalePrice = cp.product.salePrice ? Number(cp.product.salePrice) : null;
                  return (
                    <Link key={cp.id} href={`/productos/${cp.product.slug}`} className="flex items-center gap-3 p-2.5 rounded-xl bg-neutral-50 dark:bg-white/[0.03] border border-neutral-200 dark:border-white/[0.06]">
                      <div className="w-14 h-14 rounded-lg overflow-hidden bg-neutral-200 flex-shrink-0">
                        {productImage ? <img src={productImage} alt={cp.product.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><ShoppingBag className="w-5 h-5 text-neutral-400" /></div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-neutral-900 dark:text-white truncate">{cp.product.name}</p>
                        <span className="text-xs font-bold text-neutral-700">{settings.currency} {(productSalePrice || productPrice).toFixed(2)}</span>
                        {cp.quantity > 1 && <span className="text-[10px] text-cyan-600 font-bold ml-1.5">x{cp.quantity}</span>}
                      </div>
                      <ChevronRight className="w-4 h-4 text-neutral-300 flex-shrink-0" />
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========= DESKTOP ========= */}
      {/* Hero - Ofertas HOT style */}
      <div className="hidden lg:block relative overflow-hidden bg-gradient-to-br from-sky-400/10 via-blue-500/5 to-indigo-500/10" style={{ height: 400 }}>
        {/* Background image */}
        {combo.image ? (
          <motion.div
            className="absolute inset-0 bg-cover bg-center opacity-85"
            style={{ backgroundImage: `url(${combo.image})` }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-blue-700 to-indigo-800" />
        )}

        {/* Animated background orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-10 right-20 w-60 h-60 bg-cyan-400/20 rounded-full blur-3xl"
            animate={{ scale: [1, 1.3, 1], x: [0, 30, 0] }}
            transition={{ duration: 10, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-10 left-20 w-80 h-80 bg-purple-500/15 rounded-full blur-3xl"
            animate={{ scale: [1.3, 1, 1.3] }}
            transition={{ duration: 12, repeat: Infinity }}
          />
        </div>

        {/* Animated fire icon */}
        <motion.div
          className="absolute top-8 right-12"
          animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        >
          <Flame className="w-12 h-12 text-yellow-300 drop-shadow-lg" />
        </motion.div>

        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-8 h-full flex items-center">
          <div className="max-w-xl space-y-5">
            <motion.span
              className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-400 text-red-700 text-sm font-black rounded-full w-fit shadow-lg"
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            >
              <Percent className="w-4 h-4" />
              COMBO ESPECIAL
              <motion.span
                className="px-2 py-0.5 bg-red-600 text-white text-xs font-black rounded"
                animate={{ rotate: [-5, 5, -5] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                %
              </motion.span>
            </motion.span>
            <motion.h1
              className="text-4xl lg:text-5xl font-black text-white tracking-tight drop-shadow-lg leading-[1.1]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {combo.name}
            </motion.h1>
            {combo.description && (
              <motion.p
                className="text-white/80 text-base leading-relaxed max-w-md"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                {combo.description}
              </motion.p>
            )}
            <motion.div
              className="flex items-center gap-4 pt-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <span className="text-4xl font-black text-white drop-shadow-lg">{settings.currency} {displayPrice.toFixed(2)}</span>
              {salePrice && <span className="text-lg text-white/40 line-through">{settings.currency} {price.toFixed(2)}</span>}
              {discount && (
                <motion.span
                  className="px-3 py-1.5 bg-amber-400 text-blue-800 text-[13px] font-black rounded-full shadow-lg"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  -{discount}% OFF
                </motion.span>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Desktop content below hero */}
      <div className="hidden lg:block bg-[#F8FAFC] dark:bg-black">
      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="grid grid-cols-3 gap-10">
          {/* Left - Products included */}
          <div className="col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-8 bg-gradient-to-b from-cyan-500 to-blue-600 rounded-full" />
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Productos incluidos</h2>
              <span className="text-[12px] font-bold text-cyan-600 bg-cyan-50 px-2.5 py-1 rounded-full">{combo.comboProducts?.length || 0} items</span>
            </div>
            {combo.comboProducts && combo.comboProducts.length > 0 && (
              <div className="space-y-3">
                {combo.comboProducts.map((cp, idx) => {
                  const productPrice = Number(cp.product.price);
                  const productSalePrice = cp.product.salePrice ? Number(cp.product.salePrice) : null;
                  const productImage = cp.product.images?.[0]?.url;
                  return (
                    <motion.div
                      key={cp.id}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: idx * 0.1 }}
                    >
                      <Link href={`/productos/${cp.product.slug}`} className="flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-[#0a0a0a] border border-slate-100 dark:border-neutral-800 hover:border-cyan-200 hover:shadow-lg hover:shadow-cyan-500/10 transition-all duration-300 group">
                        <div className="w-[70px] h-[70px] rounded-xl overflow-hidden bg-slate-50 flex-shrink-0 ring-2 ring-slate-100 group-hover:ring-cyan-200 transition-all">
                          {productImage ? <img src={productImage} alt={cp.product.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><ShoppingBag className="w-5 h-5 text-slate-300" /></div>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[15px] font-bold text-slate-900 dark:text-white group-hover:text-cyan-700 transition-colors">{cp.product.name}</p>
                          <p className="text-[12px] text-slate-400 mt-0.5 font-medium">{cp.product.category?.name}{cp.product.brand ? ` · ${cp.product.brand.name}` : ''}</p>
                        </div>
                        <span className="text-[15px] font-extrabold text-slate-800 dark:text-slate-200 flex-shrink-0">
                          {settings.currency} {(productSalePrice || productPrice).toFixed(2)}
                          {cp.quantity > 1 && <span className="text-cyan-600 ml-1.5 text-[13px]">x{cp.quantity}</span>}
                        </span>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right - Resumen */}
          <div>
            <div className="sticky top-8 bg-white dark:bg-[#0a0a0a] rounded-2xl border border-slate-100 dark:border-neutral-800 shadow-lg shadow-slate-200/50 p-6 space-y-5">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-cyan-500" />
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Resumen del combo</h3>
              </div>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between text-slate-500">
                  <span>{combo.comboProducts?.length || 0} productos</span>
                  <span>{settings.currency} {totalProductsValue.toFixed(2)}</span>
                </div>
                {savings > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Descuento combo</span>
                    <span>-{settings.currency} {savings.toFixed(2)}</span>
                  </div>
                )}
                <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent my-3" />
                <div className="flex justify-between items-center">
                  <span className="text-slate-900 dark:text-white font-bold">Total</span>
                  <span className="text-2xl font-black bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">{settings.currency} {displayPrice.toFixed(2)}</span>
                </div>
              </div>

              {/* Quantity */}
              <div className="flex items-center justify-center border border-slate-200 dark:border-neutral-700 rounded-full py-2.5 px-4 gap-5 bg-slate-50 dark:bg-neutral-900">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-8 h-8 rounded-full bg-white dark:bg-neutral-800 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700 hover:border-slate-300 transition-all">−</button>
                <span className="text-base font-bold text-slate-800 dark:text-white w-5 text-center">{quantity}</span>
                <button onClick={() => setQuantity(q => q + 1)} className="w-8 h-8 rounded-full bg-white dark:bg-neutral-800 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700 hover:border-slate-300 transition-all">+</button>
              </div>

              {/* WhatsApp */}
              <button onClick={handleWhatsAppOrder} className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full text-[14px] font-bold bg-[#25D366] text-white hover:bg-[#2eda6e] hover:shadow-lg hover:shadow-green-500/25 transition-all">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current flex-shrink-0"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                Pedir combo por WhatsApp
              </button>

              {/* Shipping info */}
              <div className="flex flex-col gap-2.5 pt-2 border-t border-slate-100 dark:border-neutral-800">
                <span className="flex items-center gap-2 text-[12px] text-slate-500 font-medium">🚚 Envío a todo Perú</span>
                <span className="flex items-center gap-2 text-[12px] text-slate-500 font-medium">🏍 Pago contraentrega</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* Recomendados */}
      {otherCombos.length > 0 && (
        <>
          {/* Mobile */}
          <div className="lg:hidden px-3.5 pb-6">
            <h2
              className="text-[18px] font-extrabold text-[#0F172A] dark:text-white mb-3"
              style={{ fontFamily: 'var(--font-heading, Plus Jakarta Sans, sans-serif)' }}
            >
              Recomendados
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {otherCombos.slice(0, 4).map((c, index) => {
                const gradients = [
                  'linear-gradient(135deg, #0891B2, #0284C7)',
                  'linear-gradient(135deg, #7C3AED, #4F46E5)',
                  'linear-gradient(135deg, #F59E0B, #EA580C)',
                  'linear-gradient(135deg, #10B981, #059669)',
                ];
                const grad = gradients[index % gradients.length];
                const dp = Number(c.salePrice || c.price);
                const op = c.salePrice ? Number(c.price) : null;

                return (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.06, ease: v0Ease }}
                  >
                    <Link href={`/combos/${c.slug}`} className="block active:scale-[0.97] transition-transform">
                      <div className="bg-white dark:bg-neutral-900 rounded-[18px] overflow-hidden shadow-[0_4px_12px_#0000000F]">
                        <div
                          className="relative h-[120px]"
                          style={c.image ? undefined : { background: grad }}
                        >
                          {c.image ? (
                            <Image src={c.image} alt={c.name} fill className="object-cover" sizes="50vw" />
                          ) : (
                            <Gift className="absolute right-3 top-6 w-12 h-12 text-white/50" />
                          )}
                          {c.discountPercent && (
                            <span className="absolute top-2 left-2 inline-flex px-2 py-1 bg-[#EF4444] text-white text-[9px] font-bold rounded-[10px]">
                              -{c.discountPercent}%
                            </span>
                          )}
                        </div>
                        <div className="p-2.5 flex flex-col gap-1">
                          <h3
                            className="text-[14px] font-extrabold text-[#0F172A] dark:text-white line-clamp-1"
                            style={{ fontFamily: 'var(--font-heading, Plus Jakarta Sans, sans-serif)' }}
                          >
                            {c.name}
                          </h3>
                          {c.comboProducts && c.comboProducts.length > 0 && (
                            <span className="text-[10px] font-semibold text-[#0891B2]">
                              {c.comboProducts.length} producto{c.comboProducts.length > 1 ? 's' : ''}
                            </span>
                          )}
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span
                              className="text-[15px] font-extrabold text-[#0F172A] dark:text-white"
                              style={{ fontFamily: 'var(--font-heading, Plus Jakarta Sans, sans-serif)' }}
                            >
                              {settings.currency} {dp.toFixed(2)}
                            </span>
                            {op && (
                              <span className="text-[11px] text-[#94A3B8] line-through">
                                {settings.currency} {op.toFixed(2)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Desktop */}
          <div className="hidden lg:block bg-[#F8FAFC] dark:bg-black pb-16">
          <div className="max-w-7xl mx-auto px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2, ease: v0Ease }}
            >
              <h2
                className="text-2xl font-black text-neutral-900 dark:text-white tracking-tight mb-6"
                style={{ fontFamily: 'var(--font-heading, Plus Jakarta Sans, sans-serif)' }}
              >
                Recomendados
              </h2>
              <div className="grid grid-cols-3 xl:grid-cols-4 gap-6">
                {otherCombos.slice(0, 4).map((c, index) => {
                  const gradients = [
                    'linear-gradient(135deg, #0891B2, #0284C7)',
                    'linear-gradient(135deg, #7C3AED, #4F46E5)',
                    'linear-gradient(135deg, #F59E0B, #EA580C)',
                    'linear-gradient(135deg, #10B981, #059669)',
                  ];
                  const grad = gradients[index % gradients.length];
                  const dp = Number(c.salePrice || c.price);
                  const op = c.salePrice ? Number(c.price) : null;

                  return (
                    <motion.div
                      key={c.id}
                      initial={{ opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.06, ease: v0Ease }}
                    >
                      <Link href={`/combos/${c.slug}`} className="block group">
                        <div className="bg-white dark:bg-neutral-900 rounded-[18px] overflow-hidden shadow-[0_4px_12px_#0000000F] hover:shadow-xl transition-all duration-300">
                          <div
                            className="relative h-[160px]"
                            style={c.image ? undefined : { background: grad }}
                          >
                            {c.image ? (
                              <Image src={c.image} alt={c.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="33vw" />
                            ) : (
                              <Gift className="absolute right-4 top-8 w-14 h-14 text-white/50" />
                            )}
                            {c.discountPercent && (
                              <span className="absolute top-2.5 left-2.5 inline-flex px-2.5 py-1 bg-[#EF4444] text-white text-[10px] font-bold rounded-[10px]">
                                -{c.discountPercent}%
                              </span>
                            )}
                          </div>
                          <div className="p-3 flex flex-col gap-1">
                            <h3
                              className="text-[14px] font-extrabold text-[#0F172A] dark:text-white line-clamp-1 group-hover:text-[#0891B2] transition-colors"
                              style={{ fontFamily: 'var(--font-heading, Plus Jakarta Sans, sans-serif)' }}
                            >
                              {c.name}
                            </h3>
                            {c.comboProducts && c.comboProducts.length > 0 && (
                              <span className="text-[10px] font-semibold text-[#0891B2]">
                                {c.comboProducts.length} producto{c.comboProducts.length > 1 ? 's' : ''}
                              </span>
                            )}
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span
                                className="text-[15px] font-extrabold text-[#0F172A] dark:text-white"
                                style={{ fontFamily: 'var(--font-heading, Plus Jakarta Sans, sans-serif)' }}
                              >
                                {settings.currency} {dp.toFixed(2)}
                              </span>
                              {op && (
                                <span className="text-[11px] text-[#94A3B8] line-through">
                                  {settings.currency} {op.toFixed(2)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>
          </div>
        </>
      )}

      <Footer settings={settings} categories={categories} />
      {settings.whatsapp && (
        <WhatsAppButton phoneNumber={settings.whatsapp} businessName={settings.businessName || 'el catálogo'} />
      )}
      <MobileBottomNav />
    </div>
  );
}
