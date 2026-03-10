'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, Home, Layers, ArrowRight, Search, ShoppingCart, Gift } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Navbar, Footer, WhatsAppButton, MobileBottomNav } from '@/components/catalog';
import type { CatalogSettings, CatalogCategory } from '@/lib/api/catalog';
import { v0Ease } from '@/lib/animations';

// Mobile full-width rectangle card gradients (BETA.pen design)
// Each entry: [gradient classes, shadow color for the card]
const mobileCardStyles = [
  { gradient: 'from-cyan-500/[0.88] via-blue-500/75 to-black/25', shadow: 'shadow-cyan-500/20' },
  { gradient: 'from-violet-500/[0.88] via-indigo-500/75 to-black/25', shadow: 'shadow-violet-500/20' },
  { gradient: 'from-amber-500/[0.88] via-red-500/75 to-black/25', shadow: 'shadow-amber-500/20' },
  { gradient: 'from-emerald-500/[0.88] via-cyan-500/75 to-black/25', shadow: 'shadow-emerald-500/20' },
  { gradient: 'from-pink-500/[0.88] via-rose-500/75 to-black/25', shadow: 'shadow-pink-500/20' },
  { gradient: 'from-sky-500/[0.88] via-blue-600/75 to-black/25', shadow: 'shadow-sky-500/20' },
];

interface CategoriesPageProps {
  categories: CatalogCategory[];
  settings: CatalogSettings;
}

