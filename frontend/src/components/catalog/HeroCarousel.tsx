'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import {
  ChevronLeft,
  ChevronRight,
  Tag,
  Layers,
  Sparkles,
  ArrowRight,
  Package,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CatalogCategory, CatalogProduct } from '@/lib/api/catalog';

interface HeroCarouselProps {
  categories: CatalogCategory[];
  offers: CatalogProduct[];
  className?: string;
}

type SlideType =
  | { type: 'category'; data: CatalogCategory }
  | { type: 'offer'; data: CatalogProduct };

// Smooth animation variants
const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
    scale: 1.1,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      x: { type: 'spring', stiffness: 300, damping: 30 },
      opacity: { duration: 0.4 },
      scale: { duration: 0.4 },
    },
  },
  exit: (direction: number) => ({
    x: direction < 0 ? '100%' : '-100%',
    opacity: 0,
    scale: 0.95,
    transition: {
      x: { type: 'spring', stiffness: 300, damping: 30 },
      opacity: { duration: 0.3 },
    },
  }),
};

const contentVariants = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export function HeroCarousel({
  categories,
  offers,
  className,
}: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Build slides array: mix categories and offers
  const slides: SlideType[] = [
    ...categories.slice(0, 4).map((cat) => ({ type: 'category' as const, data: cat })),
    ...offers.slice(0, 4).map((offer) => ({ type: 'offer' as const, data: offer })),
  ];

  const nextSlide = useCallback(() => {
    if (slides.length === 0) return;
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = () => {
    if (slides.length === 0) return;
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  // Auto-advance every 6 seconds
  useEffect(() => {
    if (isPaused || slides.length === 0) return;
    const interval = setInterval(nextSlide, 6000);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide, slides.length]);

  if (slides.length === 0) return null;

  const currentSlide = slides[currentIndex];

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-3xl',
        'shadow-2xl shadow-neutral-900/20 dark:shadow-black/40',
        className
      )}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Main Slide */}
      <div className="relative h-[320px] sm:h-[420px] md:h-[480px] lg:h-[540px]">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0"
          >
            {currentSlide.type === 'category' ? (
              <CategorySlide category={currentSlide.data} />
            ) : (
              <OfferSlide product={currentSlide.data} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className={cn(
          'absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-20',
          'w-12 h-12 sm:w-14 sm:h-14 rounded-full',
          'bg-white/10 backdrop-blur-md border border-white/20',
          'flex items-center justify-center text-white',
          'hover:bg-white/20 hover:scale-110',
          'transition-all duration-300',
          'focus:outline-none focus:ring-2 focus:ring-white/50'
        )}
      >
        <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7" />
      </button>
      <button
        onClick={nextSlide}
        className={cn(
          'absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-20',
          'w-12 h-12 sm:w-14 sm:h-14 rounded-full',
          'bg-white/10 backdrop-blur-md border border-white/20',
          'flex items-center justify-center text-white',
          'hover:bg-white/20 hover:scale-110',
          'transition-all duration-300',
          'focus:outline-none focus:ring-2 focus:ring-white/50'
        )}
      >
        <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7" />
      </button>

      {/* Progress Indicators */}
      <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
        {slides.map((slide, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={cn(
              'relative h-2 rounded-full transition-all duration-500 overflow-hidden',
              index === currentIndex ? 'w-10 bg-white' : 'w-2 bg-white/40 hover:bg-white/60'
            )}
          >
            {index === currentIndex && (
              <motion.div
                className="absolute inset-0 bg-white/50"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 6, ease: 'linear' }}
                style={{ transformOrigin: 'left' }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Slide Type Badge */}
      <div className="absolute top-4 sm:top-6 left-4 sm:left-6 z-20">
        <AnimatePresence mode="wait">
          <motion.span
            key={currentSlide.type}
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold',
              'backdrop-blur-md border shadow-lg',
              currentSlide.type === 'category'
                ? 'bg-red-500/80 border-red-400/30 text-white'
                : 'bg-gradient-to-r from-red-500/80 to-orange-500/80 border-red-400/30 text-white'
            )}
          >
            {currentSlide.type === 'category' ? (
              <>
                <Layers className="w-4 h-4" />
                Categoría
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Oferta Especial
              </>
            )}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
}

function CategorySlide({ category }: { category: CatalogCategory }) {
  const hasImage = !!category.image;

  return (
    <Link href={`/categorias/${category.slug}`} className="block h-full group">
      <div className="relative h-full overflow-hidden">
        {/* Background */}
        {hasImage ? (
          <>
            <Image
              src={category.image!}
              alt={category.name}
              fill
              className="object-cover transition-transform duration-[2000ms] ease-out group-hover:scale-110"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/20" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-red-600 via-sky-600 to-orange-600">
            <div className="absolute inset-0 opacity-30">
              <motion.div
                className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/20 rounded-full blur-3xl"
                animate={{
                  x: [100, 150, 100],
                  y: [-100, -50, -100],
                }}
                transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.div
                className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-orange-400/30 rounded-full blur-3xl"
                animate={{
                  x: [-50, 0, -50],
                  y: [50, 0, 50],
                }}
                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              />
            </div>
          </div>
        )}

        {/* Content */}
        <div className="absolute inset-0 flex items-center">
          <div className="px-8 sm:px-12 md:px-16 lg:px-20 max-w-3xl">
            <motion.div
              variants={contentVariants}
              initial="initial"
              animate="animate"
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/90 text-sm mb-6"
            >
              <Package className="w-4 h-4" />
              {category._count?.products || 0} productos disponibles
            </motion.div>

            <motion.h2
              variants={contentVariants}
              initial="initial"
              animate="animate"
              transition={{ delay: 0.2 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-[1.1]"
            >
              {category.name}
            </motion.h2>

            {category.description && (
              <motion.p
                variants={contentVariants}
                initial="initial"
                animate="animate"
                transition={{ delay: 0.3 }}
                className="text-white/80 text-lg sm:text-xl mb-8 line-clamp-2 max-w-xl"
              >
                {category.description}
              </motion.p>
            )}

            <motion.div
              variants={contentVariants}
              initial="initial"
              animate="animate"
              transition={{ delay: 0.4 }}
            >
              <span className="inline-flex items-center gap-3 px-8 py-4 bg-white text-neutral-900 rounded-full font-semibold text-base sm:text-lg hover:bg-slate-100 transition-all duration-300 shadow-xl shadow-black/20 group-hover:shadow-2xl group-hover:gap-4">
                Explorar colección
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </span>
            </motion.div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function OfferSlide({ product }: { product: CatalogProduct }) {
  const mainImage = product.images?.[0]?.url;
  const hasImage = !!mainImage;
  const discount = product.salePrice
    ? Math.round((1 - Number(product.salePrice) / Number(product.price)) * 100)
    : 0;

  return (
    <Link href={`/productos/${product.slug}`} className="block h-full group">
      <div className="relative h-full overflow-hidden">
        {/* Background */}
        {hasImage ? (
          <>
            <Image
              src={mainImage}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-[2000ms] ease-out group-hover:scale-110"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/30" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-red-600 via-orange-500 to-amber-500">
            <div className="absolute inset-0 opacity-30">
              <motion.div
                className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/20 rounded-full blur-3xl"
                animate={{
                  x: [0, 50, 0],
                  y: [0, -30, 0],
                }}
                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>
          </div>
        )}

        {/* Content */}
        <div className="absolute inset-0 flex items-center">
          <div className="px-8 sm:px-12 md:px-16 lg:px-20 max-w-3xl">
            {discount > 0 && (
              <motion.div
                variants={contentVariants}
                initial="initial"
                animate="animate"
                transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-full text-base sm:text-lg font-bold mb-6 shadow-xl shadow-red-500/30"
              >
                <Tag className="w-5 h-5" />
                {discount}% DESCUENTO
              </motion.div>
            )}

            <motion.h2
              variants={contentVariants}
              initial="initial"
              animate="animate"
              transition={{ delay: 0.2 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-[1.1]"
            >
              {product.name}
            </motion.h2>

            <motion.div
              variants={contentVariants}
              initial="initial"
              animate="animate"
              transition={{ delay: 0.3 }}
              className="flex items-baseline gap-4 mb-8"
            >
              {product.salePrice ? (
                <>
                  <span className="text-4xl sm:text-5xl md:text-6xl font-bold text-white">
                    S/ {Number(product.salePrice).toFixed(2)}
                  </span>
                  <span className="text-xl sm:text-2xl line-through text-white/50">
                    S/ {Number(product.price).toFixed(2)}
                  </span>
                </>
              ) : (
                <span className="text-4xl sm:text-5xl md:text-6xl font-bold text-white">
                  S/ {Number(product.price).toFixed(2)}
                </span>
              )}
            </motion.div>

            <motion.div
              variants={contentVariants}
              initial="initial"
              animate="animate"
              transition={{ delay: 0.4 }}
            >
              <span className="inline-flex items-center gap-3 px-8 py-4 bg-white text-neutral-900 rounded-full font-semibold text-base sm:text-lg hover:bg-slate-100 transition-all duration-300 shadow-xl shadow-black/20 group-hover:shadow-2xl group-hover:gap-4">
                Ver oferta
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </span>
            </motion.div>
          </div>
        </div>
      </div>
    </Link>
  );
}
