'use client';

import { motion, AnimatePresence, useScroll, useTransform, useInView, useSpring } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import {
  ArrowRight,
  Tag,
  ChevronRight,
  Star,
  Zap,
  TrendingUp,
  ShoppingBag,
  Sparkles,
  Crown,
  Gift,
  Flame,
  Percent,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ProductCard,
  WhatsAppButton,
  Footer,
  Navbar,
  MobileBottomNav,
  TransitionLink,
  Hero,
} from '@/components/catalog';
import type { CatalogHomeData } from '@/lib/api/catalog';
import { cn } from '@/lib/utils';
import { v0Ease, gradientOrbAnimation } from '@/lib/animations';

interface CatalogLandingProps {
  data: CatalogHomeData;
}

const fadeInUp = {
  initial: { opacity: 0, y: 32 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -16 },
};

const fadeInDown = {
  initial: { opacity: 0, y: -32 },
  animate: { opacity: 1, y: 0 },
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
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

function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const spring = useSpring(0, { duration: 2000 });

  useEffect(() => {
    if (isInView) {
      spring.set(value);
    }
  }, [isInView, value, spring]);

  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    return spring.on('change', (latest) => {
      setDisplayValue(Math.floor(latest));
    });
  }, [spring]);

  return <span ref={ref}>{displayValue}{suffix}</span>;
}

export function CatalogLanding({ data }: CatalogLandingProps) {
  const { settings, categories, featuredProducts, brands } = data;
  const [currentSlide, setCurrentSlide] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.95]);

  if (!settings) {
    return null;
  }

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

  return (
    <div ref={containerRef} className="min-h-screen bg-white dark:bg-[#000000] overflow-hidden">
      <Navbar settings={settings} categories={categories} transparent />

      {/* Hero Section - Using the new colorful Hero component */}
      <Hero settings={settings} products={heroProducts} />

      {/* Brands Marquee Section - Colorful */}
      {brands.length > 0 && (
        <section className="py-12 lg:py-16 relative overflow-hidden bg-gradient-to-b from-white via-cyan-50/30 to-white dark:from-[#000000] dark:via-[#000000] dark:to-[#000000]">
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

      {/* Promotional Banners - Very Colorful */}
      {categories.length > 0 && (
        <section className="py-10 lg:py-16 bg-gradient-to-b from-white to-neutral-50 dark:from-[#000000] dark:to-[#000000]">
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

      {/* Featured Products Section - Colorful */}
      {featuredOnly.length > 0 && (
        <section className="py-20 lg:py-28 relative overflow-hidden bg-gradient-to-b from-neutral-50 via-white to-cyan-50/30 dark:from-[#000000] dark:via-[#000000] dark:to-[#000000]">
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

      {/* Offers Section - Very Colorful */}
      {productsOnSale.length > 0 && (
        <section className="py-20 lg:py-28 bg-gradient-to-b from-sky-50 via-white to-white dark:from-[#000000] dark:via-[#000000] dark:to-[#000000] relative overflow-hidden">
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

      {/* Call to Action Section - Colorful */}
      <section className="py-20 lg:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 via-sky-700 to-blue-800 dark:from-[#000000] dark:via-[#000000] dark:to-[#000000]" />

        {/* Animated decorations */}
        <motion.div
          className="absolute -top-20 -left-20 w-60 h-60 bg-white/10 dark:bg-white/5 rounded-full blur-3xl"
          animate={{ scale: [1, 1.5, 1], x: [0, 50, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
        <motion.div
          className="absolute -bottom-20 -right-20 w-80 h-80 bg-blue-400/20 dark:bg-white/5 rounded-full blur-3xl"
          animate={{ scale: [1.5, 1, 1.5] }}
          transition={{ duration: 12, repeat: Infinity }}
        />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: v0Ease }}
          >
            <motion.span
              className="inline-flex items-center gap-2 px-5 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-bold mb-6"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <ShoppingBag className="w-4 h-4" />
              Tu catálogo digital favorito
            </motion.span>
            <h2 className="text-4xl lg:text-6xl font-black text-white mb-6 drop-shadow-lg">
              ¿Listo para comprar?
            </h2>
            <p className="text-lg text-white/80 mb-10 max-w-2xl mx-auto">
              Explora todo nuestro catálogo y encuentra exactamente lo que necesitas. Productos de calidad con los mejores precios.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/productos"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white text-cyan-600 dark:text-neutral-900 rounded-2xl text-lg font-bold shadow-2xl shadow-black/30 hover:shadow-white/30 transition-all duration-300"
                >
                  <ShoppingBag className="w-5 h-5" />
                  Ver Catálogo Completo
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/categorias"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white/20 backdrop-blur-sm text-white rounded-2xl text-lg font-bold border-2 border-white/30 hover:bg-white/30 transition-all duration-300"
                >
                  Explorar Categorías
                </Link>
              </motion.div>
            </div>
          </motion.div>
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
