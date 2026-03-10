'use client';

import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { ArrowRight, Phone, MapPin, Clock, Sparkles, Zap, Tag } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRef, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { v0Ease } from '@/lib/animations';
import type { CatalogSettings, CatalogProduct } from '@/lib/api/catalog';

interface HeroProps {
  settings: CatalogSettings;
  products?: CatalogProduct[];
}

export function Hero({ settings, products = [] }: HeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  // Auto-rotate products
  useEffect(() => {
    if (products.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % products.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [products.length]);

  const currentProduct = products[currentIndex];
  const salePrice = currentProduct?.salePrice ? Number(currentProduct.salePrice) : null;
  const price = currentProduct ? Number(currentProduct.price) : 0;
  const discount = salePrice ? Math.round(((price - salePrice) / price) * 100) : 0;

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex flex-col overflow-hidden bg-gradient-to-br from-cyan-600 via-sky-600 to-blue-600 dark:from-[#0A0A0F] dark:via-[#0A0A0F] dark:to-[#0A0A0F]"
    >
      {/* Animated Background - Colorful */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Large gradient orbs */}
        <motion.div
          className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-cyan-400/40 via-sky-500/30 to-blue-500/20 dark:from-cyan-500/5 dark:via-sky-500/3 dark:to-transparent blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-sky-500/30 via-cyan-400/30 to-blue-400/20 dark:from-sky-500/3 dark:via-cyan-500/3 dark:to-transparent blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            x: [0, -30, 0],
            y: [0, 50, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gradient-to-r from-cyan-500/10 via-transparent to-blue-500/10 dark:from-cyan-500/5 dark:to-blue-500/5 blur-3xl"
          animate={{
            rotate: [0, 360],
          }}
          transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
        />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />

        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 dark:from-white/20 dark:to-white/10"
            style={{
              left: `${15 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 0.8, 0.3],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 4 + i * 0.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.3,
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <motion.div
        className="relative z-10 flex-1 flex items-center justify-center pt-20 pb-12 md:pt-24 md:pb-16"
        style={{ y, opacity }}
      >
        <div className="max-w-6xl mx-auto px-4 md:px-6 w-full">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-20 items-center">

            {/* Left - Text Content */}
            <div className="text-center lg:text-left order-2 lg:order-1">
              {/* Badge - Beast Style */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: v0Ease }}
              >
                <span className="inline-flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-semibold bg-black/30 dark:bg-white/10 text-white rounded-full backdrop-blur-sm">
                  <Zap className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  BEAST NUTRITION
                  <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4" />
                </span>
              </motion.div>

              {/* Title - Bold & Aggressive */}
              <motion.h1
                className="mt-6 md:mt-8 text-4xl sm:text-5xl lg:text-7xl xl:text-8xl font-black tracking-tight"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1, ease: v0Ease }}
              >
                <span className="block text-white drop-shadow-sm">
                  {settings.businessName || 'BEAST'}
                </span>
                <span className="block mt-1 md:mt-2 text-white/90 dark:text-white/60">
                  NUTRITION
                </span>
              </motion.h1>

              {/* Description */}
              <motion.p
                className="mt-4 md:mt-6 text-base md:text-xl text-white/80 dark:text-white/50 max-w-lg mx-auto lg:mx-0 leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: v0Ease }}
              >
                {settings.description || 'Descubre nuestra increíble colección de productos. Calidad premium y los mejores precios.'}
              </motion.p>

              {/* CTAs - Beast Mode */}
              <motion.div
                className="mt-6 md:mt-10 flex flex-col sm:flex-row gap-3 md:gap-4 justify-center lg:justify-start"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3, ease: v0Ease }}
              >
                <motion.a
                  href="#productos"
                  className={cn(
                    'group relative inline-flex items-center justify-center gap-2 md:gap-3',
                    'px-6 py-3 md:px-8 md:py-4 rounded-xl md:rounded-2xl font-bold text-base md:text-lg',
                    'bg-white dark:bg-white',
                    'text-cyan-600 dark:text-neutral-900',
                    'shadow-xl dark:shadow-white/10',
                    'hover:shadow-2xl',
                    'transition-all duration-500'
                  )}
                  whileHover={{ scale: 1.05, backgroundPosition: 'right center' }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span>Ver Suplementos</span>
                  <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </motion.a>

                <motion.a
                  href="/categorias"
                  className={cn(
                    'inline-flex items-center justify-center gap-2',
                    'px-6 py-3 md:px-8 md:py-4 rounded-xl md:rounded-2xl font-bold text-base md:text-lg',
                    'bg-white dark:bg-[#1A1A1F]',
                    'text-neutral-800 dark:text-white',
                    'border-2 border-neutral-200 dark:border-white/10',
                    'shadow-lg hover:shadow-xl',
                    'hover:border-cyan-400 dark:hover:border-white/20',
                    'transition-all duration-300'
                  )}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Zap className="w-4 h-4 md:w-5 md:h-5 text-cyan-500 dark:text-white/60" />
                  Categorías
                </motion.a>
              </motion.div>

              {/* Contact Info - With colors */}
              {(settings.phone || settings.address || settings.businessHours) && (
                <motion.div
                  className="mt-6 md:mt-10 flex flex-wrap gap-2 md:gap-4 justify-center lg:justify-start"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.5, ease: v0Ease }}
                >
                  {settings.phone && (
                    <a
                      href={`tel:${settings.phone}`}
                      className="flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-emerald-100 dark:bg-white/5 text-emerald-700 dark:text-white/60 rounded-full text-xs md:text-sm font-medium hover:bg-emerald-200 dark:hover:bg-white/10 transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5 md:w-4 md:h-4" />
                      <span>{settings.phone}</span>
                    </a>
                  )}
                  {settings.address && (
                    <div className="hidden sm:flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-blue-100 dark:bg-white/5 text-blue-700 dark:text-white/60 rounded-full text-xs md:text-sm font-medium">
                      <MapPin className="w-3.5 h-3.5 md:w-4 md:h-4" />
                      <span className="max-w-[150px] md:max-w-[180px] truncate">{settings.address}</span>
                    </div>
                  )}
                  {settings.businessHours && (
                    <div className="flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-amber-100 dark:bg-white/5 text-amber-700 dark:text-white/60 rounded-full text-xs md:text-sm font-medium">
                      <Clock className="w-3.5 h-3.5 md:w-4 md:h-4" />
                      <span>{settings.businessHours}</span>
                    </div>
                  )}
                </motion.div>
              )}
            </div>

            {/* Right - Product Showcase Card */}
            <motion.div
              className="relative order-1 lg:order-2"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1, ease: v0Ease }}
            >
              <div className="relative aspect-square max-w-[280px] md:max-w-lg mx-auto">
                {/* Beast background shape */}
                <motion.div
                  className="absolute inset-0 rounded-2xl md:rounded-[3rem] bg-gradient-to-br from-cyan-400 via-sky-500 to-blue-600 opacity-30 dark:from-white/5 dark:via-white/3 dark:to-transparent dark:opacity-100 blur-xl md:blur-2xl"
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, 0],
                  }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                />

                {/* Main card with product */}
                <motion.div
                  className="relative bg-white dark:bg-[#1A1A1F] rounded-2xl md:rounded-[2.5rem] p-3 md:p-4 shadow-2xl shadow-cyan-500/20 dark:shadow-black/50 border border-cyan-100 dark:border-white/10 overflow-hidden"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                >
                  {/* Product Image Container */}
                  <div className="relative aspect-square rounded-xl md:rounded-2xl overflow-hidden bg-gradient-to-br from-cyan-50 to-sky-50 dark:from-neutral-900 dark:to-neutral-800">
                    <AnimatePresence mode="wait">
                      {currentProduct?.images?.[0]?.url ? (
                        <motion.div
                          key={currentProduct.id}
                          initial={{ opacity: 0, scale: 1.1 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.5, ease: v0Ease }}
                          className="absolute inset-0"
                        >
                          <Link href={`/productos/${currentProduct.slug}`}>
                            <Image
                              src={currentProduct.images[0].url}
                              alt={currentProduct.name}
                              fill
                              quality={90}
                              className="object-cover hover:scale-105 transition-transform duration-700"
                              priority
                            />
                            {/* Gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                          </Link>
                        </motion.div>
                      ) : settings.logo ? (
                        <Image
                          src={settings.logo}
                          alt={settings.businessName || 'Logo'}
                          fill
                          quality={90}
                          className="object-contain p-8"
                          priority
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-cyan-500 via-sky-600 to-blue-600 dark:from-neutral-800 dark:via-neutral-900 dark:to-black">
                          <span className="text-8xl font-black text-white drop-shadow-lg">
                            🦁
                          </span>
                        </div>
                      )}
                    </AnimatePresence>

                    {/* Product Info Overlay */}
                    {currentProduct && (
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 p-3 md:p-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <Link href={`/productos/${currentProduct.slug}`}>
                          {/* Category */}
                          <span className="inline-block px-2 py-0.5 md:px-3 md:py-1 mb-1.5 md:mb-2 text-[10px] md:text-xs font-bold text-white bg-white/20 backdrop-blur-sm rounded-full">
                            {currentProduct.category?.name}
                          </span>
                          {/* Product Name */}
                          <h3 className="text-sm md:text-lg font-bold text-white line-clamp-1 drop-shadow-lg mb-0.5 md:mb-1">
                            {currentProduct.name}
                          </h3>
                          {/* Price */}
                          {currentProduct.showPrice && (
                            <div className="flex items-center gap-1.5 md:gap-2">
                              <span className="text-base md:text-xl font-black text-white drop-shadow-lg">
                                S/ {salePrice ? salePrice.toFixed(2) : price.toFixed(2)}
                              </span>
                              {salePrice && (
                                <span className="text-xs md:text-sm text-white/70 line-through">
                                  S/ {price.toFixed(2)}
                                </span>
                              )}
                            </div>
                          )}
                        </Link>
                      </motion.div>
                    )}
                  </div>

                  {/* Progress Dots */}
                  {products.length > 1 && (
                    <div className="flex justify-center gap-1.5 md:gap-2 mt-2 md:mt-3">
                      {products.slice(0, 6).map((_, index) => (
                        <motion.button
                          key={index}
                          onClick={() => setCurrentIndex(index)}
                          className={cn(
                            'h-1.5 md:h-2 rounded-full transition-all duration-300',
                            index === currentIndex
                              ? 'w-4 md:w-6 bg-gradient-to-r from-cyan-500 to-blue-600 dark:bg-white'
                              : 'w-1.5 md:w-2 bg-neutral-300 dark:bg-white/20 hover:bg-cyan-400 dark:hover:bg-white/40'
                          )}
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                        />
                      ))}
                    </div>
                  )}

                  {/* Sale Badge */}
                  {salePrice && (
                    <motion.div
                      className="absolute top-1.5 left-1.5 md:top-2 md:left-2 px-2 py-1 md:px-3 md:py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 dark:bg-white text-white dark:text-neutral-900 rounded-lg md:rounded-xl text-xs md:text-sm font-bold shadow-lg shadow-cyan-500/40 dark:shadow-white/20 flex items-center gap-1"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      <Tag className="w-2.5 h-2.5 md:w-3 md:h-3" />
                      -{discount}%
                    </motion.div>
                  )}

                  {/* Beast Badge */}
                  <motion.div
                    className="absolute -top-2 -right-2 md:-top-3 md:-right-3 px-3 py-1.5 md:px-4 md:py-2 bg-gradient-to-r from-cyan-500 to-blue-600 dark:bg-white text-white dark:text-neutral-900 rounded-full text-xs md:text-sm font-bold shadow-lg shadow-cyan-500/40 dark:shadow-white/20"
                    animate={{ rotate: [-5, 5, -5], scale: [1, 1.05, 1] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    💪 BEAST
                  </motion.div>
                </motion.div>

                {/* Floating colored shapes - Hidden on mobile, very subtle in dark mode */}
                <motion.div
                  className="hidden md:block absolute -right-6 top-1/4 w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-400 to-cyan-600 dark:bg-white/5 shadow-xl shadow-cyan-500/50 dark:shadow-none"
                  animate={{ y: [0, -15, 0], rotate: [0, 10, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.div
                  className="hidden md:block absolute -left-4 top-1/3 w-14 h-14 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 dark:bg-white/5 shadow-xl shadow-sky-500/50 dark:shadow-none"
                  animate={{ y: [0, 15, 0], rotate: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                />
                <motion.div
                  className="hidden md:block absolute right-1/4 -bottom-4 w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-500 dark:bg-white/5 shadow-xl shadow-blue-500/50 dark:shadow-none"
                  animate={{ y: [0, 10, 0], rotate: [0, 5, 0] }}
                  transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                />
                <motion.div
                  className="hidden md:block absolute -left-8 bottom-1/4 w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 dark:bg-white/5 shadow-lg shadow-teal-500/50 dark:shadow-none"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.8, 1, 0.8] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Scroll Indicator - Beast Style - Hidden on mobile */}
      <motion.div
        className="hidden md:block absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.6, ease: v0Ease }}
      >
        <motion.a
          href="#productos"
          className="flex flex-col items-center gap-2 px-6 py-3 bg-white/80 dark:bg-[#1A1A1F]/90 backdrop-blur-sm rounded-full shadow-lg border border-cyan-200 dark:border-white/10"
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          whileHover={{ scale: 1.05 }}
        >
          <span className="text-sm font-semibold bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-white dark:to-white/80 bg-clip-text text-transparent">
            Explorar Suplementos
          </span>
          <motion.div
            animate={{ y: [0, 3, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ArrowRight className="w-4 h-4 text-cyan-600 dark:text-white rotate-90" />
          </motion.div>
        </motion.a>
      </motion.div>

      {/* Bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white dark:from-[#000000] to-transparent pointer-events-none" />
    </section>
  );
}
