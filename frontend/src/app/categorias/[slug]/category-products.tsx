'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ChevronRight,
  Home,
  SlidersHorizontal,
  X,
  Grid3X3,
  LayoutGrid,
  ChevronLeft,
  ArrowUpDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProductCard, WhatsAppButton, Footer, SearchBar, MobileBottomNav } from '@/components/catalog';
import type {
  CatalogSettings,
  CatalogCategory,
  CatalogProduct,
  CatalogCategoryFilters,
} from '@/lib/api/catalog';
import { staggerContainer, staggerItem } from '@/lib/animations';

interface CategoryProductsProps {
  category: CatalogCategory & { description?: string | null };
  products: CatalogProduct[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  filters: CatalogCategoryFilters;
  settings: CatalogSettings;
  categories: CatalogCategory[];
  currentSort?: string;
  currentMinPrice?: string;
  currentMaxPrice?: string;
}

const sortOptions = [
  { value: 'newest', label: 'Más recientes' },
  { value: 'price_asc', label: 'Precio: Menor a mayor' },
  { value: 'price_desc', label: 'Precio: Mayor a menor' },
  { value: 'name', label: 'Nombre: A-Z' },
];

export function CategoryProducts({
  category,
  products,
  pagination,
  filters,
  settings,
  categories,
  currentSort,
  currentMinPrice,
  currentMaxPrice,
}: CategoryProductsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'large'>('grid');
  const [minPrice, setMinPrice] = useState(currentMinPrice || '');
  const [maxPrice, setMaxPrice] = useState(currentMaxPrice || '');

  const updateFilters = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    // Reset to page 1 when filters change
    if (!updates.page) {
      params.set('page', '1');
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  const applyPriceFilter = () => {
    updateFilters({
      minPrice: minPrice || undefined,
      maxPrice: maxPrice || undefined,
    });
  };

  const clearFilters = () => {
    setMinPrice('');
    setMaxPrice('');
    router.push(pathname);
  };

  const hasActiveFilters = currentMinPrice || currentMaxPrice || currentSort;

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Header with Category Info */}
      <div className="relative bg-gradient-to-br from-slate-900 via-violet-900/50 to-slate-900 overflow-hidden">
        {/* Background Image */}
        {category.image && (
          <div className="absolute inset-0 opacity-20">
            <Image
              src={category.image}
              alt={category.name}
              fill
              className="object-cover"
            />
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />

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
            <Link href="/categorias" className="text-white/60 hover:text-white transition-colors">
              Categorías
            </Link>
            <ChevronRight className="w-4 h-4 text-white/40" />
            <span className="text-white font-medium">{category.name}</span>
          </motion.nav>

          {/* Category Title */}
          <motion.h1
            className="text-3xl md:text-5xl font-bold text-white mb-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {category.name}
          </motion.h1>

          {/* Description */}
          {category.description && (
            <motion.p
              className="text-white/60 max-w-2xl text-base md:text-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {category.description}
            </motion.p>
          )}

          {/* Product Count */}
          <motion.div
            className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <span className="text-white/80 text-sm">
              {pagination.total} {pagination.total === 1 ? 'producto' : 'productos'}
            </span>
          </motion.div>
        </div>
      </div>

      {/* Search & Filters Bar */}
      <div className="sticky top-0 z-30 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            {/* Search */}
            <div className="flex-1">
              <SearchBar variant="compact" placeholder="Buscar en esta categoría..." />
            </div>

            {/* Filter & Sort */}
            <div className="flex items-center gap-3">
              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  value={currentSort || ''}
                  onChange={(e) => updateFilters({ sort: e.target.value || undefined })}
                  className={cn(
                    'appearance-none px-4 py-2.5 pr-10 rounded-xl',
                    'bg-slate-100 dark:bg-slate-800',
                    'border border-slate-200 dark:border-slate-700',
                    'text-slate-700 dark:text-slate-300 text-sm',
                    'focus:outline-none focus:ring-2 focus:ring-violet-500/50'
                  )}
                >
                  <option value="">Ordenar por</option>
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>

              {/* Filter Button */}
              <motion.button
                onClick={() => setShowFilters(true)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 rounded-xl',
                  'bg-slate-100 dark:bg-slate-800',
                  'border border-slate-200 dark:border-slate-700',
                  'text-slate-700 dark:text-slate-300 text-sm',
                  hasActiveFilters && 'border-violet-500 text-violet-600 dark:text-violet-400'
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filtros
                {hasActiveFilters && (
                  <span className="w-2 h-2 rounded-full bg-violet-500" />
                )}
              </motion.button>

              {/* View Mode */}
              <div className="hidden sm:flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    'p-2 rounded-md transition-colors',
                    viewMode === 'grid'
                      ? 'bg-white dark:bg-slate-700 shadow-sm'
                      : 'text-slate-400 hover:text-slate-600'
                  )}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('large')}
                  className={cn(
                    'p-2 rounded-md transition-colors',
                    viewMode === 'large'
                      ? 'bg-white dark:bg-slate-700 shadow-sm'
                      : 'text-slate-400 hover:text-slate-600'
                  )}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-8">
          {/* Sidebar Categories (Desktop) */}
          <motion.aside
            className="hidden lg:block w-64 flex-shrink-0"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="sticky top-32 space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
                  Categorías
                </h3>
                <ul className="space-y-2">
                  {categories.map((cat) => (
                    <li key={cat.id}>
                      <Link
                        href={`/categorias/${cat.slug}`}
                        className={cn(
                          'block px-4 py-2 rounded-lg text-sm transition-colors',
                          cat.slug === category.slug
                            ? 'bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300 font-medium'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                        )}
                      >
                        {cat.name}
                        <span className="ml-2 text-xs text-slate-400">
                          ({cat._count?.products || 0})
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Price Range */}
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
                  Rango de Precio
                </h3>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg bg-slate-100 dark:bg-slate-800 border-0"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg bg-slate-100 dark:bg-slate-800 border-0"
                    />
                  </div>
                  <button
                    onClick={applyPriceFilter}
                    className="w-full py-2 text-sm font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-700 transition-colors"
                  >
                    Aplicar
                  </button>
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="w-full py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-violet-600 transition-colors"
                    >
                      Limpiar filtros
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.aside>

          {/* Products Grid */}
          <div className="flex-1">
            {products.length > 0 ? (
              <>
                <motion.div
                  className={cn(
                    'grid gap-3 md:gap-4',
                    viewMode === 'grid'
                      ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
                      : 'grid-cols-2 md:grid-cols-2 lg:grid-cols-3'
                  )}
                  variants={staggerContainer}
                  initial="initial"
                  animate="animate"
                >
                  {products.map((product, index) => (
                    <motion.div key={product.id} variants={staggerItem}>
                      <ProductCard product={product} index={index} />
                    </motion.div>
                  ))}
                </motion.div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <motion.div
                    className="flex items-center justify-center gap-2 mt-12"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <button
                      onClick={() => updateFilters({ page: String(pagination.page - 1) })}
                      disabled={pagination.page <= 1}
                      className={cn(
                        'flex items-center gap-1 px-4 py-2 rounded-lg font-medium transition-colors',
                        pagination.page <= 1
                          ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      )}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Anterior
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                        .filter(p => p === 1 || p === pagination.totalPages || Math.abs(p - pagination.page) <= 1)
                        .map((p, idx, arr) => (
                          <span key={p}>
                            {idx > 0 && arr[idx - 1] !== p - 1 && (
                              <span className="px-2 text-slate-400">...</span>
                            )}
                            <button
                              onClick={() => updateFilters({ page: String(p) })}
                              className={cn(
                                'w-10 h-10 rounded-lg font-medium transition-colors',
                                p === pagination.page
                                  ? 'bg-violet-600 text-white'
                                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                              )}
                            >
                              {p}
                            </button>
                          </span>
                        ))}
                    </div>

                    <button
                      onClick={() => updateFilters({ page: String(pagination.page + 1) })}
                      disabled={pagination.page >= pagination.totalPages}
                      className={cn(
                        'flex items-center gap-1 px-4 py-2 rounded-lg font-medium transition-colors',
                        pagination.page >= pagination.totalPages
                          ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      )}
                    >
                      Siguiente
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </motion.div>
                )}
              </>
            ) : (
              <motion.div
                className="text-center py-20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <Grid3X3 className="w-10 h-10 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  No hay productos
                </h3>
                <p className="text-slate-500 dark:text-slate-400 mb-6">
                  No encontramos productos con los filtros seleccionados
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="px-6 py-3 bg-violet-600 text-white rounded-xl font-medium hover:bg-violet-700 transition-colors"
                  >
                    Limpiar filtros
                  </button>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      <AnimatePresence>
        {showFilters && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFilters(false)}
            />
            <motion.div
              className="fixed right-0 top-0 bottom-0 w-80 bg-white dark:bg-slate-900 z-50 lg:hidden shadow-2xl"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
                <h2 className="text-lg font-semibold">Filtros</h2>
                <button onClick={() => setShowFilters(false)}>
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                {/* Categories */}
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">
                    Categorías
                  </h3>
                  <ul className="space-y-2">
                    {categories.map((cat) => (
                      <li key={cat.id}>
                        <Link
                          href={`/categorias/${cat.slug}`}
                          onClick={() => setShowFilters(false)}
                          className={cn(
                            'block px-4 py-2 rounded-lg text-sm transition-colors',
                            cat.slug === category.slug
                              ? 'bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300 font-medium'
                              : 'text-slate-600 dark:text-slate-400'
                          )}
                        >
                          {cat.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Price Range */}
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">
                    Rango de Precio
                  </h3>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        className="w-full px-3 py-2 text-sm rounded-lg bg-slate-100 dark:bg-slate-800 border-0"
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className="w-full px-3 py-2 text-sm rounded-lg bg-slate-100 dark:bg-slate-800 border-0"
                      />
                    </div>
                    <button
                      onClick={() => {
                        applyPriceFilter();
                        setShowFilters(false);
                      }}
                      className="w-full py-3 text-sm font-medium text-white bg-violet-600 rounded-lg"
                    >
                      Aplicar filtros
                    </button>
                    {hasActiveFilters && (
                      <button
                        onClick={() => {
                          clearFilters();
                          setShowFilters(false);
                        }}
                        className="w-full py-2 text-sm text-slate-600 dark:text-slate-400"
                      >
                        Limpiar filtros
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Footer */}
      <Footer settings={settings} categories={categories} />

      {/* WhatsApp Button */}
      {settings.whatsapp && (
        <WhatsAppButton
          phoneNumber={settings.whatsapp}
          businessName={settings.businessName || 'el catálogo'}
        />
      )}

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />

      {/* Spacer para bottom nav en móvil */}
      <div className="h-20 lg:hidden" />
    </div>
  );
}
