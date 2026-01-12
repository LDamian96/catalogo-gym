'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, Home, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Navbar, Footer, WhatsAppButton, MobileBottomNav } from '@/components/catalog';
import type { CatalogSettings, CatalogCategory } from '@/lib/api/catalog';
import { staggerContainer, staggerItem } from '@/lib/animations';

interface CategoriesPageProps {
  categories: CatalogCategory[];
  settings: CatalogSettings;
}

export function CategoriesPage({ categories, settings }: CategoriesPageProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Get categories with images for the carousel - memoized
  const categoriesWithImages = useMemo(
    () => categories.filter(cat => cat.image),
    [categories]
  );

  // Auto-rotate carousel every 3 seconds
  useEffect(() => {
    if (categoriesWithImages.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % categoriesWithImages.length);
    }, 3000);

    return () => clearInterval(timer);
  }, [categoriesWithImages.length]);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Navbar */}
      <Navbar settings={settings} categories={categories} />

      {/* Spacer for fixed navbar */}
      <div className="h-16 md:h-20" />

      {/* Hero with Category Images Carousel */}
      <div className="relative bg-gradient-to-br from-slate-900 via-violet-900/50 to-slate-900 overflow-hidden">
        {/* Background Images Carousel - Auto rotate */}
        <AnimatePresence mode="wait">
          {categoriesWithImages.length > 0 && categoriesWithImages[currentSlide]?.image && (
            <motion.div
              key={currentSlide}
              className="absolute inset-0"
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 0.4, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Image
                src={categoriesWithImages[currentSlide].image}
                alt={categoriesWithImages[currentSlide].name || 'Categoría'}
                fill
                className="object-cover"
                priority
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-slate-900/40" />

        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 py-12 md:py-16">
          {/* Breadcrumb */}
          <motion.nav
            className="flex items-center gap-2 text-sm mb-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Link href="/" className="text-white/60 hover:text-white transition-colors flex items-center gap-1">
              <Home className="w-4 h-4" />
              Inicio
            </Link>
            <ChevronRight className="w-4 h-4 text-white/40" />
            <span className="text-white font-medium">Categorías</span>
          </motion.nav>

          {/* Title */}
          <motion.h1
            className="text-3xl md:text-5xl font-bold text-white mb-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            Categorías
          </motion.h1>

          {/* Description */}
          <motion.p
            className="text-white/60 max-w-2xl text-base md:text-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Explora nuestra variedad de categorías y encuentra lo que buscas
          </motion.p>

          {/* Category Count Badge */}
          <motion.div
            className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <span className="text-white/80 text-sm">
              {categories.length} {categories.length === 1 ? 'categoría disponible' : 'categorías disponibles'}
            </span>
          </motion.div>
        </div>
      </div>

      {/* Categories Grid */}
      <section className="py-6">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {categories.map((category) => (
              <motion.div key={category.id} variants={staggerItem}>
                <Link
                  href={`/categorias/${category.slug}`}
                  className="group block"
                >
                  <div className={cn(
                    'relative aspect-[4/3] rounded-xl overflow-hidden',
                    'bg-gradient-to-br from-violet-500 to-fuchsia-600',
                    'transition-transform duration-300 group-hover:scale-[1.02]',
                    'shadow-md group-hover:shadow-lg'
                  )}>
                    {category.image ? (
                      <>
                        <Image
                          src={category.image}
                          alt={category.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                      </>
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-violet-600 to-fuchsia-600" />
                    )}

                    {/* Content */}
                    <div className="absolute inset-0 flex flex-col justify-end p-3 md:p-4">
                      <h2 className="text-sm md:text-lg font-bold text-white mb-0.5 md:mb-1 line-clamp-1">
                        {category.name}
                      </h2>
                      <div className="flex items-center justify-between">
                        <span className="text-white/70 text-xs md:text-sm">
                          {category._count?.products || 0} productos
                        </span>
                        <ChevronRight className="w-4 h-4 text-white/70 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>

          {/* Empty State */}
          {categories.length === 0 && (
            <motion.div
              className="text-center py-20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <Layers className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                No hay categorías
              </h3>
              <p className="text-slate-500 dark:text-slate-400">
                Aún no se han creado categorías
              </p>
            </motion.div>
          )}
        </div>
      </section>

      {/* Footer */}
      <Footer settings={settings} />

      {/* WhatsApp */}
      {settings.whatsapp && (
        <WhatsAppButton
          phoneNumber={settings.whatsapp}
          businessName={settings.businessName || 'nosotros'}
        />
      )}

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />

      {/* Spacer para bottom nav en móvil */}
      <div className="h-20 lg:hidden" />
    </div>
  );
}
