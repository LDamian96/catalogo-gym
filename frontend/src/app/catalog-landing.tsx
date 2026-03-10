'use client';

import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import {
  ArrowRight,
  Tag,
  ChevronRight,
  Star,
  ShoppingBag,
  Sparkles,
  Crown,
  Gift,
  Flame,
  Percent,
  Search,
  ShoppingCart,
  Package,
  SlidersHorizontal,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ProductCard,
  WhatsAppButton,
  Footer,
  Navbar,
  MobileBottomNav,
  Hero,
} from '@/components/catalog';
import type { CatalogHomeData } from '@/lib/api/catalog';
import { cn } from '@/lib/utils';
import { v0Ease } from '@/lib/animations';

interface CatalogLandingProps {
  data: CatalogHomeData;
}

const fadeInUp = {
  initial: { opacity: 0, y: 32 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -16 },
};

const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.08,
    },
  },
};

export function CatalogLanding({ data }: CatalogLandingProps) {
  const { settings, categories, featuredProducts, brands, combos = [] } = data;
  const [, setCurrentSlide] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const featuredOnly = featuredProducts.filter((p) => p.isFeatured).slice(0, 8);
  const productsOnSale = featuredProducts.filter((p) => p.salePrice).slice(0, 8);
  const heroProducts = featuredOnly.length > 0 ? featuredOnly.slice(0, 4) : featuredProducts.slice(0, 4);

  useEffect(() => {
    if (heroProducts.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroProducts.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroProducts.length]);

  if (!settings) {
    return null;
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-gradient-to-b from-[#EFF9FF] via-[#DBEAFE] to-[#E0F2FE] lg:bg-white lg:bg-none dark:bg-[#000000] overflow-hidden pb-24 lg:pb-0">
      {/* Desktop Navbar + Hero - hidden on mobile */}
      <div className="hidden lg:block">
        <Navbar settings={settings} categories={categories} transparent />
        <Hero settings={settings} products={heroProducts} />
      </div>

      {/* Brands Marquee Section - Colorful (Desktop) */}
      {brands.length > 0 && (
        <section className="hidden lg:block py-12 lg:py-16 relative overflow-hidden bg-gradient-to-b from-white via-cyan-50/30 to-white dark:from-[#000000] dark:via-[#000000] dark:to-[#000000]">
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: v0Ease }}
              viewport={{ once: true }}
              className="text-center"
            >
              <motion.span
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full text-white text-sm font-bold shadow-lg shadow-cyan-500/30"
                whileHover={{ scale: 1.05 }}
              >
                <Crown className="w-4 h-4" />
                Marcas Premium
                <Sparkles className="w-4 h-4" />
              </motion.span>
              <h2 className="mt-4 text-2xl font-bold text-neutral-800 dark:text-white">
                Trabajamos con las mejores marcas
              </h2>
            </motion.div>
          </div>

          <div className="relative">
            <div className="absolute left-0 top-0 bottom-0 w-32 lg:w-48 bg-gradient-to-r from-white dark:from-[#000000] via-white/90 dark:via-[#000000]/90 to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-32 lg:w-48 bg-gradient-to-l from-white dark:from-[#000000] via-white/90 dark:via-[#000000]/90 to-transparent z-10 pointer-events-none" />

            <div className="flex">
              <motion.div
                className="flex gap-6 items-center"
                animate={{ x: ['-50%', '0%'] }}
                transition={{
                  x: {
                    duration: brands.length * 3,
                    repeat: Infinity,
                    ease: 'linear',
                  },
                }}
              >
                {[...brands, ...brands].map((brand, index) => (
                  <Link
                    key={`brand-${brand.id}-${index}`}
                    href={`/productos?marca=${brand.slug}`}
                    className="flex-shrink-0 px-6 py-4 bg-white dark:bg-neutral-900 rounded-2xl border-2 border-cyan-100 dark:border-cyan-500/20 hover:border-cyan-400 dark:hover:border-cyan-500 hover:shadow-xl hover:shadow-cyan-500/20 hover:-translate-y-2 transition-all duration-300 group"
                  >
                    {brand.logo ? (
                      <div className="relative w-28 h-12">
                        <Image
                          src={brand.logo}
                          alt={brand.name}
                          fill
                          className="object-contain opacity-70 group-hover:opacity-100 transition-all duration-300"
                        />
                      </div>
                    ) : (
                      <span className="text-base font-bold text-neutral-600 dark:text-neutral-300 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-cyan-600 group-hover:to-blue-600 whitespace-nowrap transition-all duration-300">
                        {brand.name}
                      </span>
                    )}
                  </Link>
                ))}
              </motion.div>
            </div>
          </div>
        </section>
      )}

      {/* ============================================ */}
      {/* MOBILE SECTIONS START                        */}
      {/* ============================================ */}

      {/* Mobile Hero Header - matches BETA.pen hero frame */}
      <section className="lg:hidden">
        <div className="bg-gradient-to-br from-[#06B6D4] via-[#0284C7] to-[#1D4ED8] rounded-b-[28px] shadow-[0_10px_28px_#0EA5E926] px-4 pt-[18px] pb-4 flex flex-col gap-3.5">
          {/* Top row: greeting + icons */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
            className="flex items-start justify-between"
          >
            <div>
              <p className="text-white/80 text-[13px] font-medium">Hola, Bienvenido</p>
              <h1 className="text-white text-[18px] font-extrabold leading-tight mt-0.5">
                {settings.businessName || 'Nuestra Tienda'}
              </h1>
            </div>
            <div className="flex items-center gap-2.5">
              <Link href="/productos" className="w-[38px] h-[38px] rounded-full bg-white/15 flex items-center justify-center">
                <Search className="w-[18px] h-[18px] text-white" />
              </Link>
              <Link href="/carrito" className="w-[38px] h-[38px] rounded-full bg-white/15 flex items-center justify-center relative">
                <ShoppingCart className="w-[18px] h-[18px] text-white" />
              </Link>
            </div>
          </motion.div>

          {/* Search bar - white bg like BETA.pen */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1, ease: [0.32, 0.72, 0, 1] }}
          >
            <Link href="/productos" className="block">
              <div className="flex items-center gap-2.5 bg-white/[0.91] rounded-[14px] px-3.5 h-[46px]">
                <Search className="w-[18px] h-[18px] text-[#0891B2] flex-shrink-0" />
                <span className="text-[#94A3B8] text-[14px]">Buscar proteínas, creatinas...</span>
              </div>
            </Link>
          </motion.div>

          {/* Filter chips */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15, ease: [0.32, 0.72, 0, 1] }}
            className="flex gap-2.5"
          >
            <Link
              href="/categorias"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white/20 rounded-full text-white text-[12px] font-semibold"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Categorías
            </Link>
            <Link
              href="/productos?ofertas=true"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white/20 rounded-full text-white text-[12px] font-semibold"
            >
              <Tag className="w-3.5 h-3.5" />
              Ofertas
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Mobile Categories - 130x160 cards matching BETA.pen */}
      {categories.length > 0 && (
        <section className="lg:hidden pt-3">
          <div className="flex items-center justify-between px-3.5 mb-2">
            <h2 className="text-[20px] font-extrabold text-[#0C4A6E] dark:text-white" style={{ fontFamily: 'var(--font-heading, Plus Jakarta Sans, sans-serif)' }}>Categorías</h2>
            <Link href="/categorias" className="text-[13px] font-semibold text-[#0891B2]">Ver todas</Link>
          </div>

          <div className="flex gap-2.5 overflow-x-auto scrollbar-hide snap-x snap-mandatory pl-3.5 pb-2">
            {categories.map((category, index) => (
              <motion.div
                key={`mobile-cat-${category.id}`}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: index * 0.04, ease: [0.32, 0.72, 0, 1] }}
                className="snap-start flex-shrink-0"
              >
                <Link
                  href={`/categorias/${category.slug}`}
                  className="block relative w-[130px] h-[160px] rounded-[20px] overflow-hidden shadow-[0_6px_16px_#0000001A]"
                >
                  {category.image ? (
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      className="object-cover"
                      sizes="130px"
                    />
                  ) : (
                    <div className={`absolute inset-0 ${
                      index % 4 === 0 ? 'bg-gradient-to-br from-cyan-500 to-blue-600' :
                      index % 4 === 1 ? 'bg-gradient-to-br from-blue-500 to-indigo-600' :
                      index % 4 === 2 ? 'bg-gradient-to-br from-teal-500 to-cyan-600' :
                      'bg-gradient-to-br from-sky-500 to-blue-700'
                    }`} />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <h3 className="text-[13px] font-bold text-white leading-tight">{category.name}</h3>
                    {category._count && (
                      <span className="text-[11px] text-white/80 mt-0.5 block">{category._count.products} productos</span>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Mobile Featured Products - 2 Column Grid matching BETA.pen productGrid */}
      {featuredOnly.length > 0 && (
        <section className="lg:hidden">
          <div className="flex items-center justify-between px-3.5 mb-2">
            <h2 className="text-[20px] font-extrabold text-[#0C4A6E] dark:text-white" style={{ fontFamily: 'var(--font-heading, Plus Jakarta Sans, sans-serif)' }}>Destacados</h2>
            <Link href="/productos?destacados=true" className="text-[13px] font-semibold text-[#0891B2]">Ver todo</Link>
          </div>

          <div className="grid grid-cols-2 gap-3 px-3.5">
            {featuredOnly.slice(0, 4).map((product, index) => {
              const price = Number(product.price);
              const sale = product.salePrice ? Number(product.salePrice) : null;
              const discount = sale && price > 0 ? Math.round(((price - sale) / price) * 100) : 0;
              const variantCount = product.variants?.length || 0;
              return (
                <motion.div
                  key={`mobile-feat-${product.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: index * 0.05, ease: [0.32, 0.72, 0, 1] }}
                >
                  <Link href={`/productos/${product.slug}`} className="block bg-white dark:bg-neutral-900 rounded-[20px] overflow-hidden shadow-sm">
                    {/* Image 150px */}
                    <div className="relative w-full h-[150px] bg-[#F8FAFC]">
                      {product.images?.[0]?.url ? (
                        <Image src={product.images[0].url} alt={product.name} fill className="object-cover" sizes="50vw" />
                      ) : (
                        <div className="flex items-center justify-center h-full"><Package className="w-8 h-8 text-neutral-300" /></div>
                      )}
                      {/* Badges */}
                      {discount > 0 && (
                        <span className="absolute top-2 left-2 px-2 py-1 bg-[#DC2626] text-white text-[9px] font-bold rounded-lg">-{discount}%</span>
                      )}
                      {variantCount > 1 && (
                        <span className="absolute top-2 right-2 px-2 py-1 bg-black/60 text-white text-[9px] font-bold rounded-lg">+{variantCount} sabores</span>
                      )}
                    </div>
                    {/* Content */}
                    <div className="p-2.5 flex flex-col gap-0.5">
                      <span className="text-[9px] font-bold text-[#0891B2] uppercase tracking-[1px]">
                        {product.category?.name || 'PRODUCTO'}
                      </span>
                      <h3 className="text-[13px] font-bold text-[#0F172A] dark:text-white leading-tight line-clamp-2" style={{ fontFamily: 'var(--font-heading, Plus Jakarta Sans, sans-serif)' }}>
                        {product.name}
                      </h3>
                      {product.brand && (
                        <span className="text-[11px] text-[#94A3B8]">{product.brand.name}</span>
                      )}
                      <div className="flex items-center gap-1.5 mt-1">
                        {sale ? (
                          <>
                            <span className="text-[16px] font-extrabold text-[#0891B2]">S/ {Number(sale).toFixed(2)}</span>
                            <span className="text-[11px] text-[#94A3B8] line-through">S/ {Number(price).toFixed(2)}</span>
                          </>
                        ) : (
                          <span className="text-[16px] font-extrabold text-[#0F172A] dark:text-white">S/ {Number(price).toFixed(2)}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </section>
      )}

      {/* Mobile Offers - 165px cards matching BETA.pen offRow */}
      {productsOnSale.length > 0 && (
        <section className="lg:hidden pt-1">
          <div className="flex items-center justify-between px-3.5 mb-2">
            <h2 className="text-[20px] font-extrabold text-[#0C4A6E] dark:text-white" style={{ fontFamily: 'var(--font-heading, Plus Jakarta Sans, sans-serif)' }}>En oferta</h2>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gradient-to-b from-[#EF4444] to-[#DC2626] text-white text-[10px] font-bold rounded-full">
              <Flame className="w-3 h-3" /> HOT
            </span>
          </div>

          <div className="flex gap-2.5 overflow-x-auto scrollbar-hide snap-x snap-mandatory pl-3.5 pb-2">
            {productsOnSale.map((product, index) => {
              const price = Number(product.price);
              const sale = product.salePrice ? Number(product.salePrice) : null;
              const discount = sale && price > 0 ? Math.round(((price - sale) / price) * 100) : 0;
              return (
                <motion.div
                  key={`mobile-sale-${product.id}`}
                  initial={{ opacity: 0, scale: 0.92 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: index * 0.04, ease: [0.32, 0.72, 0, 1] }}
                  className="snap-start flex-shrink-0 w-[165px]"
                >
                  <Link href={`/productos/${product.slug}`} className="block bg-white dark:bg-neutral-900 rounded-[20px] overflow-hidden shadow-[0_4px_14px_#0000000D]">
                    {/* Image */}
                    <div className="relative w-full h-[140px] bg-[#F8FAFC]">
                      {product.images?.[0]?.url ? (
                        <Image src={product.images[0].url} alt={product.name} fill className="object-cover" sizes="165px" />
                      ) : (
                        <div className="flex items-center justify-center h-full"><Package className="w-8 h-8 text-neutral-300" /></div>
                      )}
                      {discount > 0 && (
                        <span className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-[3px] bg-gradient-to-b from-[#EF4444] to-[#DC2626] text-white text-[10px] font-bold rounded-[10px]">
                          -{discount}%
                        </span>
                      )}
                    </div>
                    {/* Content */}
                    <div className="p-2.5 flex flex-col gap-1">
                      <span className="text-[9px] font-semibold text-[#0891B2] tracking-[0.5px]">{product.category?.name || 'Producto'}</span>
                      <h3 className="text-[13px] font-bold text-[#0F172A] dark:text-white leading-[1.2] line-clamp-2">{product.name}</h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {sale ? (
                          <>
                            <span className="text-[15px] font-extrabold text-[#0891B2]">S/ {Number(sale).toFixed(2)}</span>
                            <span className="text-[11px] text-[#CBD5E1] line-through">S/ {Number(price).toFixed(2)}</span>
                          </>
                        ) : (
                          <span className="text-[15px] font-extrabold text-[#0F172A] dark:text-white">S/ {Number(price).toFixed(2)}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </section>
      )}

      {/* Mobile Combos - White cards with gradient header matching BETA.pen */}
      <section className="lg:hidden pt-1">
        <div className="flex items-center justify-between px-3.5 mb-2">
          <h2 className="text-[18px] font-extrabold text-[#0F172A] dark:text-white" style={{ fontFamily: 'var(--font-heading, Plus Jakarta Sans, sans-serif)' }}>Combos</h2>
          <Link href="/productos" className="text-[13px] font-semibold text-[#0891B2]">Ver todos</Link>
        </div>

        <div className="flex gap-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory pl-3.5 pb-2">
          {[
            { emoji: '💪', name: 'Combo Fuerza', desc: 'Whey 5lb + Creatina 300g', save: 15, price: 89990, original: 105900, gradient: 'from-[#0891B2] to-[#0284C7]' },
            { emoji: '🔥', name: 'Combo Beast', desc: 'Pre-workout + BCAA + Shaker', save: 20, price: 119990, original: 149900, gradient: 'from-[#7C3AED] to-[#4F46E5]' },
          ].map((combo, index) => (
            <motion.div
              key={`mobile-combo-${index}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05, ease: [0.32, 0.72, 0, 1] }}
              className="snap-start flex-shrink-0 w-[200px]"
            >
              <div className="bg-white dark:bg-neutral-900 rounded-[18px] overflow-hidden shadow-[0_4px_12px_#0000000F]">
                {/* Gradient header with emoji */}
                <div className={`relative h-[110px] bg-gradient-to-br ${combo.gradient}`}>
                  <span className="absolute top-2 left-2 inline-flex px-2 py-1 bg-[#EF4444] text-white text-[9px] font-bold rounded-[10px]">
                    Ahorra {combo.save}%
                  </span>
                  <span className="absolute text-[50px] right-3 top-6">{combo.emoji}</span>
                </div>
                {/* White body */}
                <div className="p-2.5 flex flex-col gap-1">
                  <h3 className="text-[14px] font-extrabold text-[#0F172A] dark:text-white">{combo.name}</h3>
                  <p className="text-[11px] text-[#64748B]">{combo.desc}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[15px] font-extrabold text-[#0F172A] dark:text-white">S/ {(combo.price / 100).toFixed(2)}</span>
                    <span className="text-[11px] text-[#CBD5E1] line-through">S/ {(combo.original / 100).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Mobile Brands - Elegant Marquee Animation */}
      {brands.length > 0 && (
        <section className="lg:hidden pt-2 pb-3">
          <div className="px-3.5 mb-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
              className="flex items-center justify-between"
            >
              <h2 className="text-[20px] font-extrabold text-[#0C4A6E] dark:text-white flex items-center gap-2" style={{ fontFamily: 'var(--font-heading, Plus Jakarta Sans, sans-serif)' }}>
                <Crown className="w-5 h-5 text-cyan-500" />
                Marcas Oficiales
              </h2>
              <Link href="/productos" className="text-[13px] font-semibold text-[#0891B2] flex items-center gap-1">
                Ver todas <ChevronRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>

          <div className="relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[#DBEAFE] dark:from-[#000000] to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#E0F2FE] dark:from-[#000000] to-transparent z-10 pointer-events-none" />

            <motion.div
              className="flex gap-3 items-center"
              animate={{ x: ['-50%', '0%'] }}
              transition={{
                x: {
                  duration: brands.length * 2.5,
                  repeat: Infinity,
                  ease: 'linear',
                },
              }}
            >
              {[...brands, ...brands].map((brand, index) => (
                <Link
                  key={`mobile-brand-${brand.id}-${index}`}
                  href={`/productos?marca=${brand.slug}`}
                  className="flex-shrink-0 px-4 py-2.5 bg-white dark:bg-neutral-900 rounded-xl border border-cyan-100 dark:border-cyan-500/20 shadow-sm hover:shadow-md hover:border-cyan-300 transition-all duration-300"
                >
                  {brand.logo ? (
                    <div className="relative w-20 h-8">
                      <Image
                        src={brand.logo}
                        alt={brand.name}
                        fill
                        className="object-contain"
                        sizes="80px"
                      />
                    </div>
                  ) : (
                    <span className="text-sm font-bold text-[#64748B] dark:text-neutral-300 whitespace-nowrap">
                      {brand.name}
                    </span>
                  )}
                </Link>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* Mobile CTA - matching BETA.pen ctaSection */}
      <section className="lg:hidden px-3.5 pt-2 pb-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
          className="bg-[#F1F5F9] dark:bg-neutral-900 rounded-[18px] py-5 px-4 flex flex-col items-center gap-2.5"
        >
          <h3 className="text-[16px] font-extrabold text-[#0F172A] dark:text-white text-center" style={{ fontFamily: 'var(--font-heading, Plus Jakarta Sans, sans-serif)' }}>¿Buscas algo específico?</h3>
          <p className="text-[12px] text-[#64748B] text-center max-w-[260px]">Explora nuestro catálogo completo con más de 200 productos</p>
          <Link
            href="/productos"
            className="inline-flex items-center gap-1.5 px-6 py-3 bg-gradient-to-b from-[#06B6D4] to-[#1D4ED8] text-white font-bold rounded-[12px] text-[13px]"
          >
            Explorar catálogo
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </section>

      {/* ============================================ */}
      {/* DESKTOP SECTIONS START                       */}
      {/* ============================================ */}

      {/* Promotional Banners - Very Colorful (Desktop) */}
      {categories.length > 0 && (
        <section className="hidden lg:block py-10 lg:py-16 bg-gradient-to-b from-white to-neutral-50 dark:from-[#000000] dark:to-[#000000]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Big Banners */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {featuredOnly.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: v0Ease }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  className="relative h-56 lg:h-64 rounded-3xl overflow-hidden group cursor-pointer shadow-xl shadow-cyan-500/20"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 via-sky-600 to-blue-600" />
                  {featuredOnly[0]?.images?.[0]?.url && (
                    <motion.div
                      className="absolute inset-0 bg-cover bg-center opacity-30 group-hover:opacity-40 transition-all duration-700"
                      style={{ backgroundImage: `url(${featuredOnly[0].images[0].url})` }}
                      whileHover={{ scale: 1.1 }}
                    />
                  )}
                  {/* Animated decoration */}
                  <motion.div
                    className="absolute top-4 right-4 w-20 h-20 border-4 border-white/20 rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  />
                  <div className="relative h-full p-6 flex flex-col justify-between">
                    <motion.span
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-sm text-white text-xs font-bold rounded-full w-fit"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Star className="w-3 h-3 fill-current" />
                      DESTACADOS
                    </motion.span>
                    <div>
                      <h3 className="text-2xl lg:text-3xl font-black text-white mb-2 drop-shadow-lg">Productos Destacados</h3>
                      <p className="text-white/80 text-sm mb-4">Los mejores productos seleccionados para ti</p>
                      <Link
                        href="/productos?destacados=true"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-cyan-600 rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-white/30 transition-all duration-300"
                      >
                        Explorar
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )}

              {productsOnSale.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1, ease: v0Ease }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  className="relative h-56 lg:h-64 rounded-3xl overflow-hidden group cursor-pointer shadow-xl shadow-sky-500/20"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-500" />
                  {productsOnSale[0]?.images?.[0]?.url && (
                    <motion.div
                      className="absolute inset-0 bg-cover bg-center opacity-30 group-hover:opacity-40 transition-all duration-700"
                      style={{ backgroundImage: `url(${productsOnSale[0].images[0].url})` }}
                      whileHover={{ scale: 1.1 }}
                    />
                  )}
                  {/* Animated fire */}
                  <motion.div
                    className="absolute top-4 right-4"
                    animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                  >
                    <Flame className="w-10 h-10 text-yellow-300 drop-shadow-lg" />
                  </motion.div>
                  <div className="relative h-full p-6 flex flex-col justify-between">
                    <motion.span
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-yellow-400 text-red-700 text-xs font-black rounded-full w-fit shadow-lg"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                    >
                      <Percent className="w-3 h-3" />
                      OFERTAS HOT
                    </motion.span>
                    <div>
                      <h3 className="text-2xl lg:text-3xl font-black text-white mb-2 drop-shadow-lg">Ofertas Especiales</h3>
                      <p className="text-white/80 text-sm mb-4">Descuentos increíbles por tiempo limitado</p>
                      <Link
                        href="/productos?ofertas=true"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-400 text-blue-700 rounded-xl text-sm font-black hover:shadow-lg hover:shadow-amber-400/50 transition-all duration-300"
                      >
                        Ver ofertas
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )}

              {featuredProducts.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2, ease: v0Ease }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  className={`relative h-56 lg:h-64 rounded-3xl overflow-hidden group cursor-pointer shadow-xl shadow-teal-500/20 ${
                    !featuredOnly.length || !productsOnSale.length ? '' : 'md:col-span-2 lg:col-span-1'
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-teal-500 via-cyan-600 to-blue-600" />
                  {featuredProducts[0]?.images?.[0]?.url && (
                    <motion.div
                      className="absolute inset-0 bg-cover bg-center opacity-30 group-hover:opacity-40 transition-all duration-700"
                      style={{ backgroundImage: `url(${featuredProducts[0].images[0].url})` }}
                      whileHover={{ scale: 1.1 }}
                    />
                  )}
                  <motion.div
                    className="absolute top-4 right-4"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Gift className="w-10 h-10 text-white drop-shadow-lg" />
                  </motion.div>
                  <div className="relative h-full p-6 flex flex-col justify-between">
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-sm text-white text-xs font-bold rounded-full w-fit">
                      <Sparkles className="w-3 h-3" />
                      NUEVOS
                    </span>
                    <div>
                      <h3 className="text-2xl lg:text-3xl font-black text-white mb-2 drop-shadow-lg">Nuevos Productos</h3>
                      <p className="text-white/80 text-sm mb-4">Descubre lo más reciente en nuestro catálogo</p>
                      <Link
                        href="/productos"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-teal-600 rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-white/30 transition-all duration-300"
                      >
                        Ver todos
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Category Cards - Colorful */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              {categories.slice(0, 4).map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05, ease: v0Ease }}
                  viewport={{ once: true }}
                  whileHover={{ y: -8, scale: 1.02 }}
                >
                  <Link
                    href={`/categorias/${category.slug}`}
                    className="block relative h-36 lg:h-44 rounded-2xl overflow-hidden group shadow-lg hover:shadow-2xl transition-all duration-500"
                  >
                    <div className={`absolute inset-0 ${
                      index === 0 ? 'bg-gradient-to-br from-red-400 via-red-500 to-orange-600' :
                      index === 1 ? 'bg-gradient-to-br from-amber-400 via-amber-500 to-indigo-600' :
                      index === 2 ? 'bg-gradient-to-br from-amber-400 via-orange-500 to-red-500' :
                      'bg-gradient-to-br from-emerald-400 via-teal-500 to-red-600'
                    }`} />
                    {category.image && (
                      <motion.div
                        className="absolute inset-0 bg-cover bg-center opacity-40 group-hover:opacity-50 transition-all duration-700"
                        style={{ backgroundImage: `url(${category.image})` }}
                        whileHover={{ scale: 1.15 }}
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="relative h-full p-4 flex flex-col justify-end">
                      <h3 className="text-lg lg:text-xl font-black text-white drop-shadow-lg">
                        {category.name}
                      </h3>
                      <motion.span
                        className="text-white/90 text-sm mt-1 flex items-center gap-1 font-medium"
                        whileHover={{ x: 5 }}
                      >
                        Ver productos <ArrowRight className="w-4 h-4" />
                      </motion.span>
                    </div>
                    {/* Corner decoration */}
                    <div className="absolute top-0 right-0 w-12 h-12 overflow-hidden">
                      <div className="absolute -top-6 -right-6 w-12 h-12 bg-white/20 rotate-45" />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products Section - Colorful (Desktop) */}
      {featuredOnly.length > 0 && (
        <section className="hidden lg:block py-20 lg:py-28 relative overflow-hidden bg-gradient-to-b from-neutral-50 via-white to-cyan-50/30 dark:from-[#000000] dark:via-[#000000] dark:to-[#000000]">
          {/* Decorative background */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-500/10 dark:bg-white/5 rounded-full blur-3xl"
              animate={{ scale: [1, 1.2, 1], x: [0, 30, 0] }}
              transition={{ duration: 10, repeat: Infinity }}
            />
            <motion.div
              className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 dark:bg-white/5 rounded-full blur-3xl"
              animate={{ scale: [1.2, 1, 1.2], y: [0, 30, 0] }}
              transition={{ duration: 12, repeat: Infinity }}
            />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, ease: v0Ease }}
              className="flex flex-col sm:flex-row items-center sm:items-end justify-between mb-12 gap-4"
            >
              <div className="text-center sm:text-left">
                <motion.span
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-full text-sm font-bold shadow-lg shadow-cyan-500/30 mb-4"
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Star className="w-4 h-4 fill-current" />
                  DESTACADOS
                  <Sparkles className="w-4 h-4" />
                </motion.span>
                <h2 className="text-3xl lg:text-5xl font-black text-neutral-900 dark:text-white tracking-tight">
                  Productos <span className="bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-600 bg-clip-text text-transparent">Destacados</span>
                </h2>
              </div>
              <motion.div whileHover={{ x: 5, scale: 1.05 }}>
                <Link
                  href="/productos?destacados=true"
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/40 transition-all duration-300"
                >
                  Ver todos
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            </motion.div>

            <motion.div
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 lg:gap-6"
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, margin: "-50px" }}
            >
              {featuredOnly.map((product, index) => (
                <motion.div
                  key={product.id}
                  variants={fadeInUp}
                  transition={{ delay: index * 0.06, duration: 0.4, ease: v0Ease }}
                >
                  <ProductCard product={product} index={index} />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* Offers Section - Very Colorful (Desktop) */}
      {productsOnSale.length > 0 && (
        <section className="hidden lg:block py-20 lg:py-28 bg-gradient-to-b from-sky-50 via-white to-white dark:from-[#000000] dark:via-[#000000] dark:to-[#000000] relative overflow-hidden">
          {/* Animated background decorations */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              className="absolute top-20 right-20 w-60 h-60 bg-cyan-500/10 dark:bg-white/5 rounded-full blur-3xl"
              animate={{ scale: [1, 1.3, 1], rotate: [0, 90, 0] }}
              transition={{ duration: 15, repeat: Infinity }}
            />
            <motion.div
              className="absolute bottom-20 left-20 w-80 h-80 bg-blue-500/10 dark:bg-white/5 rounded-full blur-3xl"
              animate={{ scale: [1.3, 1, 1.3] }}
              transition={{ duration: 20, repeat: Infinity }}
            />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, ease: v0Ease }}
              className="flex flex-col sm:flex-row items-center sm:items-end justify-between mb-12 gap-4"
            >
              <div className="text-center sm:text-left">
                <motion.span
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-full text-sm font-bold shadow-lg shadow-cyan-500/30 mb-4"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                >
                  <Flame className="w-4 h-4" />
                  OFERTAS HOT
                  <motion.span
                    className="px-2 py-0.5 bg-amber-400 text-blue-700 text-xs font-black rounded"
                    animate={{ rotate: [-5, 5, -5] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                  >
                    %
                  </motion.span>
                </motion.span>
                <h2 className="text-3xl lg:text-5xl font-black text-neutral-900 dark:text-white tracking-tight">
                  Aprovecha las <span className="bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-500 bg-clip-text text-transparent">Ofertas</span>
                </h2>
              </div>
              <motion.div whileHover={{ x: 5, scale: 1.05 }}>
                <Link
                  href="/productos?ofertas=true"
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/40 transition-all duration-300"
                >
                  Ver todas
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            </motion.div>

            <motion.div
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 lg:gap-6"
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, margin: "-50px" }}
            >
              {productsOnSale.map((product, index) => (
                <motion.div
                  key={product.id}
                  variants={fadeInUp}
                  transition={{ delay: index * 0.06, duration: 0.4, ease: v0Ease }}
                >
                  <ProductCard product={product} index={index} />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* Combos Section (Desktop) */}
      {combos.length > 0 && (
        <section className="hidden lg:block py-20 lg:py-28 bg-gradient-to-b from-cyan-50/30 via-white to-neutral-50 dark:from-[#000000] dark:via-[#000000] dark:to-[#000000] relative overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              className="absolute -top-40 -left-40 w-80 h-80 bg-cyan-500/10 dark:bg-white/5 rounded-full blur-3xl"
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 12, repeat: Infinity }}
            />
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, ease: v0Ease }}
              className="flex flex-col sm:flex-row items-center sm:items-end justify-between mb-12 gap-4"
            >
              <div className="text-center sm:text-left">
                <motion.span
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-full text-sm font-bold shadow-lg shadow-cyan-500/30 mb-4"
                >
                  <Gift className="w-4 h-4" />
                  COMBOS
                </motion.span>
                <h2 className="text-3xl lg:text-5xl font-black text-neutral-900 dark:text-white tracking-tight">
                  Packs con <span className="bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-600 bg-clip-text text-transparent">Descuento</span>
                </h2>
              </div>
              <motion.div whileHover={{ x: 5, scale: 1.05 }}>
                <Link
                  href="/combos"
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/40 transition-all duration-300"
                >
                  Ver todos
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            </motion.div>

            <motion.div
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 lg:gap-6"
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, margin: "-50px" }}
            >
              {combos.slice(0, 4).map((combo, index) => {
                const displayPrice = Number(combo.salePrice || combo.price);
                const originalPrice = combo.salePrice ? Number(combo.price) : null;
                return (
                  <motion.div
                    key={combo.id}
                    variants={fadeInUp}
                    transition={{ delay: index * 0.06, duration: 0.4, ease: v0Ease }}
                  >
                    <Link href={`/combos/${combo.slug}`} className="block group">
                      <article className={cn(
                        'relative h-full flex flex-col overflow-hidden rounded-2xl',
                        'bg-white dark:bg-[#0a0a0a]',
                        'border-2 border-cyan-100 dark:border-neutral-800',
                        'transition-all duration-500',
                        'hover:border-cyan-400 dark:hover:border-cyan-500/50',
                        'hover:shadow-2xl hover:shadow-cyan-500/30 dark:hover:shadow-cyan-500/10',
                        'hover:-translate-y-2 hover:scale-[1.02]',
                      )}>
                        {/* Glow Effect */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-500 rounded-2xl opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-500 -z-10 dark:group-hover:opacity-10" />

                        {/* Image */}
                        <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-br from-cyan-50 via-sky-50 to-blue-50 dark:from-neutral-900 dark:via-neutral-900 dark:to-neutral-900">
                          {combo.image ? (
                            <Image src={combo.image} alt={combo.name} fill className="object-cover transition-all duration-700 group-hover:scale-110" sizes="(max-width: 1024px) 33vw, 25vw" />
                          ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-cyan-100 via-sky-100 to-blue-100 dark:from-neutral-900 dark:via-neutral-900 dark:to-neutral-900">
                              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 dark:from-neutral-700 dark:to-neutral-600 flex items-center justify-center mb-2 shadow-lg shadow-cyan-500/30 dark:shadow-none">
                                <Gift className="w-8 h-8 text-white dark:text-neutral-400" />
                              </div>
                              <span className="text-xs font-medium text-cyan-600 dark:text-neutral-500">Combo</span>
                            </div>
                          )}

                          {/* Hover overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />

                          {/* Discount badge */}
                          {combo.discountPercent && (
                            <div className="absolute top-3 left-3">
                              <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 text-white text-xs font-bold rounded-lg shadow-lg shadow-orange-500/50">
                                <Tag className="w-3 h-3" />
                                -{combo.discountPercent}% OFF
                              </span>
                            </div>
                          )}

                          {/* Products count badge */}
                          {combo.comboProducts && combo.comboProducts.length > 0 && (
                            <div className="absolute top-3 right-3">
                              <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold rounded-lg shadow-lg shadow-cyan-500/50">
                                <Gift className="w-3 h-3" />
                                {combo.comboProducts.length} productos
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 flex flex-col p-4 bg-gradient-to-b from-white to-cyan-50/50 dark:from-[#0a0a0a] dark:to-[#0a0a0a]">
                          <span className={cn(
                            'inline-flex items-center gap-1 self-start px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md mb-2',
                            'bg-gradient-to-r from-cyan-100 to-sky-100 text-cyan-700',
                            'dark:from-cyan-500/10 dark:to-cyan-500/10 dark:text-cyan-400'
                          )}>
                            COMBO
                          </span>

                          <h3 className={cn(
                            'text-sm font-bold leading-snug line-clamp-2 mb-1 transition-all duration-300',
                            'bg-gradient-to-r from-cyan-700 via-sky-600 to-blue-700 bg-clip-text text-transparent',
                            'group-hover:from-cyan-500 group-hover:via-sky-500 group-hover:to-blue-500',
                            'dark:from-white dark:via-white dark:to-white dark:group-hover:from-cyan-400 dark:group-hover:to-cyan-400'
                          )}>
                            {combo.name}
                          </h3>

                          {combo.description && (
                            <p className="text-[11px] text-neutral-500 dark:text-neutral-500 mb-2 font-medium line-clamp-1">
                              {combo.description}
                            </p>
                          )}

                          <div className="flex-1" />

                          <div className="flex items-center gap-3 mt-3">
                            {originalPrice ? (
                              <>
                                <span className="text-xl font-black bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 dark:from-red-500 dark:via-orange-500 dark:to-amber-500 bg-clip-text text-transparent">
                                  {settings.currency} {displayPrice.toFixed(2)}
                                </span>
                                <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-500/20 rounded text-xs text-slate-400 dark:text-slate-500 line-through font-medium">
                                  {settings.currency} {originalPrice.toFixed(2)}
                                </span>
                              </>
                            ) : (
                              <span className="text-xl font-black text-neutral-900 dark:text-white">
                                {settings.currency} {displayPrice.toFixed(2)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Bottom gradient bar */}
                        <div className="h-1 opacity-30 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-500 dark:bg-cyan-500" />
                      </article>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>
      )}

      {/* Call to Action - Compact (Desktop) */}
      <section className="hidden lg:block py-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 via-sky-700 to-blue-800 dark:from-[#000000] dark:via-[#000000] dark:to-[#000000]" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-white">
                ¿Listo para comprar?
              </h2>
              <p className="text-white/70 text-sm mt-1">
                Explora nuestro catálogo completo con los mejores precios.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/productos"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-cyan-600 rounded-xl text-sm font-bold hover:shadow-lg transition-all"
              >
                <ShoppingBag className="w-4 h-4" />
                Ver Catálogo
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/categorias"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 text-white rounded-xl text-sm font-bold border border-white/30 hover:bg-white/30 transition-all"
              >
                Categorías
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer settings={settings} />

      {settings.whatsapp && (
        <WhatsAppButton
          phoneNumber={settings.whatsapp}
          businessName={settings.businessName || 'el catálogo'}
        />
      )}

      <MobileBottomNav />
    </div>
  );
}
