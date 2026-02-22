'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { ChevronLeft, ChevronRight, ShoppingBag, Sparkles } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { CatalogProduct } from '@/lib/api/catalog';

interface FeaturedCarouselProps {
  products: CatalogProduct[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
    scale: 0.9,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? '100%' : '-100%',
    opacity: 0,
    scale: 0.9,
  }),
};

export function FeaturedCarousel({
  products,
  autoPlay = true,
  autoPlayInterval = 5000,
}: FeaturedCarouselProps) {
  const [[page, direction], setPage] = useState([0, 0]);
  const [isPaused, setIsPaused] = useState(false);

  const productIndex = ((page % products.length) + products.length) % products.length;
  const currentProduct = products[productIndex];

  const paginate = useCallback((newDirection: number) => {
    setPage([page + newDirection, newDirection]);
  }, [page]);

  const goToSlide = useCallback((index: number) => {
    const newDirection = index > productIndex ? 1 : -1;
    setPage([index, newDirection]);
  }, [productIndex]);

  // Auto-play
  useEffect(() => {
    if (!autoPlay || isPaused || products.length <= 1) return;

    const timer = setInterval(() => {
      paginate(1);
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [autoPlay, isPaused, autoPlayInterval, paginate, products.length]);

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const swipeThreshold = 50;
    if (info.offset.x < -swipeThreshold) {
      paginate(1);
    } else if (info.offset.x > swipeThreshold) {
      paginate(-1);
    }
  };

  if (!products.length) return null;

  const price = Number(currentProduct.price);
  const salePrice = currentProduct.salePrice ? Number(currentProduct.salePrice) : null;
  const discount = salePrice ? Math.round(((price - salePrice) / price) * 100) : 0;
  const mainImage = currentProduct.images?.[0]?.url;

  return (
    <section
      className="relative py-20 overflow-hidden bg-gradient-to-b from-neutral-950 to-neutral-900"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Section Header */}
      <div className="max-w-7xl mx-auto px-6 mb-12">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-4 bg-amber-500/10 rounded-full">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-medium text-amber-400">Destacados</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Productos <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">Destacados</span>
          </h2>
          <p className="text-white/50 max-w-xl mx-auto">
            Descubre nuestra selección especial de productos premium
          </p>
        </motion.div>
      </div>

      {/* Carousel Container */}
      <div className="relative max-w-6xl mx-auto px-6">
        <div className="relative aspect-[16/9] md:aspect-[21/9] rounded-3xl overflow-hidden bg-neutral-800/50 backdrop-blur-sm">
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.div
              key={page}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: 'spring', stiffness: 300, damping: 30 },
                opacity: { duration: 0.3 },
                scale: { duration: 0.4 },
              }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={handleDragEnd}
              className="absolute inset-0 cursor-grab active:cursor-grabbing"
            >
              <Link href={`/productos/${currentProduct.slug}`} className="block h-full">
                <div className="grid md:grid-cols-2 h-full">
                  {/* Image Side */}
                  <div className="relative h-full min-h-[200px] md:min-h-0 bg-gradient-to-br from-neutral-800 to-neutral-900">
                    {mainImage ? (
                      <motion.div
                        className="absolute inset-0"
                        initial={{ scale: 1.2, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <Image
                          src={mainImage}
                          alt={currentProduct.name}
                          fill
                          className="object-cover"
                          priority
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-neutral-900/90 md:block hidden" />
                        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-transparent md:hidden" />
                      </motion.div>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <ShoppingBag className="w-24 h-24 text-neutral-700" />
                      </div>
                    )}

                    {/* Sale Badge */}
                    {salePrice && (
                      <motion.div
                        className="absolute top-4 left-4 md:top-6 md:left-6"
                        initial={{ scale: 0, rotate: -12 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                      >
                        <div className="px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 rounded-full text-white font-bold shadow-lg shadow-red-500/30">
                          -{discount}% OFF
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Content Side */}
                  <div className="relative flex flex-col justify-center p-6 md:p-10 lg:p-16">
                    {/* Category */}
                    <motion.span
                      className="text-red-400 text-sm font-medium uppercase tracking-wider mb-3"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      {currentProduct.category.name}
                    </motion.span>

                    {/* Title */}
                    <motion.h3
                      className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-4 line-clamp-2"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      {currentProduct.name}
                    </motion.h3>

                    {/* Description */}
                    {currentProduct.description && (
                      <motion.p
                        className="text-white/60 mb-6 line-clamp-2 md:line-clamp-3"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        {currentProduct.description}
                      </motion.p>
                    )}

                    {/* Price */}
                    {currentProduct.showPrice && (
                      <motion.div
                        className="flex items-baseline gap-3 mb-6"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                      >
                        {salePrice ? (
                          <>
                            <span className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">
                              S/ {salePrice.toFixed(2)}
                            </span>
                            <span className="text-lg text-white/40 line-through">
                              S/ {price.toFixed(2)}
                            </span>
                          </>
                        ) : (
                          <span className="text-3xl md:text-4xl font-bold text-white">
                            S/ {price.toFixed(2)}
                          </span>
                        )}
                      </motion.div>
                    )}

                    {/* CTA Button */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      <span
                        className={cn(
                          'inline-flex items-center gap-2 px-6 py-3',
                          'bg-white text-neutral-900 rounded-full font-semibold',
                          'hover:bg-red-500 hover:text-white transition-colors duration-300'
                        )}
                      >
                        Ver producto
                        <ChevronRight className="w-4 h-4" />
                      </span>
                    </motion.div>
                  </div>
                </div>
              </Link>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Buttons */}
        <div className="absolute top-1/2 -tranneutral-y-1/2 left-0 right-0 flex justify-between px-2 md:px-0 pointer-events-none">
          <motion.button
            className={cn(
              'pointer-events-auto',
              'w-12 h-12 md:w-14 md:h-14 -ml-6 md:-ml-7',
              'flex items-center justify-center',
              'bg-white/10 backdrop-blur-sm rounded-full',
              'text-white hover:bg-white hover:text-neutral-900',
              'transition-colors duration-300',
              'shadow-lg'
            )}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => paginate(-1)}
          >
            <ChevronLeft className="w-6 h-6" />
          </motion.button>
          <motion.button
            className={cn(
              'pointer-events-auto',
              'w-12 h-12 md:w-14 md:h-14 -mr-6 md:-mr-7',
              'flex items-center justify-center',
              'bg-white/10 backdrop-blur-sm rounded-full',
              'text-white hover:bg-white hover:text-neutral-900',
              'transition-colors duration-300',
              'shadow-lg'
            )}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => paginate(1)}
          >
            <ChevronRight className="w-6 h-6" />
          </motion.button>
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center gap-2 mt-6">
          {products.map((_, index) => (
            <motion.button
              key={index}
              className={cn(
                'h-2 rounded-full transition-all duration-300',
                index === productIndex
                  ? 'w-8 bg-gradient-to-r from-red-500 to-orange-500'
                  : 'w-2 bg-white/20 hover:bg-white/40'
              )}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>
      </div>

      {/* Background Decoration */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-red-600/10 rounded-full blur-[150px] -tranneutral-y-1/2" />
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-orange-600/10 rounded-full blur-[150px] -tranneutral-y-1/2" />
    </section>
  );
}
