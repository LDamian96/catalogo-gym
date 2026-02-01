'use client';

import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { CatalogCategory } from '@/lib/api/catalog';

interface CategorySliderProps {
  categories: CatalogCategory[];
  className?: string;
}

export function CategorySlider({ categories, className }: CategorySliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (!containerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  const scroll = (direction: 'left' | 'right') => {
    if (!containerRef.current) return;
    const scrollAmount = containerRef.current.clientWidth * 0.8;
    containerRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
    setTimeout(checkScroll, 300);
  };

  if (!categories.length) return null;

  return (
    <section className={cn('py-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-4 md:px-6">
        <h2 className="text-xl md:text-2xl font-bold text-neutral-900 dark:text-white">
          Categorías
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className={cn(
              'w-9 h-9 rounded-full flex items-center justify-center transition-all',
              'border border-neutral-200 dark:border-neutral-700',
              canScrollLeft
                ? 'bg-white dark:bg-neutral-800 hover:bg-neutral-50 text-neutral-700 dark:text-neutral-300'
                : 'bg-neutral-100 dark:bg-neutral-800/50 text-neutral-300 dark:text-neutral-600 cursor-not-allowed'
            )}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className={cn(
              'w-9 h-9 rounded-full flex items-center justify-center transition-all',
              'border border-neutral-200 dark:border-neutral-700',
              canScrollRight
                ? 'bg-white dark:bg-neutral-800 hover:bg-neutral-50 text-neutral-700 dark:text-neutral-300'
                : 'bg-neutral-100 dark:bg-neutral-800/50 text-neutral-300 dark:text-neutral-600 cursor-not-allowed'
            )}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Slider */}
      <div className="relative">
        <motion.div
          ref={containerRef}
          onScroll={checkScroll}
          className="flex gap-3 overflow-x-auto scrollbar-hide px-4 md:px-6 pb-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.03, duration: 0.2 }}
            >
              <Link
                href={`/categorias/${category.slug}`}
                className="flex-shrink-0 group"
              >
                <div className={cn(
                  'relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden',
                  'bg-gradient-to-br from-cyan-500 to-blue-600',
                  'transition-transform duration-300 group-hover:scale-105'
                )}>
                  {category.image ? (
                    <>
                      <Image
                        src={category.image}
                        alt={category.name}
                        fill
                        className="object-cover"
                        sizes="128px"
                      />
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
                    </>
                  ) : null}
                  <div className="absolute inset-0 flex items-center justify-center p-2">
                    <span className="text-white text-sm font-semibold text-center leading-tight">
                      {category.name}
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
