'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  Home,
  ChevronRight,
  SlidersHorizontal,
  X,
  Loader2,
  Sparkles,
  Tag,
  ChevronLeft,
  ArrowUpDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProductCard, WhatsAppButton, Footer, Navbar, MobileBottomNav } from '@/components/catalog';
import { searchCatalog } from '@/lib/api/catalog';
import type {
  CatalogSettings,
  CatalogCategory,
  CatalogProduct,
  CatalogSearchResponse,
} from '@/lib/api/catalog';
import { staggerContainer, staggerItem } from '@/lib/animations';

interface SearchResultsProps {
  initialQuery: string;
  initialResults: CatalogSearchResponse | null;
  settings: CatalogSettings;
  categories: CatalogCategory[];
  initialFilter?: string;
}

const sortOptions = [
  { value: 'relevance', label: 'Relevancia' },
  { value: 'newest', label: 'Más recientes' },
  { value: 'price_asc', label: 'Precio: Menor a mayor' },
  { value: 'price_desc', label: 'Precio: Mayor a menor' },
  { value: 'name', label: 'Nombre: A-Z' },
];

const filterTabs = [
  { value: '', label: 'Todos', icon: Search },
  { value: 'featured', label: 'Destacados', icon: Sparkles },
  { value: 'sale', label: 'Ofertas', icon: Tag },
];

