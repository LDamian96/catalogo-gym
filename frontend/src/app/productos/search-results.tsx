'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProductCard, WhatsAppButton, Footer, Navbar, MobileBottomNav } from '@/components/catalog';
import { searchCatalog, getCatalogFilters } from '@/lib/api/catalog';
import type {
  CatalogSettings,
  CatalogCategory,
  CatalogProduct,
  CatalogSearchResponse,
  VariantTypeFilter,
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
  const [inputValue, setInputValue] = useState(initialQuery);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Variant filters state
  const [variantFilters, setVariantFilters] = useState<VariantTypeFilter[]>([]);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string[]>>({});
  const [expandedFilters, setExpandedFilters] = useState<Record<string, boolean>>({});

  const currentPage = parseInt(searchParams.get('page') || '1');

  // Load variant filters on mount
  useEffect(() => {
    async function loadFilters() {
      try {
        const filters = await getCatalogFilters();
        setVariantFilters(filters.variantTypes || []);
      } catch (error) {
        console.error('Error loading filters:', error);
      }
    }
    loadFilters();
  }, []);

  // Debounced live search - searches as user types
  const handleLiveSearch = useCallback((value: string) => {
    setInputValue(value);

    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer - wait 400ms before searching
    debounceTimerRef.current = setTimeout(() => {
      setQuery(value);
      handleSearchInternal(value, 1);
    }, 400);
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleSearchInternal = async (searchQuery: string, page = 1, resetFilters = false) => {
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

      // Update URL without full page reload
      window.history.replaceState(null, '', `/productos?${params.toString()}`);

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

  const handleSearch = async (searchQuery: string, page = 1, resetFilters = false) => {
    setInputValue(searchQuery);
    setQuery(searchQuery);
    await handleSearchInternal(searchQuery, page, resetFilters);
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
    setSelectedVariants({});
    handleSearch(query, 1, true);
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
  const hasActiveFilters = selectedCategory || minPrice || maxPrice || (sort && sort !== 'relevance') || hasVariantFilters;

  // Popular search suggestions
  const suggestions = ['Nuevo', 'Oferta', 'Popular', 'Destacado'];

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-[#0a0a0f]">
      {/* Navbar */}
      <Navbar settings={settings} categories={categories} />

      {/* Spacer for fixed navbar */}
      <div className="h-16 lg:h-20" />

      {/* Simple Header with subtle gradient */}
      <div className="relative bg-gradient-to-br from-cyan-50/80 via-white to-sky-50/50 dark:from-cyan-950/30 dark:via-[#0a0a0f] dark:to-blue-950/20 border-b border-neutral-200 dark:border-white/[0.08] overflow-hidden">
        {/* Subtle decorative elements */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_-10%,rgba(34,211,238,0.08),transparent)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_30%_at_10%_100%,rgba(59,130,246,0.06),transparent)] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 lg:px-8 py-4 lg:py-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm mb-4">
            <Link href="/" className="text-neutral-500 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors flex items-center gap-1">
              <Home className="w-4 h-4" />
              Inicio
            </Link>
            <ChevronRight className="w-4 h-4 text-neutral-400" />
            <span className="text-neutral-900 dark:text-white font-medium">Productos</span>
          </nav>

          {/* Title & Search Row */}
          <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-8">
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white">
                {query ? (
                  <>Resultados para "<span className="text-cyan-600 dark:text-cyan-400">{query}</span>"</>
                ) : (
                  'Todos los Productos'
                )}
              </h1>
            </div>

            {/* Search Box */}
            <div className="w-full lg:w-80">
              <div className="relative">
                {isSearching ? (
                  <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-500 animate-spin" />
                ) : (
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                )}
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={inputValue}
                  onChange={(e) => handleLiveSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      if (debounceTimerRef.current) {
                        clearTimeout(debounceTimerRef.current);
                      }
                      handleSearch(inputValue, 1);
                    }
                  }}
                  className="w-full pl-10 pr-10 py-2.5 text-sm bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 outline-none transition-all"
                />
                {inputValue && (
                  <button
                    type="button"
                    onClick={() => {
                      setInputValue('');
                      setQuery('');
                      handleSearchInternal('', 1);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-neutral-200 dark:hover:bg-white/10 rounded-full transition-colors"
                  >
                    <X className="w-3 h-3 text-neutral-400" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-2 mt-4">
            {filterTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => handleFilterChange(tab.value)}
                className={cn(
                  'flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 border',
                  activeFilter === tab.value
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-transparent shadow-lg shadow-cyan-500/25'
                    : 'bg-white/80 dark:bg-white/5 text-neutral-600 dark:text-neutral-300 border-neutral-200/80 dark:border-white/10 hover:border-cyan-300 dark:hover:border-cyan-500/30 hover:shadow-md'
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Filter Bar - Only on mobile */}
      <div className="lg:hidden border-b border-neutral-200 dark:border-white/[0.08] bg-white dark:bg-[#0a0a0f] sticky top-14 z-30">
        <div className="px-4 py-2.5">
          <div className="flex items-center justify-between gap-3">
            {/* Results count */}
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {results && (
                <><span className="font-medium text-neutral-700 dark:text-neutral-200">{results.meta.total}</span> productos</>
              )}
            </p>

            <div className="flex items-center gap-2">
              {/* Sort dropdown mobile */}
              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) => {
                    setSort(e.target.value);
                    handleSearch(query, 1);
                  }}
                  className="appearance-none pl-3 pr-8 py-1.5 rounded-lg bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 text-xs font-medium text-neutral-700 dark:text-neutral-300"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ArrowUpDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-neutral-400 pointer-events-none" />
              </div>

              {/* Filter Button */}
              <button
                onClick={() => setShowFilters(true)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg',
                  'bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 text-xs font-medium',
                  hasActiveFilters && 'ring-2 ring-cyan-500'
                )}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Filtros
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content with Sidebar */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6">
        <div className="flex gap-8">
          {/* Desktop Sidebar - Filters */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24 space-y-6">
              {/* Sidebar Header */}
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-cyan-500" />
                  Filtros
                </h2>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-cyan-600 dark:text-cyan-400 hover:underline"
                  >
                    Limpiar todo
                  </button>
                )}
              </div>

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
                        onClick={() => {
                          setSort(option.value);
                          handleSearch(query, 1);
                        }}
                        className={cn(
                          'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-all duration-200',
                          sort === option.value
                            ? 'bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 font-medium'
                            : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-white/5'
                        )}
                      >
                        {option.label}
                        {sort === option.value && (
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

              {/* Categories - Desktop */}
              <div className="bg-white dark:bg-white/5 rounded-xl border border-neutral-200 dark:border-white/10 p-4">
                <h3 className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-3">
                  Categorías
                </h3>
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  <button
                    onClick={() => {
                      setSelectedCategory('');
                      handleSearch(query, 1);
                    }}
                    className={cn(
                      'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-all duration-200',
                      !selectedCategory
                        ? 'bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 font-medium'
                        : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-white/5'
                    )}
                  >
                    Todas
                    {!selectedCategory && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-500" />
                    )}
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => {
                        setSelectedCategory(category.id);
                        handleSearch(query, 1);
                      }}
                      className={cn(
                        'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-all duration-200',
                        selectedCategory === category.id
                          ? 'bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 font-medium'
                          : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-white/5'
                      )}
                    >
                      {category.name}
                      {category._count?.products !== undefined && (
                        <span className="ml-auto text-xs text-neutral-400">
                          {category._count.products}
                        </span>
                      )}
                      {selectedCategory === category.id && (
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range - Desktop */}
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
                    onClick={() => handleSearch(query, 1)}
                    className="w-full py-2 text-sm font-medium text-cyan-600 dark:text-cyan-400 bg-cyan-100 dark:bg-cyan-500/10 rounded-lg hover:bg-cyan-200 dark:hover:bg-cyan-500/20 transition-colors"
                  >
                    Aplicar precio
                  </button>
                </div>
              </div>

            </div>
          </aside>

          {/* Products Section */}
          <main className="flex-1 min-w-0">
            {/* Active filters indicator - Only show on desktop when filters active */}
            {hasActiveFilters && (
              <motion.div
                className="hidden lg:flex items-center gap-2 mb-4 p-3 bg-cyan-50 dark:bg-cyan-500/10 rounded-xl border border-cyan-200 dark:border-cyan-500/20"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <SlidersHorizontal className="w-4 h-4 text-cyan-500" />
                <span className="text-sm text-cyan-700 dark:text-cyan-300">
                  Filtros activos
                </span>
                <button
                  onClick={clearFilters}
                  className="ml-auto text-xs font-medium text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
                >
                  <X className="w-3 h-3" />
                  Limpiar todo
                </button>
              </motion.div>
            )}

            {/* Loading State */}
            {isSearching && (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 text-cyan-600 animate-spin mx-auto mb-3" />
                  <p className="text-sm text-neutral-500">Buscando productos...</p>
                </div>
              </div>
            )}

            {/* Results Grid */}
            {!isSearching && results && results.products.length > 0 && (
              <>
                <motion.div
                  className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4"
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
                    className="flex items-center justify-center gap-2 mt-10"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage <= 1}
                      className={cn(
                        'flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                        currentPage <= 1
                          ? 'text-neutral-300 dark:text-neutral-600 cursor-not-allowed'
                          : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/5'
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
                              <span className="px-2 text-neutral-400">...</span>
                            )}
                            <button
                              onClick={() => handlePageChange(p)}
                              className={cn(
                                'w-10 h-10 rounded-lg text-sm font-medium transition-colors',
                                p === currentPage
                                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/25'
                                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-white/5'
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
                        'flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                        currentPage >= results.meta.totalPages
                          ? 'text-neutral-300 dark:text-neutral-600 cursor-not-allowed'
                          : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/5'
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
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-cyan-100 dark:bg-cyan-500/10 flex items-center justify-center">
                  <Search className="w-8 h-8 text-cyan-500" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                  No encontramos resultados
                </h3>
                <p className="text-neutral-500 dark:text-neutral-400 mb-6 text-sm">
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
                      className="px-4 py-2 bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 rounded-lg text-sm hover:bg-cyan-200 dark:hover:bg-cyan-500/30 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </main>
        </div>
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
              className="fixed right-0 top-0 bottom-0 w-80 bg-white dark:bg-neutral-900 z-50 shadow-2xl overflow-y-auto"
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
                        onClick={() => setSort(option.value)}
                        className={cn(
                          'w-full px-4 py-2 rounded-lg text-left text-sm transition-colors',
                          sort === option.value
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
                    Categoría
                  </h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => setSelectedCategory('')}
                      className={cn(
                        'w-full px-4 py-2 rounded-lg text-left text-sm transition-colors',
                        !selectedCategory
                          ? 'bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300'
                          : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
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
                            ? 'bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300'
                            : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
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
                      handleSearch(query, 1);
                      setShowFilters(false);
                    }}
                    className="w-full py-3 text-sm font-medium text-white bg-cyan-600 rounded-lg hover:bg-cyan-700"
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
