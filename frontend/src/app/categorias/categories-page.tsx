'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, Home, Layers, ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Navbar, Footer, WhatsAppButton, MobileBottomNav } from '@/components/catalog';
import type { CatalogSettings, CatalogCategory } from '@/lib/api/catalog';
import { staggerContainer, staggerItem, v0Ease } from '@/lib/animations';

// Gradient colors for category cards (v0 Cyan/Blue palette)
const cardGradients = [
  'from-red-400 to-orange-500',
  'from-sky-400 to-orange-500',
  'from-teal-400 to-red-500',
  'from-orange-400 to-indigo-500',
  'from-red-500 to-sky-500',
  'from-emerald-400 to-teal-500',
  'from-sky-500 to-orange-600',
  'from-red-400 to-orange-600',
];

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
    <div className="min-h-screen bg-white dark:bg-[#0a0a0f]">
      {/* Navbar */}
      <Navbar settings={settings} categories={categories} />

      {/* Spacer for fixed navbar */}
      <div className="h-16 md:h-20" />

      {/* Hero with Category Images Carousel */}
      <div className="relative bg-gradient-to-br from-[#0a0a0f] via-red-900/50 to-[#0a0a0f] overflow-hidden">
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
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/60 to-[#0a0a0f]/40" />

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
      <section className="py-8 lg:py-12 bg-white dark:bg-[#0a0a0f]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {categories.map((category, index) => (
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
                  {/* Gradient background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${cardGradients[index % cardGradients.length]}`} />

                  {/* Image overlay */}
                  {category.image && (
                    <div
                      className="absolute inset-0 bg-cover bg-center opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                      style={{ backgroundImage: `url(${category.image})` }}
                    />
                  )}

                  {/* Content */}
                  <div className="relative h-full p-4 flex flex-col justify-end">
                    <h3 className="text-base lg:text-lg font-bold text-white drop-shadow-md line-clamp-1">
                      {category.name}
                    </h3>
                    <span className="text-white/80 text-xs mt-1 flex items-center gap-1">
                      {category._count?.products || 0} productos
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </span>
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
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-red-100 dark:bg-red-500/10 flex items-center justify-center">
                <Layers className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                No hay categorías
              </h3>
              <p className="text-neutral-500 dark:text-neutral-400 text-sm">
                Aún no se han creado categorías
              </p>
            </motion.div>
          )}
        </div>
      </section>

      {/* Footer */}
      <Footer settings={settings} categories={categories} />

      {/* WhatsApp */}
      {settings.whatsapp && (
        <WhatsAppButton
          phoneNumber={settings.whatsapp}
          businessName={settings.businessName || 'nosotros'}
        />
      )}

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />

    </div>
  );
}
