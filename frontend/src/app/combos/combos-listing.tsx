'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Gift,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ShoppingCart,
  ArrowRight,
  Flame,
  Percent,
} from 'lucide-react';
import Image from 'next/image';
import { Navbar, Footer, WhatsAppButton, MobileBottomNav } from '@/components/catalog';
import type { CatalogSettings, CatalogCategory, CatalogCombo } from '@/lib/api/catalog';

const v0Ease = [0.22, 1, 0.36, 1] as const;

interface CombosListingProps {
  combos: CatalogCombo[];
  settings: CatalogSettings;
  categories: CatalogCategory[];
}

export function CombosListing({ combos, settings, categories }: CombosListingProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#EFF9FF] via-[#DBEAFE] to-[#E0F2FE] lg:bg-white lg:bg-none dark:bg-[#000000]">
      {/* Desktop Navbar */}
      <div className="hidden lg:block">
        <Navbar settings={settings} categories={categories} />
      </div>

      {/* Desktop Breadcrumb */}
      <div className="hidden lg:block border-b border-black/[0.06] dark:border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-neutral-400 hover:text-cyan-500 transition-colors">Inicio</Link>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-300" />
            <span className="text-neutral-700 dark:text-white font-medium">Combos</span>
          </nav>
        </div>
      </div>

      {/* ========= MOBILE ========= */}
      <div className="lg:hidden">
        {/* Hero gradient header with background image */}
        <section className="relative rounded-b-[26px] shadow-[0_8px_24px_#0EA5E926] overflow-hidden">
          {/* Background image */}
          {combos[0]?.image && (
            <Image
              src={combos[0].image}
              alt=""
              fill
              className="object-cover"
              sizes="100vw"
              priority
            />
          )}
          {/* Cyan overlay */}
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(130deg, rgba(6,182,212,0.88) 0%, rgba(2,132,199,0.9) 50%, rgba(29,78,216,0.92) 100%)' }}
          />
          <div className="relative flex flex-col gap-3.5 px-4 pt-[18px] pb-4">
            {/* Top row */}
            <div className="flex items-center justify-between">
              <Link
                href="/"
                className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center"
              >
                <ChevronLeft className="w-5 h-5 text-white" />
              </Link>
              <Link
                href="/productos"
                className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center"
              >
                <ShoppingCart className="w-[18px] h-[18px] text-white" />
              </Link>
            </div>
            {/* Title */}
            <h1
              className="text-[26px] font-extrabold text-white leading-tight"
              style={{ fontFamily: 'var(--font-heading, Plus Jakarta Sans, sans-serif)' }}
            >
              Combos
            </h1>
            <p className="text-[13px] font-medium text-white/80">
              Ahorra más con nuestros packs especiales
            </p>
            {/* Counter badge */}
            <div className="self-start inline-flex items-center gap-1.5 px-3 py-[5px] bg-white/15 rounded-full">
              <Gift className="w-3.5 h-3.5 text-white" />
              <span className="text-[12px] font-semibold text-white">
                {combos.length} combo{combos.length !== 1 ? 's' : ''} disponible{combos.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </section>

        {/* Sort row */}
        <div className="flex items-center justify-between px-3.5 pt-3 pb-1">
          <span className="text-[13px] font-semibold text-[#64748B]">
            {combos.length} combo{combos.length !== 1 ? 's' : ''}
          </span>
          <button className="flex items-center gap-1.5 text-[13px] font-semibold text-[#0891B2]">
            <ArrowUpDown className="w-4 h-4" />
            Ordenar
          </button>
        </div>

        {/* Combo cards grid */}
        {combos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <Gift className="w-16 h-16 text-[#CBD5E1] mb-4" />
            <p className="text-[#64748B] text-base">No hay combos disponibles</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 px-3.5 pt-2 pb-4">
            {combos.map((combo, index) => {
              const gradients = [
                'linear-gradient(135deg, #0891B2, #0284C7)',
                'linear-gradient(135deg, #7C3AED, #4F46E5)',
                'linear-gradient(135deg, #F59E0B, #EA580C)',
                'linear-gradient(135deg, #10B981, #059669)',
              ];
              const gradient = gradients[index % gradients.length];
              const displayPrice = Number(combo.salePrice || combo.price);
              const originalPrice = combo.salePrice ? Number(combo.price) : null;

              return (
                <motion.div
                  key={combo.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.06, ease: v0Ease }}
                >
                  <Link href={`/combos/${combo.slug}`} className="block active:scale-[0.97] transition-transform">
                    <div className="bg-white dark:bg-neutral-900 rounded-[18px] overflow-hidden shadow-[0_4px_12px_#0000000F]">
                      {/* Image / gradient header */}
                      <div
                        className="relative h-[120px]"
                        style={combo.image ? undefined : { background: gradient }}
                      >
                        {combo.image ? (
                          <Image src={combo.image} alt={combo.name} fill className="object-cover" sizes="50vw" />
                        ) : (
                          <Gift className="absolute right-3 top-6 w-12 h-12 text-white/50" />
                        )}
                        {combo.discountPercent && (
                          <span className="absolute top-2 left-2 inline-flex px-2 py-1 bg-[#EF4444] text-white text-[9px] font-bold rounded-[10px]">
                            -{combo.discountPercent}%
                          </span>
                        )}
                      </div>
                      {/* Body */}
                      <div className="p-2.5 flex flex-col gap-1">
                        <h3
                          className="text-[14px] font-extrabold text-[#0F172A] dark:text-white line-clamp-1"
                          style={{ fontFamily: 'var(--font-heading, Plus Jakarta Sans, sans-serif)' }}
                        >
                          {combo.name}
                        </h3>
                        {combo.description && (
                          <p className="text-[11px] text-[#64748B] line-clamp-1">{combo.description}</p>
                        )}
                        {combo.comboProducts && combo.comboProducts.length > 0 && (
                          <span className="text-[10px] font-semibold text-[#0891B2]">
                            {combo.comboProducts.length} producto{combo.comboProducts.length > 1 ? 's' : ''}
                          </span>
                        )}
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span
                            className="text-[15px] font-extrabold text-[#0F172A] dark:text-white"
                            style={{ fontFamily: 'var(--font-heading, Plus Jakarta Sans, sans-serif)' }}
                          >
                            {settings.currency} {displayPrice.toFixed(2)}
                          </span>
                          {originalPrice && (
                            <span className="text-[11px] text-[#94A3B8] line-through">
                              {settings.currency} {originalPrice.toFixed(2)}
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
        )}
      </div>

      {/* ========= DESKTOP ========= */}
      <div className="hidden lg:block bg-[#F8FAFC] dark:bg-black min-h-screen">
        {/* Hero - Ofertas HOT style */}
        <div className="relative overflow-hidden bg-gradient-to-br from-sky-400/10 via-blue-500/5 to-indigo-500/10" style={{ height: 320 }}>
          {/* Background image from first combo */}
          {combos[0]?.image && (
            <motion.div
              className="absolute inset-0 bg-cover bg-center opacity-85"
              style={{ backgroundImage: `url(${combos[0].image})` }}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            />
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
          <div className="relative max-w-7xl mx-auto px-8 h-full flex flex-col justify-center">
            <motion.span
              className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-400 text-red-700 text-sm font-black rounded-full w-fit shadow-lg mb-5"
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            >
              <Percent className="w-4 h-4" />
              COMBOS HOT
              <motion.span
                className="px-2 py-0.5 bg-red-600 text-white text-xs font-black rounded"
                animate={{ rotate: [-5, 5, -5] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                %
              </motion.span>
            </motion.span>
            <motion.h1
              className="text-4xl lg:text-5xl font-black text-white tracking-tight drop-shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Nuestros Combos
            </motion.h1>
            <motion.p
              className="text-white/80 mt-3 text-base max-w-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Los mejores packs con descuento. Ahorra comprando tus suplementos favoritos juntos.
            </motion.p>
            <motion.div
              className="mt-5 inline-flex items-center gap-2 px-3 py-1.5 bg-white/15 backdrop-blur-sm rounded-full w-fit"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Gift className="w-4 h-4 text-yellow-300" />
              <span className="text-white/90 text-sm font-semibold">{combos.length} combo{combos.length !== 1 ? 's' : ''} disponible{combos.length !== 1 ? 's' : ''}</span>
            </motion.div>
          </div>
        </div>

        {/* Combo list */}
        <div className="max-w-7xl mx-auto px-8 py-10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-gradient-to-b from-cyan-500 to-blue-600 rounded-full" />
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">Todos los combos</h2>
            </div>
            <span className="text-[13px] font-medium text-slate-400">{combos.length} combo{combos.length !== 1 ? 's' : ''}</span>
          </div>

          {combos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Gift className="w-12 h-12 text-slate-300 mb-3" />
              <p className="text-slate-500">No hay combos disponibles</p>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {combos.map((combo, index) => {
                const displayPrice = Number(combo.salePrice || combo.price);
                const originalPrice = combo.salePrice ? Number(combo.price) : null;
                const discount = combo.discountPercent;
                const phone = settings.whatsapp?.replace(/\D/g, '') || '';
                const waMsg = encodeURIComponent(`¡Hola! Me interesa el combo: *${combo.name}* - ${settings.currency} ${displayPrice.toFixed(2)}`);

                return (
                  <motion.div
                    key={combo.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.08, ease: v0Ease }}
                    className="flex gap-6 bg-white dark:bg-[#0a0a0a] rounded-2xl border border-slate-100 dark:border-neutral-800 p-5 hover:shadow-xl hover:shadow-cyan-500/10 hover:border-cyan-200 transition-all duration-300 group"
                  >
                    {/* Image */}
                    <Link href={`/combos/${combo.slug}`} className="relative w-[260px] h-[180px] flex-shrink-0 rounded-xl overflow-hidden bg-slate-100 dark:bg-neutral-900">
                      {combo.image ? (
                        <Image src={combo.image} alt={combo.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="260px" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-cyan-100 to-blue-100">
                          <Gift className="w-10 h-10 text-cyan-400" />
                        </div>
                      )}
                      {discount && (
                        <span className="absolute top-2.5 left-2.5 px-2.5 py-1 bg-gradient-to-r from-red-500 to-orange-500 text-white text-[11px] font-black rounded-lg shadow-lg shadow-red-500/30">
                          -{discount}% OFF
                        </span>
                      )}
                    </Link>

                    {/* Info */}
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        {combo.comboProducts && combo.comboProducts.length > 0 && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded-full">
                            <Gift className="w-3 h-3" />
                            {combo.comboProducts.length} productos incluidos
                          </span>
                        )}
                        <Link href={`/combos/${combo.slug}`}>
                          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-2 group-hover:text-cyan-700 transition-colors">{combo.name}</h3>
                        </Link>
                        {combo.description && (
                          <p className="text-[13px] text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">{combo.description}</p>
                        )}
                        {/* Price */}
                        <div className="flex items-center gap-3 mt-3">
                          <span className="text-2xl font-black bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                            {settings.currency} {displayPrice.toFixed(2)}
                          </span>
                          {originalPrice && (
                            <span className="text-sm text-slate-400 line-through">
                              {settings.currency} {originalPrice.toFixed(2)}
                            </span>
                          )}
                          {discount && (
                            <span className="px-2.5 py-1 bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-600 text-[11px] font-bold rounded-full border border-emerald-200">
                              Ahorras {discount}%
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions + shipping */}
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-2.5">
                          <a
                            href={`https://wa.me/${phone}?text=${waMsg}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[12px] font-semibold bg-[#25D366] text-white shadow-[0_2px_8px_rgba(37,211,102,0.25)] active:scale-[0.97] transition-all duration-200"
                          >
                            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                            Pedir
                          </a>
                          <Link
                            href={`/combos/${combo.slug}`}
                            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-[13px] font-bold bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:shadow-lg hover:shadow-cyan-500/25 transition-all"
                          >
                            Ver combo
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                        <div className="flex items-center gap-4 text-slate-400">
                          <span className="flex items-center gap-1.5 text-[11px] font-medium">🚚 Envío a todo Perú</span>
                          <span className="flex items-center gap-1.5 text-[11px] font-medium">🏍 Pago contraentrega</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <Footer settings={settings} categories={categories} />
      {settings.whatsapp && (
        <WhatsAppButton phoneNumber={settings.whatsapp} businessName={settings.businessName || 'el catálogo'} />
      )}
      <MobileBottomNav />
    </div>
  );
}
