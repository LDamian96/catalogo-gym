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
} from '@/components/catalog';
import type { CatalogHomeData } from '@/lib/api/catalog';
import { cn } from '@/lib/utils';
import { v0Ease, gradientOrbAnimation } from '@/lib/animations';

interface CatalogLandingProps {
  data: CatalogHomeData;
}

// V0 Soft Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const fadeInDown = {
  initial: { opacity: 0, y: -40 },
  animate: { opacity: 1, y: 0 },
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
};

const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

// V0 Style animated counter
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

  // Auto-rotate slides
  useEffect(() => {
    if (heroProducts.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroProducts.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroProducts.length]);

  return (
    <div ref={containerRef} className="min-h-screen bg-violet-50/50 dark:bg-[#0a0a0f] overflow-hidden">
      {/* Navbar */}
      <Navbar settings={settings} categories={categories} transparent />

      {/* Hero Section - V0 Soft Style */}
      <section
        className="relative min-h-screen flex items-center overflow-hidden"
      >
        {/* V0 Soft Background */}
        <div className="absolute inset-0 bg-[#0a0a0f]" />

        {/* Radial gradient from top - Violet */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(139,92,246,0.15),transparent)]" />

        {/* Subtle mesh gradient - Multi-color */}
        <div className="absolute inset-0 bg-[radial-gradient(at_27%_37%,hsla(263,70%,50%,0.1)_0px,transparent_50%),radial-gradient(at_97%_21%,hsla(330,70%,50%,0.08)_0px,transparent_50%)]" />

        {/* V0 Dot Pattern */}
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: 'radial-gradient(rgba(167, 139, 250, 0.1) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Animated Gradient Orbs - V0 Soft Style */}
        <motion.div
          className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-violet-500/10 rounded-full blur-[150px]"
          animate={gradientOrbAnimation}
        />
        <motion.div
          className="absolute -bottom-32 right-0 w-[500px] h-[500px] bg-pink-500/8 rounded-full blur-[130px]"
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [0.15, 0.3, 0.15],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />
        <motion.div
          className="absolute top-1/2 right-1/4 w-[400px] h-[400px] bg-purple-500/6 rounded-full blur-[100px]"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
        />

        {/* Main Content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 lg:pt-28 lg:pb-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Content */}
            <motion.div
              className="text-center lg:text-left"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {/* V0 Soft Style Badge */}
              {productsOnSale.length > 0 && (
                <motion.div
                  variants={fadeInDown}
                  transition={{ duration: 0.6, ease: v0Ease }}
                  className="inline-flex items-center gap-2 mb-6"
                >
                  <div className="flex items-center gap-2 px-4 py-2 bg-violet-500/10 backdrop-blur-sm border border-violet-500/20 rounded-full">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-400" />
                    </span>
                    <span className="text-violet-300 text-sm font-medium">Ofertas especiales disponibles</span>
                  </div>
                </motion.div>
              )}

              {/* V0 Soft Style Title */}
              <motion.h1
                className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-semibold leading-[1.1] mb-6 tracking-tight"
                variants={fadeInUp}
                transition={{ duration: 0.8, ease: v0Ease }}
              >
                <span className="text-white">Descubre </span>
                <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  productos
                </span>
                <motion.span
                  className="block mt-2 text-white"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6, ease: v0Ease }}
                >
                  increíbles
                </motion.span>
              </motion.h1>

              {/* Description */}
              <motion.p
                className="text-base lg:text-lg text-white/50 max-w-lg mx-auto lg:mx-0 mb-8 leading-relaxed"
                variants={fadeInUp}
                transition={{ delay: 0.3, duration: 0.6, ease: v0Ease }}
              >
                Explora nuestra colección con las mejores marcas y precios. Entrega rápida a tu puerta.
              </motion.p>

              {/* V0 Soft Style CTA Buttons */}
              <motion.div
                className="flex flex-col sm:flex-row items-center lg:items-start gap-3"
                variants={fadeInUp}
                transition={{ delay: 0.4, duration: 0.6, ease: v0Ease }}
              >
                <Link
                  href="/productos"
                  className="group inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-violet-500 to-pink-500 text-white rounded-xl font-medium hover:from-violet-600 hover:to-pink-600 hover:shadow-[0_0_30px_rgba(139,92,246,0.4)] transition-all duration-300"
                >
                  <ShoppingBag className="w-5 h-5" />
                  Ver Catálogo
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>

                <Link
                  href="/categorias"
                  className="inline-flex items-center gap-2 px-6 py-3.5 text-white/70 hover:text-white font-medium transition-all duration-300 border border-white/[0.08] rounded-xl hover:bg-violet-500/10 hover:border-violet-500/30"
                >
                  Explorar Categorías
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </motion.div>

              {/* V0 Soft Style Stats */}
              <motion.div
                className="flex items-center justify-center lg:justify-start gap-6 sm:gap-10 mt-10"
                variants={fadeInUp}
                transition={{ delay: 0.5, duration: 0.6, ease: v0Ease }}
              >
                {[
                  { value: featuredProducts.length, suffix: '+', label: 'Productos' },
                  { value: categories.length, suffix: '', label: 'Categorías' },
                  { value: brands.length, suffix: '+', label: 'Marcas' },
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 + index * 0.1, duration: 0.5, ease: v0Ease }}
                    className="text-center"
                  >
                    <p className="text-2xl sm:text-3xl font-semibold bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
                      <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                    </p>
                    <p className="text-xs sm:text-sm text-white/40">{stat.label}</p>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right Content - Product Showcase */}
            <motion.div
              className="relative hidden lg:block"
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: v0Ease, delay: 0.3 }}
            >
              {heroProducts.length > 0 && (
                <div className="relative max-w-md mx-auto">
                  {/* V0 Soft Glass card background */}
                  <div className="absolute -inset-4 bg-white/[0.02] rounded-[2rem] border border-white/[0.06] backdrop-blur-sm" />

                  {/* Main Product Card */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentSlide}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.5, ease: v0Ease }}
                      className="relative aspect-[4/4] rounded-2xl overflow-hidden bg-[#12121a]"
                    >
                      {heroProducts[currentSlide]?.images?.[0]?.url && (
                        <Image
                          src={heroProducts[currentSlide].images[0].url}
                          alt={heroProducts[currentSlide].name}
                          fill
                          className="object-cover"
                          priority
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

                      {/* Product Info */}
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <div className="flex items-center gap-2 mb-2">
                          {heroProducts[currentSlide].brand && (
                            <span className="px-2.5 py-1 bg-white/[0.08] backdrop-blur-sm rounded-lg text-white/90 text-xs font-medium border border-white/[0.08]">
                              {heroProducts[currentSlide].brand.name}
                            </span>
                          )}
                          {heroProducts[currentSlide].salePrice && (
                            <span className="px-2.5 py-1 bg-gradient-to-r from-violet-500 to-pink-500 rounded-lg text-white text-xs font-semibold">
                              Oferta
                            </span>
                          )}
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-1.5 line-clamp-1">
                          {heroProducts[currentSlide].name}
                        </h3>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-semibold bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
                            {settings.currency} {Number(heroProducts[currentSlide].salePrice || heroProducts[currentSlide].price).toFixed(2)}
                          </span>
                          {heroProducts[currentSlide].salePrice && (
                            <span className="text-sm text-white/40 line-through">
                              {settings.currency} {Number(heroProducts[currentSlide].price).toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          </div>
        </div>

        {/* V0 Soft Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6, ease: v0Ease }}
        >
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className="w-5 h-8 rounded-full border border-white/20 flex items-start justify-center p-1.5">
              <motion.div
                className="w-1 h-1.5 bg-gradient-to-b from-violet-400 to-pink-400 rounded-full"
                animate={{ y: [0, 10, 0], opacity: [1, 0.3, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Brands Marquee Section */}
      {brands.length > 0 && (
        <section className="py-10 lg:py-14 relative overflow-hidden bg-gradient-to-b from-violet-50 via-white to-white dark:from-violet-950/20 dark:via-[#0a0a0f] dark:to-[#0a0a0f]">
          {/* Decorative background */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(139,92,246,0.08),transparent)]" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: v0Ease }}
              viewport={{ once: true }}
              className="text-center"
            >
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-violet-100 dark:bg-violet-500/10 rounded-full text-violet-600 dark:text-violet-400 text-sm font-medium mb-2">
                <Sparkles className="w-4 h-4" />
                Marcas que confían en nosotros
              </span>
            </motion.div>
          </div>

          {/* Marquee container */}
          <div className="relative">
            {/* Gradient masks */}
            <div className="absolute left-0 top-0 bottom-0 w-24 lg:w-40 bg-gradient-to-r from-white dark:from-[#0a0a0f] via-white/80 dark:via-[#0a0a0f]/80 to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-24 lg:w-40 bg-gradient-to-l from-white dark:from-[#0a0a0f] via-white/80 dark:via-[#0a0a0f]/80 to-transparent z-10 pointer-events-none" />

            {/* Single row - moves right smoothly */}
            <div className="flex">
              <motion.div
                className="flex gap-5 items-center"
                animate={{ x: ['-50%', '0%'] }}
                transition={{
                  x: {
                    duration: brands.length * 3,
                    repeat: Infinity,
                    ease: 'linear',
                  },
                }}
              >
                {/* Duplicate brands for seamless loop */}
                {[...brands, ...brands].map((brand, index) => (
                  <Link
                    key={`brand-${brand.id}-${index}`}
                    href={`/productos?marca=${brand.slug}`}
                    className="flex-shrink-0 px-5 py-3 bg-white dark:bg-white/5 rounded-xl border border-violet-100 dark:border-violet-500/10 hover:border-violet-400 dark:hover:border-violet-500/30 hover:shadow-lg hover:shadow-violet-500/10 hover:-translate-y-1 transition-all duration-300 group backdrop-blur-sm"
                  >
                    {brand.logo ? (
                      <div className="relative w-24 h-10">
                        <Image
                          src={brand.logo}
                          alt={brand.name}
                          fill
                          className="object-contain opacity-60 group-hover:opacity-100 transition-all duration-300"
                        />
                      </div>
                    ) : (
                      <span className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 group-hover:text-violet-600 dark:group-hover:text-violet-400 whitespace-nowrap transition-colors">
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

      {/* Promotional Banners - Grocery Style */}
      {categories.length > 0 && (
        <section className="py-8 lg:py-12 bg-white dark:bg-[#0a0a0f]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Grid de banners */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Banner 1 - Productos Destacados */}
              {featuredOnly.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: v0Ease }}
                  viewport={{ once: true }}
                  className="relative h-48 lg:h-56 rounded-xl overflow-hidden group cursor-pointer"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-amber-500" />
                  {featuredOnly[0]?.images?.[0]?.url && (
                    <div
                      className="absolute inset-0 bg-cover bg-center opacity-40 group-hover:opacity-50 group-hover:scale-105 transition-all duration-500"
                      style={{ backgroundImage: `url(${featuredOnly[0].images[0].url})` }}
                    />
                  )}
                  <div className="relative h-full p-6 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl lg:text-2xl font-bold text-white mb-1">Productos Destacados</h3>
                      <p className="text-white/80 text-sm">Los mejores productos para ti</p>
                    </div>
                    <Link
                      href="/productos?destacados=true"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg text-sm font-medium hover:bg-white/30 transition-colors w-fit"
                    >
                      Ver más
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </motion.div>
              )}

              {/* Banner 2 - Ofertas Especiales */}
              {productsOnSale.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1, ease: v0Ease }}
                  viewport={{ once: true }}
                  className="relative h-48 lg:h-56 rounded-xl overflow-hidden group cursor-pointer"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500" />
                  {productsOnSale[0]?.images?.[0]?.url && (
                    <div
                      className="absolute inset-0 bg-cover bg-center opacity-40 group-hover:opacity-50 group-hover:scale-105 transition-all duration-500"
                      style={{ backgroundImage: `url(${productsOnSale[0].images[0].url})` }}
                    />
                  )}
                  <div className="relative h-full p-6 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl lg:text-2xl font-bold text-white mb-1">Ofertas Especiales</h3>
                      <p className="text-white/80 text-sm">Aprovecha los mejores precios</p>
                    </div>
                    <Link
                      href="/productos?ofertas=true"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg text-sm font-medium hover:bg-white/30 transition-colors w-fit"
                    >
                      Ver más
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </motion.div>
              )}

              {/* Banner 3 - Nuevos Productos */}
              {featuredProducts.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2, ease: v0Ease }}
                  viewport={{ once: true }}
                  className={`relative h-48 lg:h-56 rounded-xl overflow-hidden group cursor-pointer ${
                    !featuredOnly.length || !productsOnSale.length ? '' : 'md:col-span-2 lg:col-span-1'
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-purple-600" />
                  {featuredProducts[0]?.images?.[0]?.url && (
                    <div
                      className="absolute inset-0 bg-cover bg-center opacity-40 group-hover:opacity-50 group-hover:scale-105 transition-all duration-500"
                      style={{ backgroundImage: `url(${featuredProducts[0].images[0].url})` }}
                    />
                  )}
                  <div className="relative h-full p-6 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl lg:text-2xl font-bold text-white mb-1">Nuevos Productos</h3>
                      <p className="text-white/80 text-sm">Descubre lo más reciente</p>
                    </div>
                    <Link
                      href="/productos"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg text-sm font-medium hover:bg-white/30 transition-colors w-fit"
                    >
                      Ver más
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Segunda fila de banners más pequeños */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
              {categories.slice(0, 4).map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05, ease: v0Ease }}
                  viewport={{ once: true }}
                >
                  <Link
                    href={`/categorias/${category.slug}`}
                    className="block relative h-32 lg:h-40 rounded-xl overflow-hidden group"
                  >
                    <div className={`absolute inset-0 ${
                      index === 0 ? 'bg-gradient-to-br from-rose-400 to-pink-500' :
                      index === 1 ? 'bg-gradient-to-br from-sky-400 to-blue-500' :
                      index === 2 ? 'bg-gradient-to-br from-lime-400 to-green-500' :
                      'bg-gradient-to-br from-amber-400 to-orange-500'
                    }`} />
                    {category.image && (
                      <div
                        className="absolute inset-0 bg-cover bg-center opacity-40 group-hover:opacity-50 group-hover:scale-105 transition-all duration-500"
                        style={{ backgroundImage: `url(${category.image})` }}
                      />
                    )}
                    <div className="relative h-full p-4 flex flex-col justify-end">
                      <h3 className="text-base lg:text-lg font-bold text-white drop-shadow-md">
                        {category.name}
                      </h3>
                      <span className="text-white/80 text-xs mt-1 flex items-center gap-1">
                        Ver productos <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products Section - V0 Soft Style */}
      {featuredOnly.length > 0 && (
        <section className="py-20 lg:py-28 relative overflow-hidden bg-white dark:bg-[#0a0a0f]">
          <motion.div
            className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/5 rounded-full blur-[100px]"
            animate={{ y: [0, -30, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, ease: v0Ease }}
              className="flex items-end justify-between mb-12"
            >
              <div>
                <motion.div
                  className="flex items-center gap-2 text-violet-600 dark:text-violet-400 mb-2"
                  initial={{ x: -20, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, ease: v0Ease }}
                >
                  <Star className="w-5 h-5 fill-current" />
                  <span className="text-sm font-medium uppercase tracking-wider">Destacados</span>
                </motion.div>
                <h2 className="text-3xl lg:text-4xl font-semibold text-neutral-900 dark:text-white tracking-tight">
                  Productos Destacados
                </h2>
              </div>
              <motion.div whileHover={{ x: 5 }} className="hidden sm:block">
                <Link
                  href="/productos?destacados=true"
                  className="flex items-center gap-2 text-neutral-500 dark:text-white/50 hover:text-violet-600 dark:hover:text-violet-400 font-medium transition-colors duration-300"
                >
                  Ver todos
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            </motion.div>

            <motion.div
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6"
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, margin: "-50px" }}
            >
              {featuredOnly.map((product, index) => (
                <motion.div
                  key={product.id}
                  variants={fadeInUp}
                  transition={{ delay: index * 0.08, duration: 0.5, ease: v0Ease }}
                  whileHover={{ y: -8 }}
                >
                  <ProductCard product={product} index={index} />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* Offers Section - V0 Soft Style */}
      {productsOnSale.length > 0 && (
        <section className="py-20 lg:py-28 bg-neutral-50 dark:bg-[#0a0a0f] relative overflow-hidden">
          {/* V0 Soft animated background */}
          <motion.div
            className="absolute top-20 right-20 w-40 h-40 bg-pink-500/8 rounded-full blur-[80px]"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-20 left-20 w-60 h-60 bg-violet-500/6 rounded-full blur-[80px]"
            animate={{
              scale: [1.5, 1, 1.5],
              opacity: [0.5, 0.3, 0.5],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
          />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, ease: v0Ease }}
              className="flex items-end justify-between mb-12"
            >
              <div>
                <motion.div
                  className="flex items-center gap-2 text-pink-600 dark:text-pink-400 mb-2"
                  initial={{ x: -20, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, ease: v0Ease }}
                >
                  <Tag className="w-5 h-5" />
                  <span className="text-sm font-medium uppercase tracking-wider">Ofertas</span>
                  <motion.span
                    className="px-2 py-0.5 bg-gradient-to-r from-violet-500 to-pink-500 text-white text-xs font-semibold rounded-full"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    HOT
                  </motion.span>
                </motion.div>
                <h2 className="text-3xl lg:text-4xl font-semibold text-neutral-900 dark:text-white tracking-tight">
                  Aprovecha las Ofertas
                </h2>
              </div>
              <motion.div whileHover={{ x: 5 }} className="hidden sm:block">
                <Link
                  href="/productos?ofertas=true"
                  className="flex items-center gap-2 text-neutral-500 dark:text-white/50 hover:text-pink-600 dark:hover:text-pink-400 font-medium transition-colors duration-300"
                >
                  Ver todas
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            </motion.div>

            <motion.div
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6"
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, margin: "-50px" }}
            >
              {productsOnSale.map((product, index) => (
                <motion.div
                  key={product.id}
                  variants={fadeInUp}
                  transition={{ delay: index * 0.08, duration: 0.5, ease: v0Ease }}
                  whileHover={{ y: -8 }}
                >
                  <ProductCard product={product} index={index} />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* Footer */}
      <Footer settings={settings} />

      {/* WhatsApp Button */}
      {settings.whatsapp && (
        <WhatsAppButton
          phoneNumber={settings.whatsapp}
          businessName={settings.businessName || 'el catálogo'}
        />
      )}

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />

    </div>
  );
}