export function CategoriesPage({ categories, settings }: CategoriesPageProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  // Get categories with images for the carousel - memoized
  const categoriesWithImages = useMemo(
    () => categories.filter(cat => cat.image),
    [categories]
  );

  const filteredCategories = useMemo(
    () => searchTerm
      ? categories.filter(cat => cat.name.toLowerCase().includes(searchTerm.toLowerCase()))
      : categories,
    [categories, searchTerm]
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
    <div className="min-h-screen bg-white dark:bg-[#000000]">
      {/* Navbar */}
      <Navbar settings={settings} categories={categories} />

      {/* Mobile Native Header - BETA.pen design */}
      <div className="lg:hidden">
        <div className="relative bg-gradient-to-br from-cyan-500 via-sky-600 to-blue-700 dark:from-cyan-900 dark:via-sky-950 dark:to-blue-950 rounded-b-[26px] shadow-lg shadow-cyan-500/15 overflow-hidden">
          {/* Decorative orbs */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-400/20 rounded-full blur-2xl" />

          <div className="relative px-4 pt-[18px] pb-4 flex flex-col gap-3.5">
            {/* Top row: Brand info + Cart */}
            <motion.div
              className="flex items-center justify-between"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex flex-col gap-0.5">
                <h1 className="text-[20px] font-extrabold text-white leading-tight">
                  {settings.businessName || 'Beast Nutrition'}
                </h1>
                <p className="text-[11px] font-medium text-sky-200">
                  Suplementos deportivos
                </p>
              </div>
              <Link
                href="/carrito"
                className="flex items-center gap-[5px] bg-white/[0.18] rounded-full px-2.5 py-1.5"
              >
                <ShoppingCart className="w-3.5 h-3.5 text-white" />
                <span className="text-[11px] font-bold text-white">3</span>
              </Link>
            </motion.div>

            {/* Search Bar - white semi-transparent */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-600" />
              <input
                type="text"
                placeholder="Buscar categorías..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-[42px] pl-9 pr-4 text-[12px] font-medium bg-white/[0.91] rounded-xl text-slate-800 placeholder:text-slate-500 focus:ring-2 focus:ring-white/40 focus:outline-none transition-all"
              />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Spacer for fixed navbar (desktop only) */}
      <div className="hidden lg:block h-20" />

      {/* Hero with Category Images Carousel (desktop only) */}
      <div className="hidden lg:block relative bg-gradient-to-br from-[#000000] via-cyan-900/50 to-[#000000] overflow-hidden">
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
        <div className="absolute inset-0 bg-gradient-to-t from-[#000000] via-[#000000]/60 to-[#000000]/40" />

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
      <section className="py-6 lg:py-12 pb-24 lg:pb-12 bg-gradient-to-b from-cyan-50/50 via-white to-white dark:from-[#000000] dark:via-[#000000] dark:to-[#000000]">
        <div className="max-w-7xl mx-auto px-0 lg:px-4 sm:px-6 lg:px-8">

          {/* Mobile: Section header (BETA.pen design) */}
          <motion.div
            className="lg:hidden flex items-center justify-between px-4 pt-1"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <h2 className="text-[18px] font-extrabold text-sky-900 dark:text-white">
              Todas las categorías
            </h2>
            <span className="text-[12px] font-medium text-slate-400">
              {filteredCategories.length} {filteredCategories.length === 1 ? 'categoría' : 'categorías'}
            </span>
          </motion.div>

          {/* Mobile: Full-width rectangle cards (BETA.pen design) */}
          <div className="lg:hidden flex flex-col gap-2.5 px-3.5">
            {filteredCategories.map((category, index) => {
              const style = mobileCardStyles[index % mobileCardStyles.length];
              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.07, ease: v0Ease }}
                >
                  <Link
                    href={`/categorias/${category.slug}`}
                    className={cn(
                      'block relative h-[105px] rounded-[20px] overflow-hidden group active:scale-[0.98] transition-transform',
                      'shadow-lg',
                      style.shadow
                    )}
                  >
                    {/* Layer 1: Background image (fills entire card) */}
                    {category.image && (
                      <div className="absolute inset-0">
                        <Image
                          src={category.image}
                          alt={category.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 1024px) 100vw"
                        />
                      </div>
                    )}

                    {/* Layer 2: Colored gradient overlay (left colored, fading to reveal image on right) */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${style.gradient}`} />

                    {/* Layer 3: Text info - positioned top-left */}
                    <div className="absolute left-4 top-5 flex flex-col gap-[3px]">
                      <h3 className="text-[22px] font-black text-white leading-tight line-clamp-1">
                        {category.name}
                      </h3>
                      <span className="text-[12px] font-semibold text-white/[0.82]">
                        {category._count?.products || 0} productos &rarr;
                      </span>
                    </div>
                  </Link>
                </motion.div>
              );
            })}

            {/* Combos Card - Mobile */}
            <motion.div
              key="combos-mobile"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: filteredCategories.length * 0.07, ease: v0Ease }}
            >
              <Link
                href="/combos"
                className={cn(
                  'block relative h-[105px] rounded-[20px] overflow-hidden group active:scale-[0.98] transition-transform',
                  'shadow-lg',
                  'shadow-purple-500/20'
                )}
              >
                {/* Layer 2: Purple→Cyan gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/[0.88] via-violet-500/75 to-cyan-500/25" />

                {/* Gift icon as background decoration */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20">
                  <Gift className="w-16 h-16 text-white" />
                </div>

                {/* Layer 3: Text info */}
                <div className="absolute left-4 top-5 flex flex-col gap-[3px]">
                  <h3 className="text-[22px] font-black text-white leading-tight line-clamp-1">
                    Combos
                  </h3>
                  <span className="text-[12px] font-semibold text-white/[0.82]">
                    Ahorra m&aacute;s &rarr;
                  </span>
                </div>
              </Link>
            </motion.div>
          </div>

          {/* Desktop: Colorful cards (same as landing /inicio) */}
          <div className="hidden lg:block">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredCategories.map((category, index) => {
                const gradients = [
                  'bg-gradient-to-br from-red-400 via-red-500 to-orange-600',
                  'bg-gradient-to-br from-amber-400 via-amber-500 to-indigo-600',
                  'bg-gradient-to-br from-amber-400 via-orange-500 to-red-500',
                  'bg-gradient-to-br from-emerald-400 via-teal-500 to-red-600',
                  'bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600',
                  'bg-gradient-to-br from-pink-400 via-rose-500 to-red-600',
                  'bg-gradient-to-br from-violet-400 via-purple-500 to-indigo-600',
                  'bg-gradient-to-br from-sky-400 via-cyan-500 to-teal-600',
                ];
                return (
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
                      <div className={`absolute inset-0 ${gradients[index % gradients.length]}`} />
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
                          {category._count?.products || 0} productos <ArrowRight className="w-4 h-4" />
                        </motion.span>
                      </div>
                      {/* Corner decoration */}
                      <div className="absolute top-0 right-0 w-12 h-12 overflow-hidden">
                        <div className="absolute -top-6 -right-6 w-12 h-12 bg-white/20 rotate-45" />
                      </div>
                    </Link>
                  </motion.div>
                );
              })}

              {/* Combos Card - Desktop */}
              <motion.div
                key="combos-desktop"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: filteredCategories.length * 0.05, ease: v0Ease }}
                viewport={{ once: true }}
                whileHover={{ y: -8, scale: 1.02 }}
              >
                <Link
                  href="/combos"
                  className="block relative h-36 lg:h-44 rounded-2xl overflow-hidden group shadow-lg hover:shadow-2xl transition-all duration-500"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-violet-500 to-cyan-500" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-20 group-hover:opacity-30 transition-opacity">
                    <Gift className="w-16 h-16 text-white" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="relative h-full p-4 flex flex-col justify-end">
                    <h3 className="text-lg lg:text-xl font-black text-white drop-shadow-lg">
                      Combos
                    </h3>
                    <motion.span
                      className="text-white/90 text-sm mt-1 flex items-center gap-1 font-medium"
                      whileHover={{ x: 5 }}
                    >
                      Ahorra más <ArrowRight className="w-4 h-4" />
                    </motion.span>
                  </div>
                  <div className="absolute top-0 right-0 w-12 h-12 overflow-hidden">
                    <div className="absolute -top-6 -right-6 w-12 h-12 bg-white/20 rotate-45" />
                  </div>
                </Link>
              </motion.div>
            </div>
          </div>

          {/* Empty State */}
          {categories.length === 0 && (
            <motion.div
              className="text-center py-20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-cyan-100 dark:bg-cyan-500/10 flex items-center justify-center">
                <Layers className="w-8 h-8 text-cyan-500" />
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
