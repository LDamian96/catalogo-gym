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
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ProductCard,
  WhatsAppButton,
  Footer,
  Navbar,
  MobileBottomNav,
} from '@/components/catalog';
import type { CatalogHomeData } from '@/lib/api/catalog';
import { cn } from '@/lib/utils';

interface CatalogLandingProps {
  data: CatalogHomeData;
}

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const fadeInDown = {
  initial: { opacity: 0, y: -60 },
  animate: { opacity: 1, y: 0 },
};

const fadeInLeft = {
  initial: { opacity: 0, x: -60 },
  animate: { opacity: 1, x: 0 },
};

const fadeInRight = {
  initial: { opacity: 0, x: 60 },
  animate: { opacity: 1, x: 0 },
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
};

const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const letterAnimation = {
  initial: { opacity: 0, y: 50 },
  animate: { opacity: 1, y: 0 },
};

// Animated text component
function AnimatedText({ text, className, delay = 0 }: { text: string; className?: string; delay?: number }) {
  return (
    <motion.span className={cn("inline-flex flex-wrap", className)}>
      {text.split(' ').map((word, wordIndex) => (
        <span key={wordIndex} className="inline-block mr-[0.25em]">
          {word.split('').map((char, charIndex) => (
            <motion.span
              key={charIndex}
              className="inline-block"
              initial={{ opacity: 0, y: 50, rotateX: -90 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{
                duration: 0.5,
                delay: delay + (wordIndex * 0.1) + (charIndex * 0.03),
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              {char}
            </motion.span>
          ))}
        </span>
      ))}
    </motion.span>
  );
}

// Animated counter
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
    <div ref={containerRef} className="min-h-screen bg-white dark:bg-slate-950 overflow-hidden">
      {/* Navbar */}
      <Navbar settings={settings} categories={categories} transparent />

      {/* Hero Section */}
      <motion.section
        className="relative min-h-screen flex items-center overflow-hidden"
        style={{ opacity: heroOpacity, scale: heroScale }}
      >
        {/* Modern Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />

        {/* Subtle radial gradient overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />

        {/* Subtle noise texture for depth */}
        <div className="absolute inset-0 opacity-[0.015]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }} />

        {/* Elegant gradient orbs - more subtle */}
        <motion.div
          className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-violet-600/20 rounded-full blur-[150px]"
          animate={{
            y: [0, 30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-32 right-0 w-[500px] h-[500px] bg-indigo-500/15 rounded-full blur-[130px]"
          animate={{
            y: [0, -20, 0],
            scale: [1.1, 1, 1.1],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />

        {/* Main Content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 lg:py-0">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left Content */}
            <motion.div
              className="text-center lg:text-left"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {/* Elegant Badge */}
              {productsOnSale.length > 0 && (
                <motion.div
                  variants={fadeInDown}
                  className="inline-flex items-center gap-2 mb-6"
                >
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                    </span>
                    <span className="text-white/80 text-sm font-medium">Ofertas especiales disponibles</span>
                  </div>
                </motion.div>
              )}

              {/* Modern Title */}
              <motion.h1
                className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.1] mb-6"
                variants={fadeInUp}
              >
                <span className="text-white">Descubre </span>
                <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
                  productos
                </span>
                <motion.span
                  className="block mt-2 text-white"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  increíbles
                </motion.span>
              </motion.h1>

              {/* Description */}
              <motion.p
                className="text-base lg:text-lg text-slate-400 max-w-lg mx-auto lg:mx-0 mb-8"
                variants={fadeInUp}
                transition={{ delay: 0.4 }}
              >
                Explora nuestra colección con las mejores marcas y precios. Entrega rápida a tu puerta.
              </motion.p>

              {/* Clean CTA Buttons */}
              <motion.div
                className="flex flex-col sm:flex-row items-center lg:items-start gap-3"
                variants={fadeInUp}
                transition={{ delay: 0.5 }}
              >
                <Link
                  href="/productos"
                  className="group inline-flex items-center gap-2 px-6 py-3.5 bg-white text-slate-900 rounded-xl font-semibold hover:bg-slate-100 transition-all shadow-lg shadow-white/5"
                >
                  <ShoppingBag className="w-5 h-5" />
                  Ver Catálogo
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href="/categorias"
                  className="inline-flex items-center gap-2 px-6 py-3.5 text-white/80 hover:text-white font-medium transition-colors border border-white/10 rounded-xl hover:bg-white/5 hover:border-white/20"
                >
                  Explorar Categorías
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </motion.div>

              {/* Clean Stats */}
              <motion.div
                className="flex items-center justify-center lg:justify-start gap-6 sm:gap-10 mt-10"
                variants={fadeInUp}
                transition={{ delay: 0.6 }}
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
                    transition={{ delay: 0.8 + index * 0.1 }}
                    className="text-center"
                  >
                    <p className="text-2xl sm:text-3xl font-bold text-white">
                      <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                    </p>
                    <p className="text-xs sm:text-sm text-slate-500">{stat.label}</p>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right Content - Product Showcase */}
            <motion.div
              className="relative hidden lg:block"
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
            >
              {heroProducts.length > 0 && (
                <div className="relative">
                  {/* Glass card background */}
                  <div className="absolute -inset-4 bg-gradient-to-br from-white/5 to-white/[0.02] rounded-[2rem] border border-white/10 backdrop-blur-sm" />

                  {/* Main Product Card */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentSlide}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.5 }}
                      className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-slate-800/50"
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
                            <span className="px-2.5 py-1 bg-white/10 backdrop-blur-sm rounded-lg text-white/90 text-xs font-medium">
                              {heroProducts[currentSlide].brand.name}
                            </span>
                          )}
                          {heroProducts[currentSlide].salePrice && (
                            <span className="px-2.5 py-1 bg-rose-500/90 rounded-lg text-white text-xs font-semibold">
                              Oferta
                            </span>
                          )}
                        </div>
                        <h3 className="text-xl font-bold text-white mb-1.5 line-clamp-1">
                          {heroProducts[currentSlide].name}
                        </h3>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold text-white">
                            {settings.currency} {Number(heroProducts[currentSlide].salePrice || heroProducts[currentSlide].price).toFixed(2)}
                          </span>
                          {heroProducts[currentSlide].salePrice && (
                            <span className="text-sm text-white/50 line-through">
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

        {/* Minimal Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <div className="w-5 h-8 rounded-full border border-white/20 flex items-start justify-center p-1.5">
              <motion.div
                className="w-1 h-1 bg-white/60 rounded-full"
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </div>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Categories Section */}
      {categories.length > 0 && (
        <section className="py-20 lg:py-28 bg-slate-50 dark:bg-slate-900/50 relative overflow-hidden">
          {/* Background decoration */}
          <motion.div
            className="absolute top-0 right-0 w-96 h-96 bg-violet-500/5 rounded-full blur-[100px]"
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 8, repeat: Infinity }}
          />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12"
            >
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-violet-100 dark:bg-violet-500/20 rounded-full text-violet-600 dark:text-violet-400 text-sm font-semibold mb-4"
              >
                <Zap className="w-4 h-4" />
                Categorías
              </motion.div>
              <h2 className="text-3xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-4">
                <AnimatedText text="Explora por Categoría" />
              </h2>
              <motion.p
                className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
              >
                Encuentra exactamente lo que buscas navegando por nuestras categorías
              </motion.p>
            </motion.div>

            <motion.div
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6"
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, margin: "-50px" }}
            >
              {categories.slice(0, 8).map((category, index) => (
                <motion.div
                  key={category.id}
                  variants={scaleIn}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -10 }}
                >
                  <Link
                    href={`/categorias/${category.slug}`}
                    className="group block relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-200 dark:bg-slate-800"
                  >
                    {category.image && (
                      <motion.div className="absolute inset-0">
                        <Image
                          src={category.image}
                          alt={category.name}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      </motion.div>
                    )}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"
                      whileHover={{ opacity: 0.9 }}
                      transition={{ duration: 0.3 }}
                    />
                    <div className="absolute inset-0 flex items-end p-5">
                      <div>
                        <motion.h3
                          className="text-lg font-bold text-white mb-1"
                          layoutId={`category-title-${category.id}`}
                        >
                          {category.name}
                        </motion.h3>
                        <motion.span
                          className="text-sm text-white/70 group-hover:text-white transition-colors flex items-center gap-1"
                          initial={{ x: 0 }}
                          whileHover={{ x: 5 }}
                        >
                          Ver productos
                          <motion.span
                            animate={{ x: [0, 5, 0] }}
                            transition={{ duration: 1, repeat: Infinity }}
                          >
                            <ChevronRight className="w-4 h-4" />
                          </motion.span>
                        </motion.span>
                      </div>
                    </div>

                    {/* Hover overlay effect */}
                    <motion.div
                      className="absolute inset-0 bg-violet-600/0 group-hover:bg-violet-600/20 transition-colors duration-300"
                    />
                  </Link>
                </motion.div>
              ))}
            </motion.div>

            {categories.length > 8 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="text-center mt-10"
              >
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href="/categorias"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
                  >
                    Ver todas las categorías
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </motion.div>
              </motion.div>
            )}
          </div>
        </section>
      )}

      {/* Featured Products Section */}
      {featuredOnly.length > 0 && (
        <section className="py-20 lg:py-28 relative overflow-hidden">
          <motion.div
            className="absolute bottom-0 left-0 w-96 h-96 bg-violet-500/5 rounded-full blur-[100px]"
            animate={{ y: [0, -30, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 10, repeat: Infinity }}
          />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="flex items-end justify-between mb-12"
            >
              <div>
                <motion.div
                  className="flex items-center gap-2 text-violet-600 dark:text-violet-400 mb-2"
                  initial={{ x: -20, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  viewport={{ once: true }}
                >
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  >
                    <Star className="w-5 h-5 fill-current" />
                  </motion.div>
                  <span className="text-sm font-semibold uppercase tracking-wider">Destacados</span>
                </motion.div>
                <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white">
                  Productos Destacados
                </h2>
              </div>
              <motion.div whileHover={{ x: 5 }} className="hidden sm:block">
                <Link
                  href="/productos?destacados=true"
                  className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 font-medium transition-colors"
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
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -8 }}
                >
                  <ProductCard product={product} index={index} />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* Offers Section */}
      {productsOnSale.length > 0 && (
        <section className="py-20 lg:py-28 bg-gradient-to-br from-rose-50 to-orange-50 dark:from-rose-950/20 dark:to-orange-950/20 relative overflow-hidden">
          {/* Animated background shapes */}
          <motion.div
            className="absolute top-20 right-20 w-40 h-40 bg-rose-500/10 rounded-full"
            animate={{
              scale: [1, 1.5, 1],
              rotate: [0, 180, 360],
            }}
            transition={{ duration: 20, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-20 left-20 w-60 h-60 bg-orange-500/10 rounded-full"
            animate={{
              scale: [1.5, 1, 1.5],
              rotate: [360, 180, 0],
            }}
            transition={{ duration: 25, repeat: Infinity }}
          />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="flex items-end justify-between mb-12"
            >
              <div>
                <motion.div
                  className="flex items-center gap-2 text-rose-600 dark:text-rose-400 mb-2"
                  initial={{ x: -20, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  viewport={{ once: true }}
                >
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      rotate: [0, 10, -10, 0],
                    }}
                    transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                  >
                    <Tag className="w-5 h-5" />
                  </motion.div>
                  <span className="text-sm font-semibold uppercase tracking-wider">Ofertas</span>
                  <motion.span
                    className="px-2 py-0.5 bg-rose-500 text-white text-xs font-bold rounded-full"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    HOT
                  </motion.span>
                </motion.div>
                <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white">
                  Aprovecha las Ofertas
                </h2>
              </div>
              <motion.div whileHover={{ x: 5 }} className="hidden sm:block">
                <Link
                  href="/productos?ofertas=true"
                  className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 font-medium transition-colors"
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
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                >
                  <ProductCard product={product} index={index} />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* Brands Section */}
      {brands.length > 0 && (
        <section className="py-16 border-t border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mb-8"
            >
              <motion.div
                className="flex items-center justify-center gap-2 text-slate-500 dark:text-slate-400 mb-4"
                initial={{ y: 20 }}
                whileInView={{ y: 0 }}
                viewport={{ once: true }}
              >
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-medium uppercase tracking-wider">Marcas destacadas</span>
              </motion.div>
            </motion.div>

            <motion.div
              className="flex flex-wrap items-center justify-center gap-6 lg:gap-10"
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              {brands.slice(0, 8).map((brand, index) => (
                <motion.div
                  key={brand.id}
                  variants={scaleIn}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.1, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href={`/productos?marca=${brand.slug}`}
                    className="text-sm lg:text-base font-medium text-slate-400 hover:text-slate-700 dark:hover:text-white transition-all px-4 py-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    {brand.name}
                  </Link>
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

      {/* Spacer */}
      <div className="h-20 lg:hidden" />
    </div>
  );
}
