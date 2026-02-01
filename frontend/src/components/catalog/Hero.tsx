'use client';

import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { ArrowRight, Phone, MapPin, Clock, Sparkles, Star, Zap, ShoppingBag, Gift, Truck, Shield, Tag } from 'lucide-react';
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
      className="relative min-h-screen flex flex-col overflow-hidden bg-gradient-to-br from-cyan-600 via-blue-700 to-purple-800 dark:from-cyan-900 dark:via-blue-950 dark:to-purple-950"
    >
      {/* Animated Background - Colorful */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Large gradient orbs */}
        <motion.div
          className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-cyan-400/40 via-blue-500/30 to-purple-500/20 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-blue-500/30 via-cyan-400/30 to-teal-400/20 blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            x: [0, -30, 0],
            y: [0, 50, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gradient-to-r from-cyan-500/10 via-transparent to-blue-500/10 blur-3xl"
          animate={{
            rotate: [0, 360],
          }}
          transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
        />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
          style={{
            backgroundImage: `linear-gradient(rgba(34,211,238,1) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />

        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
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
        className="relative z-10 flex-1 flex items-center justify-center pt-24 pb-16"
        style={{ y, opacity }}
      >
        <div className="max-w-6xl mx-auto px-6 w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* Left - Text Content */}
            <div className="text-center lg:text-left order-2 lg:order-1">
              {/* Badge - Colorful */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: v0Ease }}
              >
                <span className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-full shadow-lg shadow-cyan-500/30">
                  <Sparkles className="w-4 h-4" />
                  Catálogo Digital
                  <Zap className="w-4 h-4" />
                </span>
              </motion.div>

              {/* Title - Bold & Colorful */}
              <motion.h1
                className="mt-8 text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tight"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1, ease: v0Ease }}
              >
                <span className="block text-neutral-900 dark:text-white drop-shadow-sm">
                  {settings.businessName || 'Tu Tienda'}
                </span>
                <span className="block mt-2 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 bg-clip-text text-transparent drop-shadow-lg">
                  Online
                </span>
              </motion.h1>

              {/* Description */}
              <motion.p
                className="mt-6 text-lg md:text-xl text-neutral-600 dark:text-neutral-300 max-w-lg mx-auto lg:mx-0 leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: v0Ease }}
              >
                {settings.description || 'Descubre nuestra increíble colección de productos. Calidad premium y los mejores precios.'}
              </motion.p>

              {/* CTAs - Vibrant */}
              <motion.div
                className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3, ease: v0Ease }}
              >
                <motion.a
                  href="#productos"
                  className={cn(
                    'group relative inline-flex items-center justify-center gap-3',
                    'px-8 py-4 rounded-2xl font-bold text-lg',
                    'bg-gradient-to-r from-cyan-500 via-blue-600 to-cyan-500 bg-[length:200%_auto]',
                    'text-white',
                    'shadow-xl shadow-cyan-500/40',
                    'hover:shadow-2xl hover:shadow-cyan-500/50',
                    'transition-all duration-500'
                  )}
                  whileHover={{ scale: 1.05, backgroundPosition: 'right center' }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span>Ver Productos</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </motion.a>

                <motion.a
                  href="/categorias"
                  className={cn(
                    'inline-flex items-center justify-center gap-2',
                    'px-8 py-4 rounded-2xl font-bold text-lg',
                    'bg-white dark:bg-neutral-800',
                    'text-neutral-800 dark:text-white',
                    'border-2 border-neutral-200 dark:border-neutral-700',
                    'shadow-lg hover:shadow-xl',
                    'hover:border-cyan-400 dark:hover:border-cyan-500',
                    'transition-all duration-300'
                  )}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Star className="w-5 h-5 text-amber-500" />
                  Categorías
                </motion.a>
              </motion.div>

              {/* Contact Info - With colors */}
              {(settings.phone || settings.address || settings.businessHours) && (
                <motion.div
                  className="mt-10 flex flex-wrap gap-4 justify-center lg:justify-start"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.5, ease: v0Ease }}
                >
                  {settings.phone && (
                    <a
                      href={`tel:${settings.phone}`}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-full text-sm font-medium hover:bg-emerald-200 dark:hover:bg-emerald-500/30 transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                      <span>{settings.phone}</span>
                    </a>
                  )}
                  {settings.address && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 rounded-full text-sm font-medium">
                      <MapPin className="w-4 h-4" />
                      <span className="max-w-[180px] truncate">{settings.address}</span>
                    </div>
                  )}
                  {settings.businessHours && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 rounded-full text-sm font-medium">
                      <Clock className="w-4 h-4" />
                      <span>{settings.businessHours}</span>
                    </div>
                  )}
                </motion.div>
              )}
            </div>

            {/* Right - Product Showcase Card */}
            <motion.div
              className="relative order-1 lg:order-2"
              initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: v0Ease }}
            >
              <div className="relative aspect-square max-w-lg mx-auto">
                {/* Colorful background shape */}
                <motion.div
                  className="absolute inset-0 rounded-[3rem] bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 opacity-20 dark:opacity-30 blur-2xl"
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, 0],
                  }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                />

                {/* Main card with product */}
                <motion.div
                  className="relative bg-white dark:bg-neutral-900 rounded-[2.5rem] p-4 shadow-2xl shadow-cyan-500/20 dark:shadow-cyan-500/10 border border-cyan-100 dark:border-cyan-500/20 overflow-hidden"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                >
                  {/* Product Image Container */}
                  <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/50 dark:to-blue-950/50">
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
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600">
                          <span className="text-8xl font-black text-white drop-shadow-lg">
                            {(settings.businessName || 'T')[0]}
                          </span>
                        </div>
                      )}
                    </AnimatePresence>

                    {/* Product Info Overlay */}
                    {currentProduct && (
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 p-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <Link href={`/productos/${currentProduct.slug}`}>
                          {/* Category */}
                          <span className="inline-block px-3 py-1 mb-2 text-xs font-bold text-white bg-white/20 backdrop-blur-sm rounded-full">
                            {currentProduct.category?.name}
                          </span>
                          {/* Product Name */}
                          <h3 className="text-lg font-bold text-white line-clamp-1 drop-shadow-lg mb-1">
                            {currentProduct.name}
                          </h3>
                          {/* Price */}
                          {currentProduct.showPrice && (
                            <div className="flex items-center gap-2">
                              <span className="text-xl font-black text-white drop-shadow-lg">
                                S/ {salePrice ? salePrice.toFixed(2) : price.toFixed(2)}
                              </span>
                              {salePrice && (
                                <span className="text-sm text-white/70 line-through">
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
                    <div className="flex justify-center gap-2 mt-3">
                      {products.slice(0, 6).map((_, index) => (
                        <motion.button
                          key={index}
                          onClick={() => setCurrentIndex(index)}
                          className={cn(
                            'h-2 rounded-full transition-all duration-300',
                            index === currentIndex
                              ? 'w-6 bg-gradient-to-r from-cyan-500 to-blue-600'
                              : 'w-2 bg-neutral-300 dark:bg-neutral-700 hover:bg-cyan-400'
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
                      className="absolute top-2 left-2 px-3 py-1.5 bg-gradient-to-r from-rose-500 to-red-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-rose-500/40 flex items-center gap-1"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      <Tag className="w-3 h-3" />
                      -{discount}%
                    </motion.div>
                  )}

                  {/* Premium Badge */}
                  <motion.div
                    className="absolute -top-3 -right-3 px-4 py-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-full text-sm font-bold shadow-lg shadow-orange-500/40"
                    animate={{ rotate: [-5, 5, -5], scale: [1, 1.05, 1] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    ⭐ Premium
                  </motion.div>
                </motion.div>

                {/* Floating colored shapes */}
                <motion.div
                  className="absolute -right-6 top-1/4 w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-400 to-cyan-600 shadow-xl shadow-cyan-500/50"
                  animate={{ y: [0, -15, 0], rotate: [0, 10, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.div
                  className="absolute -left-4 top-1/3 w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-xl shadow-purple-500/50"
                  animate={{ y: [0, 15, 0], rotate: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                />
                <motion.div
                  className="absolute right-1/4 -bottom-4 w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-xl shadow-orange-500/50"
                  animate={{ y: [0, 10, 0], rotate: [0, 5, 0] }}
                  transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                />
                <motion.div
                  className="absolute -left-8 bottom-1/4 w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg shadow-teal-500/50"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.8, 1, 0.8] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Scroll Indicator - Colorful */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.6, ease: v0Ease }}
      >
        <motion.a
          href="#productos"
          className="flex flex-col items-center gap-2 px-6 py-3 bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm rounded-full shadow-lg border border-cyan-200 dark:border-cyan-800"
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          whileHover={{ scale: 1.05 }}
        >
          <span className="text-sm font-semibold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
            Explorar Catálogo
          </span>
          <motion.div
            animate={{ y: [0, 3, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ArrowRight className="w-4 h-4 text-cyan-600 rotate-90" />
          </motion.div>
        </motion.a>
      </motion.div>

      {/* Bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white dark:from-[#0a0a0f] to-transparent pointer-events-none" />
    </section>
  );
}