export function SearchResults({
  initialQuery,
  initialResults,
  settings,
  categories,
  initialFilter,
}: SearchResultsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<CatalogSearchResponse | null>(initialResults);
  const [isSearching, setIsSearching] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('categoryId') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'relevance');
  const [activeFilter, setActiveFilter] = useState(initialFilter || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');

  const currentPage = parseInt(searchParams.get('page') || '1');

  const handleSearch = async (searchQuery: string, page = 1, resetFilters = false) => {
    setIsSearching(true);

    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set('q', searchQuery);
      if (page > 1) params.set('page', String(page));
      if (!resetFilters) {
        if (selectedCategory) params.set('categoryId', selectedCategory);
        if (sort && sort !== 'relevance') params.set('sort', sort);
        if (minPrice) params.set('minPrice', minPrice);
        if (maxPrice) params.set('maxPrice', maxPrice);
        if (activeFilter) params.set('filter', activeFilter);
      }

      router.push(`/productos?${params.toString()}`);

      const data = await searchCatalog({
        q: searchQuery,
        page,
        limit: 12,
        categoryId: resetFilters ? undefined : selectedCategory || undefined,
        sort: resetFilters ? undefined : (sort as any) || undefined,
        minPrice: resetFilters ? undefined : (minPrice ? parseFloat(minPrice) : undefined),
        maxPrice: resetFilters ? undefined : (maxPrice ? parseFloat(maxPrice) : undefined),
      });

      setResults(data);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleFilterChange = (newFilter: string) => {
    setActiveFilter(newFilter);

    const params = new URLSearchParams(searchParams.toString());
    if (newFilter) {
      params.set('filter', newFilter);
    } else {
      params.delete('filter');
    }
    params.set('page', '1');

    router.push(`/productos?${params.toString()}`);
  };

  const handlePageChange = (page: number) => {
    handleSearch(query, page);
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setSort('relevance');
    setMinPrice('');
    setMaxPrice('');
    setActiveFilter('');
    handleSearch(query, 1, true);
  };

  const hasActiveFilters = selectedCategory || minPrice || maxPrice || (sort && sort !== 'relevance');

  // Popular search suggestions
  const suggestions = ['Nuevo', 'Oferta', 'Popular', 'Destacado'];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Navbar */}
      <Navbar settings={settings} categories={categories} />

      {/* Spacer for fixed navbar */}
      <div className="h-16 md:h-20" />

      {/* Header - Compact */}
      <div className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm mb-3">
            <Link href="/" className="text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1">
              <Home className="w-4 h-4" />
              Inicio
            </Link>
            <ChevronRight className="w-4 h-4 text-slate-400" />
            <span className="text-slate-900 dark:text-white font-medium">Productos</span>
          </nav>

          {/* Title & Search Row */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              {query ? (
                <>Resultados para "<span className="text-violet-600">{query}</span>"</>
              ) : (
                'Todos los Productos'
              )}
            </h1>

            {/* Inline Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  defaultValue={query}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const value = (e.target as HTMLInputElement).value;
                      setQuery(value);
                      handleSearch(value, 1);
                    }
                  }}
                  className="w-full pl-10 pr-4 py-2 text-sm bg-slate-100 dark:bg-slate-800 border-0 rounded-lg focus:ring-2 focus:ring-violet-500 outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between gap-4">
            {/* Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto py-4">
              {filterTabs.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => handleFilterChange(tab.value)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
                    activeFilter === tab.value
                      ? 'bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  )}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Sort & Filters */}
            <div className="flex items-center gap-3">
              {/* Sort */}
              <div className="relative hidden sm:block">
                <select
                  value={sort}
                  onChange={(e) => {
                    setSort(e.target.value);
                    handleSearch(query, 1);
                  }}
                  className="appearance-none px-4 py-2 pr-10 rounded-lg bg-slate-100 dark:bg-slate-800 border-0 text-sm"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              </div>

              {/* Filter Button */}
              <button
                onClick={() => setShowFilters(true)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg',
                  'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm',
                  hasActiveFilters && 'ring-2 ring-violet-500'
                )}
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filtros
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Results Count */}
        {results && (
          <motion.div
            className="flex items-center justify-between mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-slate-600 dark:text-slate-400">
              {results.meta.total} {results.meta.total === 1 ? 'resultado' : 'resultados'}
              {query && ` para "${query}"`}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-violet-600 dark:text-violet-400 hover:underline"
              >
                Limpiar filtros
              </button>
            )}
          </motion.div>
        )}

        {/* Loading State */}
        {isSearching && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-violet-600 animate-spin" />
          </div>
        )}

        {/* Results Grid */}
        {!isSearching && results && results.products.length > 0 && (
          <>
            <motion.div
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {results.products.map((product, index) => (
                <motion.div key={product.id} variants={staggerItem}>
                  <ProductCard product={product} index={index} />
                </motion.div>
              ))}
            </motion.div>

            {/* Pagination */}
            {results.meta.totalPages > 1 && (
              <motion.div
                className="flex items-center justify-center gap-2 mt-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className={cn(
                    'flex items-center gap-1 px-4 py-2 rounded-lg font-medium transition-colors',
                    currentPage <= 1
                      ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  )}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Anterior
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: results.meta.totalPages }, (_, i) => i + 1)
                    .filter(p => p === 1 || p === results.meta.totalPages || Math.abs(p - currentPage) <= 1)
                    .map((p, idx, arr) => (
                      <span key={p}>
                        {idx > 0 && arr[idx - 1] !== p - 1 && (
                          <span className="px-2 text-slate-400">...</span>
                        )}
                        <button
                          onClick={() => handlePageChange(p)}
                          className={cn(
                            'w-10 h-10 rounded-lg font-medium transition-colors',
                            p === currentPage
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
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= results.meta.totalPages}
                  className={cn(
                    'flex items-center gap-1 px-4 py-2 rounded-lg font-medium transition-colors',
                    currentPage >= results.meta.totalPages
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
        )}

        {/* No Results */}
        {!isSearching && results && results.products.length === 0 && (
          <motion.div
            className="text-center py-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <Search className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              No encontramos resultados
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">
              Intenta con otras palabras clave o filtros
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => {
                    setQuery(suggestion);
                    handleSearch(suggestion, 1);
                  }}
                  className="px-4 py-2 bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300 rounded-lg text-sm hover:bg-violet-200 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </motion.div>
        )}

      </div>

      {/* Mobile Filters Drawer */}
      <AnimatePresence>
        {showFilters && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFilters(false)}
            />
            <motion.div
              className="fixed right-0 top-0 bottom-0 w-80 bg-white dark:bg-slate-900 z-50 shadow-2xl overflow-y-auto"
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
                {/* Sort (Mobile) */}
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">
                    Ordenar por
                  </h3>
                  <div className="space-y-2">
                    {sortOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setSort(option.value)}
                        className={cn(
                          'w-full px-4 py-2 rounded-lg text-left text-sm transition-colors',
                          sort === option.value
                            ? 'bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                        )}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Categories */}
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">
                    Categoría
                  </h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => setSelectedCategory('')}
                      className={cn(
                        'w-full px-4 py-2 rounded-lg text-left text-sm transition-colors',
                        !selectedCategory
                          ? 'bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      )}
                    >
                      Todas las categorías
                    </button>
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={cn(
                          'w-full px-4 py-2 rounded-lg text-left text-sm transition-colors',
                          selectedCategory === category.id
                            ? 'bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                        )}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
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
                  </div>
                </div>

                {/* Apply Buttons */}
                <div className="space-y-3 pt-4">
                  <button
                    onClick={() => {
                      handleSearch(query, 1);
                      setShowFilters(false);
                    }}
                    className="w-full py-3 text-sm font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-700"
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
