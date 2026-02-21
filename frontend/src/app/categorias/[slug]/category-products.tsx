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
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProductCard, WhatsAppButton, Footer, SearchBar, MobileBottomNav } from '@/components/catalog';
import type {
  CatalogSettings,
  CatalogCategory,
  CatalogProduct,
  CatalogCategoryFilters,
  VariantTypeFilter,
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
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string[]>>({});
  const [expandedFilters, setExpandedFilters] = useState<Record<string, boolean>>({});

  // Get variant type filters from the filters prop
  const variantFilters: VariantTypeFilter[] = filters.variantTypes || [];

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
    setSelectedVariants({});
    router.push(pathname);
  };

  // Toggle variant value selection
  const handleVariantToggle = (variantTypeId: string, value: string) => {
    setSelectedVariants(prev => {
      const current = prev[variantTypeId] || [];
      const newValues = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];

      return {
        ...prev,
        [variantTypeId]: newValues,
      };
    });
  };

  const hasVariantFilters = Object.values(selectedVariants).some(v => v.length > 0);
  const hasActiveFilters = currentMinPrice || currentMaxPrice || currentSort || hasVariantFilters;

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0f]">
      {/* Header with Category Info */}
      <div className="relative bg-gradient-to-br from-[#0a0a0f] via-cyan-900/50 to-[#0a0a0f] overflow-hidden">
        {/* Background Image */}
        {category.image && (
          <div className="absolute inset-0 opacity-20">
            <Image
              src={category.image}
              alt={category.name}
              fill
              quality={85}
              className="object-cover"
            />
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent" />

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
      <div className="sticky top-0 z-30 bg-white dark:bg-[#0a0a0f] border-b border-neutral-200 dark:border-neutral-800 shadow-sm">
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
                    'bg-neutral-100 dark:bg-neutral-800',
                    'border border-neutral-200 dark:border-neutral-700',
                    'text-neutral-700 dark:text-neutral-300 text-sm',
                    'focus:outline-none focus:ring-2 focus:ring-cyan-500/50'
                  )}
                >
                  <option value="">Ordenar por</option>
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
              </div>

              {/* Filter Button */}
              <motion.button
                onClick={() => setShowFilters(true)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 rounded-xl',
                  'bg-neutral-100 dark:bg-neutral-800',
                  'border border-neutral-200 dark:border-neutral-700',
                  'text-neutral-700 dark:text-neutral-300 text-sm',
                  hasActiveFilters && 'border-cyan-500 text-cyan-600 dark:text-cyan-400'
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filtros
                {hasActiveFilters && (
                  <span className="w-2 h-2 rounded-full bg-cyan-500" />
                )}
              </motion.button>

              {/* View Mode */}
              <div className="hidden sm:flex items-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    'p-2 rounded-md transition-colors',
                    viewMode === 'grid'
                      ? 'bg-white dark:bg-neutral-700 shadow-sm'
                      : 'text-neutral-400 hover:text-neutral-600'
                  )}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('large')}
                  className={cn(
                    'p-2 rounded-md transition-colors',
                    viewMode === 'large'
                      ? 'bg-white dark:bg-neutral-700 shadow-sm'
                      : 'text-neutral-400 hover:text-neutral-600'
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
              {/* Sort & Variant Filters - Desktop */}
              <div className="bg-white dark:bg-white/5 rounded-xl border border-neutral-200 dark:border-white/10 p-4 space-y-4">
                {/* Ordenar por */}
                <div>
                  <h3 className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-3">
                    Ordenar por
                  </h3>
                  <div className="space-y-1">
                    {sortOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => updateFilters({ sort: option.value || undefined })}
                        className={cn(
                          'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-all duration-200',
                          currentSort === option.value
                            ? 'bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 font-medium'
                            : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-white/5'
                        )}
                      >
                        {option.label}
                        {currentSort === option.value && (
                          <div className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-500" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dynamic Variant Filters - Collapsible */}
                {variantFilters.map((variantType) => (
                  <div key={variantType.id} className="border-t border-neutral-200 dark:border-white/10 pt-4">
                    <button
                      onClick={() => setExpandedFilters(prev => ({
                        ...prev,
                        [variantType.id]: !prev[variantType.id]
                      }))}
                      className="w-full flex items-center justify-between text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-3 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        {variantType.name}
                        {selectedVariants[variantType.id]?.length > 0 && (
                          <span className="px-1.5 py-0.5 text-[10px] bg-cyan-100 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 rounded-full normal-case font-medium">
                            {selectedVariants[variantType.id].length}
                          </span>
                        )}
                      </span>
                      <ChevronDown className={cn(
                        'w-4 h-4 transition-transform duration-200',
                        expandedFilters[variantType.id] && 'rotate-180'
                      )} />
                    </button>
                    <AnimatePresence>
                      {expandedFilters[variantType.id] && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="flex flex-wrap gap-2">
                            {variantType.values.map((value) => {
                              const isSelected = selectedVariants[variantType.id]?.includes(value.value);
                              return (
                                <button
                                  key={value.id}
                                  onClick={() => handleVariantToggle(variantType.id, value.value)}
                                  className={cn(
                                    'px-3 py-1.5 rounded-lg text-sm transition-all duration-200 border',
                                    isSelected
                                      ? 'bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border-cyan-300 dark:border-cyan-500/40 font-medium'
                                      : 'text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-white/10 hover:bg-neutral-100 dark:hover:bg-white/5'
                                  )}
                                >
                                  {value.value}
                                </button>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>

              {/* Categories */}
              <div className="bg-white dark:bg-white/5 rounded-xl border border-neutral-200 dark:border-white/10 p-4">
                <h3 className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-3">
                  Categorías
                </h3>
                <ul className="space-y-1 max-h-64 overflow-y-auto">
                  {categories.map((cat) => (
                    <li key={cat.id}>
                      <Link
                        href={`/categorias/${cat.slug}`}
                        className={cn(
                          'block px-3 py-2 rounded-lg text-sm transition-colors',
                          cat.slug === category.slug
                            ? 'bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 font-medium'
                            : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-white/5'
                        )}
                      >
                        {cat.name}
                        <span className="ml-2 text-xs text-neutral-400">
                          ({cat._count?.products || 0})
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Price Range */}
              <div className="bg-white dark:bg-white/5 rounded-xl border border-neutral-200 dark:border-white/10 p-4">
                <h3 className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-3">
                  Rango de Precio
                </h3>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="text-xs text-neutral-500 mb-1 block">Mínimo</label>
                      <input
                        type="number"
                        placeholder="S/ 0"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        className="w-full px-3 py-2 text-sm rounded-lg bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 outline-none transition-all"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-neutral-500 mb-1 block">Máximo</label>
                      <input
                        type="number"
                        placeholder="S/ 999"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className="w-full px-3 py-2 text-sm rounded-lg bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 outline-none transition-all"
                      />
                    </div>
                  </div>
                  <button
                    onClick={applyPriceFilter}
                    className="w-full py-2 text-sm font-medium text-cyan-600 dark:text-cyan-400 bg-cyan-100 dark:bg-cyan-500/10 rounded-lg hover:bg-cyan-200 dark:hover:bg-cyan-500/20 transition-colors"
                  >
                    Aplicar precio
                  </button>
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="w-full py-2 text-xs text-neutral-500 hover:text-cyan-600 transition-colors"
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
                          ? 'text-neutral-300 dark:text-neutral-600 cursor-not-allowed'
                          : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
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
                              <span className="px-2 text-neutral-400">...</span>
                            )}
                            <button
                              onClick={() => updateFilters({ page: String(p) })}
                              className={cn(
                                'w-10 h-10 rounded-lg font-medium transition-colors',
                                p === pagination.page
                                  ? 'bg-cyan-600 text-white'
                                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
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
                          ? 'text-neutral-300 dark:text-neutral-600 cursor-not-allowed'
                          : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
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
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                  <Grid3X3 className="w-10 h-10 text-neutral-400" />
                </div>
                <h3 className="text-xl font-semibold text-[#0a0a0f] dark:text-white mb-2">
                  No hay productos
                </h3>
                <p className="text-slate-500 dark:text-neutral-400 mb-6">
                  No encontramos productos con los filtros seleccionados
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="px-6 py-3 bg-cyan-600 text-white rounded-xl font-medium hover:bg-cyan-700 transition-colors"
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
              className="fixed right-0 top-0 bottom-0 w-80 bg-white dark:bg-[#0a0a0f] z-50 lg:hidden shadow-2xl"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
            >
              <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-800">
                <h2 className="text-lg font-semibold">Filtros</h2>
                <button onClick={() => setShowFilters(false)}>
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                {/* Sort & Variant Filters (Mobile) */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wider">
                    Ordenar por
                  </h3>
                  <div className="space-y-2">
                    {sortOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => updateFilters({ sort: option.value || undefined })}
                        className={cn(
                          'w-full px-4 py-2 rounded-lg text-left text-sm transition-colors',
                          currentSort === option.value
                            ? 'bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300'
                            : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                        )}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>

                  {/* Dynamic Variant Filters - Collapsible */}
                  {variantFilters.map((variantType) => (
                    <div key={variantType.id} className="border-t border-neutral-200 dark:border-neutral-700 pt-4">
                      <button
                        onClick={() => setExpandedFilters(prev => ({
                          ...prev,
                          [`mobile_${variantType.id}`]: !prev[`mobile_${variantType.id}`]
                        }))}
                        className="w-full flex items-center justify-between text-sm font-semibold uppercase tracking-wider mb-3 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          {variantType.name}
                          {selectedVariants[variantType.id]?.length > 0 && (
                            <span className="px-1.5 py-0.5 text-[10px] bg-cyan-100 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 rounded-full normal-case font-medium">
                              {selectedVariants[variantType.id].length}
                            </span>
                          )}
                        </span>
                        <ChevronDown className={cn(
                          'w-4 h-4 transition-transform duration-200',
                          expandedFilters[`mobile_${variantType.id}`] && 'rotate-180'
                        )} />
                      </button>
                      <AnimatePresence>
                        {expandedFilters[`mobile_${variantType.id}`] && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="flex flex-wrap gap-2">
                              {variantType.values.map((value) => {
                                const isSelected = selectedVariants[variantType.id]?.includes(value.value);
                                return (
                                  <button
                                    key={value.id}
                                    onClick={() => handleVariantToggle(variantType.id, value.value)}
                                    className={cn(
                                      'px-3 py-1.5 rounded-lg text-sm transition-colors',
                                      isSelected
                                        ? 'bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 font-medium'
                                        : 'text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800'
                                    )}
                                  >
                                    {value.value}
                                  </button>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>

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
                              ? 'bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 font-medium'
                              : 'text-neutral-600 dark:text-neutral-400'
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
                        className="w-full px-3 py-2 text-sm rounded-lg bg-neutral-100 dark:bg-neutral-800 border-0"
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className="w-full px-3 py-2 text-sm rounded-lg bg-neutral-100 dark:bg-neutral-800 border-0"
                      />
                    </div>
                  </div>
                </div>

                {/* Apply Buttons */}
                <div className="space-y-3 pt-4">
                  <button
                    onClick={() => {
                      applyPriceFilter();
                      setShowFilters(false);
                    }}
                    className="w-full py-3 text-sm font-medium text-white bg-cyan-600 rounded-lg"
                  >
                    Aplicar filtros
                  </button>
                  {hasActiveFilters && (
                    <button
                      onClick={() => {
                        clearFilters();
                        setShowFilters(false);
                      }}
                      className="w-full py-2 text-sm text-neutral-600 dark:text-neutral-400"
                    >
                      Limpiar filtros
                    </button>
                  )}
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

    </div>
  );
}
