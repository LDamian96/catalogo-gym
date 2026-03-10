'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Search,
  Home,
  ChevronRight,
  SlidersHorizontal,
  X,
  Loader2,
  Tag,
  ChevronLeft,
  ChevronDown,
  ShoppingBag,
  ArrowLeft,
  ShoppingCart,
  Star,
  Package,
  Truck,
  Bike,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProductCard, WhatsAppButton, Footer, Navbar, MobileBottomNav } from '@/components/catalog';
import { searchCatalog, getCatalogFilters } from '@/lib/api/catalog';
import type {
  CatalogSettings,
  CatalogCategory,
  CatalogProduct,
  CatalogSearchResponse,
  CatalogBrand,
  VariantTypeFilter,
} from '@/lib/api/catalog';
import { staggerContainer, staggerItem } from '@/lib/animations';
import { useCart } from '@/hooks/useCart';

interface SearchResultsProps {
  initialQuery: string;
  initialResults: CatalogSearchResponse | null;
  settings: CatalogSettings;
  categories: CatalogCategory[];
  initialBrandSlug?: string;
}

const sortOptions = [
  { value: 'relevance', label: 'Relevancia' },
  { value: 'newest', label: 'Más recientes' },
  { value: 'price_asc', label: 'Precio: Menor a mayor' },
  { value: 'price_desc', label: 'Precio: Mayor a menor' },
  { value: 'name', label: 'Nombre: A-Z' },
];

export function SearchResults({
  initialQuery,
  initialResults,
  settings,
  categories,
  initialBrandSlug,
}: SearchResultsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<CatalogSearchResponse | null>(initialResults);
  const [isSearching, setIsSearching] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('categoryId') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'relevance');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [inputValue, setInputValue] = useState(initialQuery);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Variant filters state
  const [variantFilters, setVariantFilters] = useState<VariantTypeFilter[]>([]);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string[]>>({});
  const [expandedFilters, setExpandedFilters] = useState<Record<string, boolean>>({ categories: true });
  const [brands, setBrands] = useState<CatalogBrand[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [activeBrandInfo, setActiveBrandInfo] = useState<CatalogBrand | null>(null);

  const currentPage = parseInt(searchParams.get('page') || '1');
  const { openCart, items: cartItems } = useCart();
  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Load variant filters and brands on mount
  useEffect(() => {
    async function loadFilters() {
      try {
        const filters = await getCatalogFilters();
        setVariantFilters(filters.variantTypes || []);
        setBrands(filters.brands || []);

        // If initialBrandSlug is provided, find matching brand and auto-select
        if (initialBrandSlug && filters.brands) {
          const matchedBrand = filters.brands.find(
            (b: CatalogBrand) => b.slug === initialBrandSlug || b.name.toLowerCase() === initialBrandSlug.toLowerCase()
          );
          if (matchedBrand) {
            setSelectedBrand(matchedBrand.id);
            setActiveBrandInfo(matchedBrand);
          }
        }
      } catch (error) {
        console.error('Error loading filters:', error);
      }
    }
    loadFilters();
  }, [initialBrandSlug]);

  // Auto-search when brand is auto-selected from URL
  useEffect(() => {
    if (activeBrandInfo && selectedBrand) {
      handleSearchInternal(query, 1);
    }
  }, [activeBrandInfo]);

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
        if (selectedBrand) params.set('brandId', selectedBrand);
        if (sort && sort !== 'relevance') params.set('sort', sort);
        if (minPrice) params.set('minPrice', minPrice);
        if (maxPrice) params.set('maxPrice', maxPrice);
      }

      // Update URL without full page reload
      window.history.replaceState(null, '', `/productos?${params.toString()}`);

      const data = await searchCatalog({
        q: searchQuery,
        page,
        limit: 12,
        categoryId: resetFilters ? undefined : selectedCategory || undefined,
        brandId: resetFilters ? undefined : selectedBrand || undefined,
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

  const handlePageChange = (page: number) => {
    handleSearch(query, page);
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedBrand('');
    setSort('relevance');
    setMinPrice('');
    setMaxPrice('');
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
    // Trigger search after state update
    setTimeout(() => handleSearchInternal(query, 1), 50);
  };

  const hasVariantFilters = Object.values(selectedVariants).some(v => v.length > 0);
  const hasActiveFilters = selectedCategory || selectedBrand || minPrice || maxPrice || (sort && sort !== 'relevance') || hasVariantFilters;

  // Popular search suggestions
  const suggestions = ['Nuevo', 'Oferta', 'Popular', 'Destacado'];

  return (
    <div className={cn(
      "min-h-screen pb-24 lg:pb-0 dark:bg-[#000000] dark:lg:from-[#000000] dark:lg:via-[#000000] dark:lg:to-[#000000]",
      "bg-gradient-to-b from-[#EFF9FF] via-[#DBEAFE] to-[#E0F2FE] lg:bg-white lg:bg-none lg:bg-gradient-to-b lg:from-sky-50 lg:via-cyan-50/20 lg:to-white"
    )}>
      {/* Navbar - desktop only (Navbar itself is hidden lg:block) */}
      <Navbar settings={settings} categories={categories} />

      {/* Mobile Hero Header - BETA.pen Screen 05 style */}
      <motion.div
        className="lg:hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="bg-gradient-to-br from-[#06B6D4] via-[#0284C7] to-[#1D4ED8] rounded-b-[26px] shadow-[0_8px_24px_#0EA5E926] px-4 pt-[18px] pb-4 flex flex-col gap-3.5">
          {/* Top row: Title + Cart */}
          <div className="flex items-center justify-between">
            {activeBrandInfo ? (
              <button
                onClick={() => router.back()}
                className="flex items-center gap-1.5 text-white/90"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-[13px] font-medium">Marcas</span>
              </button>
            ) : (
              <h1 className="text-[20px] font-extrabold text-white" style={{ fontFamily: 'var(--font-heading, Plus Jakarta Sans, sans-serif)' }}>
                Buscar productos
              </h1>
            )}
            <button
              onClick={openCart}
              className="relative flex items-center justify-center w-9 h-9 bg-white/[0.18] rounded-full"
            >
              <ShoppingCart className="w-[18px] h-[18px] text-white" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 flex items-center justify-center text-[10px] font-semibold rounded-full bg-white text-[#0891B2]">
                  {cartItemCount > 9 ? '9+' : cartItemCount}
                </span>
              )}
            </button>
          </div>

          {/* Brand info when brand active */}
          {activeBrandInfo && (
            <div className="flex items-center gap-3">
              {activeBrandInfo.logo && (
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center p-1.5 overflow-hidden">
                  <Image
                    src={activeBrandInfo.logo}
                    alt={activeBrandInfo.name}
                    width={40}
                    height={40}
                    className="object-contain"
                  />
                </div>
              )}
              <div>
                <h1 className="text-[26px] font-extrabold text-white leading-tight" style={{ fontFamily: 'var(--font-heading, Plus Jakarta Sans, sans-serif)' }}>
                  {activeBrandInfo.name}
                </h1>
                <p className="text-[13px] font-medium text-sky-200">
                  Productos oficiales de la marca
                </p>
              </div>
            </div>
          )}

          {/* Search Bar - BETA.pen style */}
          <div className="relative">
            {isSearching ? (
              <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8] animate-spin" />
            ) : (
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
            )}
            <input
              type="text"
              placeholder={activeBrandInfo ? `Buscar en ${activeBrandInfo.name}...` : "Buscar productos..."}
              value={inputValue}
              onChange={(e) => handleLiveSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
                  handleSearch(inputValue, 1);
                }
              }}
              className="w-full pl-10 pr-10 py-2.5 text-[14px] bg-white/[0.91] rounded-xl text-[#0F172A] placeholder:text-[#94A3B8] focus:ring-2 focus:ring-white/30 outline-none font-medium"
            />
            {inputValue && (
              <button
                type="button"
                onClick={() => { setInputValue(''); setQuery(''); handleSearchInternal('', 1); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full bg-[#E2E8F0] hover:bg-neutral-300/60"
              >
                <X className="w-3 h-3 text-[#64748B]" />
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Mobile Category Circles - Horizontal scroll (60x60) - Hidden when brand is active */}
      {categories.length > 0 && !activeBrandInfo && (
        <motion.div
          className="lg:hidden"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
        >
          <div className="px-3.5 py-2 pt-3">
            <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-1">
              {/* All categories option */}
              <button
                onClick={() => {
                  setSelectedCategory('');
                  handleSearch(query, 1);
                }}
                className="flex flex-col items-center gap-1.5 flex-shrink-0"
              >
                <div className={cn(
                  'w-[60px] h-[60px] rounded-full flex items-center justify-center transition-all duration-300 border-2',
                  !selectedCategory
                    ? 'bg-gradient-to-br from-cyan-500 to-blue-500 border-cyan-400 shadow-lg shadow-cyan-500/30'
                    : 'bg-neutral-100 dark:bg-white/10 border-transparent'
                )}>
                  <Search className={cn(
                    'w-5 h-5',
                    !selectedCategory ? 'text-white' : 'text-neutral-400 dark:text-neutral-500'
                  )} />
                </div>
                <span className={cn(
                  'text-[11px] font-medium text-center leading-tight w-16 truncate',
                  !selectedCategory
                    ? 'text-cyan-600 dark:text-cyan-400'
                    : 'text-neutral-500 dark:text-neutral-400'
                )}>
                  Todos
                </span>
              </button>
              {categories.map((category, index) => (
                <motion.button
                  key={category.id}
                  onClick={() => {
                    setSelectedCategory(category.id);
                    handleSearch(query, 1);
                  }}
                  className="flex flex-col items-center gap-1.5 flex-shrink-0"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <div className={cn(
                    'w-[60px] h-[60px] rounded-full overflow-hidden flex items-center justify-center transition-all duration-300 border-2',
                    selectedCategory === category.id
                      ? 'border-cyan-400 shadow-lg shadow-cyan-500/30 ring-2 ring-cyan-400/30'
                      : 'border-transparent'
                  )}>
                    {category.image ? (
                      <Image
                        src={category.image}
                        alt={category.name}
                        width={60}
                        height={60}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className={cn(
                        'w-full h-full flex items-center justify-center text-white font-bold text-base',
                        index % 4 === 0 ? 'bg-gradient-to-br from-cyan-400 to-blue-500' :
                        index % 4 === 1 ? 'bg-gradient-to-br from-purple-400 to-indigo-500' :
                        index % 4 === 2 ? 'bg-gradient-to-br from-orange-400 to-red-500' :
                        'bg-gradient-to-br from-emerald-400 to-teal-500'
                      )}>
                        {category.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <span className={cn(
                    'text-[11px] font-medium text-center leading-tight w-16 truncate',
                    selectedCategory === category.id
                      ? 'text-cyan-600 dark:text-cyan-400'
                      : 'text-neutral-500 dark:text-neutral-400'
                  )}>
                    {category.name}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Mobile Brand Filter Chips - Horizontal scroll - Hidden when brand active */}
      {brands.length > 0 && !activeBrandInfo && (
        <motion.div
          className="lg:hidden"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <div className="px-3.5 py-2">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-0.5">
              <motion.button
                onClick={() => {
                  setSelectedBrand('');
                  handleSearch(query, 1);
                }}
                className={cn(
                  'flex-shrink-0 px-3.5 py-1.5 rounded-full text-[12px] font-semibold transition-all duration-300 border',
                  !selectedBrand
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-transparent shadow-md shadow-cyan-500/20'
                    : 'bg-neutral-100 dark:bg-white/5 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-white/10'
                )}
                whileTap={{ scale: 0.95 }}
              >
                Todas
              </motion.button>
              {brands.map((brand, index) => (
                <motion.button
                  key={brand.id}
                  onClick={() => {
                    setSelectedBrand(brand.id);
                    handleSearch(query, 1);
                  }}
                  className={cn(
                    'flex-shrink-0 px-3.5 py-1.5 rounded-full text-[12px] font-semibold transition-all duration-300 border whitespace-nowrap',
                    selectedBrand === brand.id
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-transparent shadow-md shadow-cyan-500/20'
                      : 'bg-neutral-100 dark:bg-white/5 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-white/10'
                  )}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25, delay: index * 0.04 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {brand.name}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Spacer for fixed navbar - Desktop only */}
      <div className="hidden lg:block h-20" />

      {/* Hero Header with gradient - Desktop only */}
      <motion.div
        className="hidden lg:block relative overflow-hidden border-b border-neutral-200 dark:border-white/[0.08]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-50/80 via-sky-50/40 to-purple-50/30 dark:from-cyan-950/30 dark:via-[#000000] dark:to-blue-950/20" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_-10%,rgba(34,211,238,0.1),transparent)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_30%_at_10%_100%,rgba(139,92,246,0.06),transparent)] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-8 py-7">
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
          <div className="flex items-start justify-between gap-8">
            <div className="flex-1">
              <motion.h1
                className="text-[30px] font-extrabold"
                style={{ fontFamily: 'var(--font-heading, Plus Jakarta Sans, sans-serif)' }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.4 }}
              >
                {query ? (
                  <span className="text-neutral-900 dark:text-white">Resultados para &ldquo;<span className="bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 bg-clip-text text-transparent">{query}</span>&rdquo;</span>
                ) : (
                  <span className="bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-700 dark:from-cyan-400 dark:via-sky-400 dark:to-blue-400 bg-clip-text text-transparent">
                    Todos los Productos
                  </span>
                )}
              </motion.h1>
              <motion.p
                className="text-[15px] text-neutral-500 dark:text-neutral-400 mt-1.5"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.4 }}
              >
                Explora nuestro catálogo completo de suplementos
              </motion.p>
            </div>

            {/* Right Column: Search + Shipping */}
            <motion.div
              className="flex flex-col items-end gap-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              {/* Search Box */}
              <div className="relative w-80">
                {isSearching ? (
                  <Loader2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-cyan-500 animate-spin" />
                ) : (
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-neutral-400" />
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
                  className="w-full pl-11 pr-10 py-2.5 text-sm bg-white dark:bg-white/5 border border-neutral-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 outline-none transition-all shadow-sm"
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

              {/* Shipping Badges - below search */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2.5 px-4 py-2.5 bg-gradient-to-r from-sky-50 to-cyan-50 dark:from-sky-500/10 dark:to-cyan-500/10 rounded-xl border border-sky-200/60 dark:border-sky-500/20 shadow-sm">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-cyan-600 flex items-center justify-center shadow-md shadow-sky-500/30">
                    <Truck className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-[13px] font-bold text-sky-700 dark:text-sky-300">Envío todo Perú</span>
                </div>
                <div className="flex items-center gap-2.5 px-4 py-2.5 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-500/10 dark:to-orange-500/10 rounded-xl border border-amber-200/60 dark:border-amber-500/20 shadow-sm">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-md shadow-amber-500/30">
                    <Bike className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-[13px] font-bold text-amber-700 dark:text-amber-300">Pago contra entrega</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Stats Badges */}
          <motion.div
            className="flex items-center gap-3 mt-5"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.4 }}
          >
            {results && (
              <div className="flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-500/10 dark:to-purple-500/10 rounded-xl border border-violet-200/60 dark:border-violet-500/20 shadow-sm">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md shadow-violet-500/30">
                  <Package className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-sm font-extrabold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">{results.meta.total}</span>
                <span className="text-xs font-medium text-violet-500/80">productos</span>
              </div>
            )}
            {categories.length > 0 && (
              <div className="flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-500/10 dark:to-emerald-500/10 rounded-xl border border-teal-200/60 dark:border-teal-500/20 shadow-sm">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-md shadow-teal-500/30">
                  <Tag className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-sm font-extrabold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">{categories.length}</span>
                <span className="text-xs font-medium text-teal-500/80">categorías</span>
              </div>
            )}
            {brands.length > 0 && (
              <div className="flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-500/10 dark:to-rose-500/10 rounded-xl border border-pink-200/60 dark:border-pink-500/20 shadow-sm">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-md shadow-pink-500/30">
                  <Star className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-sm font-extrabold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">{brands.length}</span>
                <span className="text-xs font-medium text-pink-500/80">marcas</span>
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>

      {/* Mobile Results Header Bar - "X resultados" + "Relevancia" dropdown */}
      <div className="lg:hidden pt-1">
        <div className="px-3.5 py-2">
          <div className="flex items-center justify-between">
            {/* Results count */}
            <p className="text-[13px] text-neutral-500 dark:text-neutral-400">
              {results && (
                <><span className="font-semibold text-neutral-800 dark:text-neutral-200">{results.meta.total}</span> resultados</>
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
                  className="appearance-none pl-3 pr-7 py-1.5 rounded-lg bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 text-[12px] font-medium text-neutral-600 dark:text-neutral-300"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-neutral-400 pointer-events-none" />
              </div>

              {/* Filter Button */}
              <button
                onClick={() => setShowFilters(true)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg',
                  'bg-neutral-50 dark:bg-white/5 text-neutral-600 dark:text-neutral-300 text-[12px] font-medium border border-neutral-200 dark:border-white/10',
                  hasActiveFilters && 'ring-2 ring-cyan-500 border-cyan-400'
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
      <div className="px-0 lg:px-8 py-0 lg:py-6">
        <div className="flex gap-7">
          {/* Desktop Sidebar - Filters */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24 space-y-4">
              {/* Sidebar Header */}
              <div className="flex items-center justify-between bg-gradient-to-r from-cyan-100 to-sky-100 dark:from-cyan-900/40 dark:to-sky-900/30 rounded-xl px-4 py-3 border border-cyan-200/60 dark:border-cyan-800/40">
                <h2 className="text-sm font-semibold text-cyan-700 dark:text-cyan-300 flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4" />
                  Filtros
                </h2>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-cyan-600 dark:text-cyan-400 hover:underline font-medium"
                  >
                    Limpiar
                  </button>
                )}
              </div>

              {/* Categories - Collapsible */}
              <div className="bg-gradient-to-br from-cyan-50 to-sky-50 dark:from-cyan-950/40 dark:to-blue-950/30 rounded-xl border border-cyan-100 dark:border-cyan-900/50 overflow-hidden">
                <button
                  onClick={() => setExpandedFilters(prev => ({ ...prev, categories: !prev.categories }))}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-cyan-100/50 dark:hover:bg-cyan-900/20 transition-colors"
                >
                  <span className="text-xs font-bold text-cyan-800 dark:text-cyan-300 uppercase tracking-wider flex items-center gap-2">
                    <Tag className="w-3.5 h-3.5" />
                    Categorías
                  </span>
                  <ChevronDown className={cn(
                    'w-4 h-4 text-cyan-500 transition-transform duration-200',
                    expandedFilters.categories && 'rotate-180'
                  )} />
                </button>
                <AnimatePresence initial={false}>
                  {expandedFilters.categories && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-3 pb-3 space-y-1 max-h-64 overflow-y-auto">
                        <button
                          onClick={() => {
                            setSelectedCategory('');
                            handleSearch(query, 1);
                          }}
                          className={cn(
                            'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-all duration-200',
                            !selectedCategory
                              ? 'bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 font-semibold border border-cyan-300 dark:border-cyan-700'
                              : 'text-cyan-800 dark:text-cyan-300 hover:bg-cyan-50 dark:hover:bg-cyan-900/30'
                          )}
                        >
                          Todas
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
                                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold shadow-md shadow-cyan-500/20'
                                : 'text-cyan-800 dark:text-cyan-300 hover:bg-cyan-100 dark:hover:bg-cyan-900/30'
                            )}
                          >
                            {category.name}
                            {category._count?.products !== undefined && (
                              <span className={cn(
                                'ml-auto text-xs',
                                selectedCategory === category.id ? 'text-white/70' : 'text-cyan-400 dark:text-cyan-600'
                              )}>
                                {category._count.products}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Brands - Collapsible (only if brands exist and enabled in settings) */}
              {brands.length > 0 && settings.brandsFilterEnabled !== false && (
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/30 rounded-xl border border-amber-100 dark:border-amber-900/50 overflow-hidden">
                  <button
                    onClick={() => setExpandedFilters(prev => ({ ...prev, brands: !prev.brands }))}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-amber-100/50 dark:hover:bg-amber-900/20 transition-colors"
                  >
                    <span className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider flex items-center gap-2">
                      <Star className="w-3.5 h-3.5" />
                      Marcas
                    </span>
                    <ChevronDown className={cn(
                      'w-4 h-4 text-amber-500 transition-transform duration-200',
                      expandedFilters.brands && 'rotate-180'
                    )} />
                  </button>
                  <AnimatePresence initial={false}>
                    {expandedFilters.brands && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-3 pb-3 space-y-1 max-h-64 overflow-y-auto">
                          <button
                            onClick={() => {
                              setSelectedBrand('');
                              handleSearch(query, 1);
                            }}
                            className={cn(
                              'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-all duration-200',
                              !selectedBrand
                                ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 font-semibold border border-amber-300 dark:border-amber-700'
                                : 'text-amber-800 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/30'
                            )}
                          >
                            Todas
                          </button>
                          {brands.map((brand) => (
                            <button
                              key={brand.id}
                              onClick={() => {
                                setSelectedBrand(brand.id);
                                handleSearch(query, 1);
                              }}
                              className={cn(
                                'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-all duration-200',
                                selectedBrand === brand.id
                                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold shadow-md shadow-amber-500/20'
                                  : 'text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/30'
                              )}
                            >
                              {brand.name}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Dynamic Variant Filters - Collapsible */}
              {variantFilters.map((variantType, idx) => {
                const colors = [
                  { from: 'from-emerald-50', to: 'to-teal-50', darkFrom: 'dark:from-emerald-950/40', darkTo: 'dark:to-teal-950/30', border: 'border-emerald-100 dark:border-emerald-900/50', text: 'text-emerald-800 dark:text-emerald-300', icon: 'text-emerald-500', hoverBg: 'hover:bg-emerald-100 dark:hover:bg-emerald-900/30', activeBg: 'from-emerald-500 to-teal-500', activeShadow: 'shadow-emerald-500/20', chipActive: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-transparent shadow-md shadow-emerald-500/20', chipInactive: 'text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/30' },
                  { from: 'from-purple-50', to: 'to-violet-50', darkFrom: 'dark:from-purple-950/40', darkTo: 'dark:to-violet-950/30', border: 'border-purple-100 dark:border-purple-900/50', text: 'text-purple-800 dark:text-purple-300', icon: 'text-purple-500', hoverBg: 'hover:bg-purple-100 dark:hover:bg-purple-900/30', activeBg: 'from-purple-500 to-violet-500', activeShadow: 'shadow-purple-500/20', chipActive: 'bg-gradient-to-r from-purple-500 to-violet-500 text-white border-transparent shadow-md shadow-purple-500/20', chipInactive: 'text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/30' },
                  { from: 'from-amber-50', to: 'to-orange-50', darkFrom: 'dark:from-amber-950/40', darkTo: 'dark:to-orange-950/30', border: 'border-amber-100 dark:border-amber-900/50', text: 'text-amber-800 dark:text-amber-300', icon: 'text-amber-500', hoverBg: 'hover:bg-amber-100 dark:hover:bg-amber-900/30', activeBg: 'from-amber-500 to-orange-500', activeShadow: 'shadow-amber-500/20', chipActive: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-transparent shadow-md shadow-amber-500/20', chipInactive: 'text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/30' },
                ];
                const c = colors[idx % colors.length];
                return (
                  <div key={variantType.id} className={cn('rounded-xl border overflow-hidden bg-gradient-to-br', c.from, c.to, c.darkFrom, c.darkTo, c.border)}>
                    <button
                      onClick={() => setExpandedFilters(prev => ({
                        ...prev,
                        [variantType.id]: !prev[variantType.id]
                      }))}
                      className={cn('w-full flex items-center justify-between px-4 py-3 transition-colors', c.hoverBg)}
                    >
                      <span className={cn('text-xs font-bold uppercase tracking-wider flex items-center gap-2', c.text)}>
                        {variantType.name}
                        {selectedVariants[variantType.id]?.length > 0 && (
                          <span className="px-1.5 py-0.5 text-[10px] bg-white/80 dark:bg-white/20 rounded-full normal-case font-bold">
                            {selectedVariants[variantType.id].length}
                          </span>
                        )}
                      </span>
                      <ChevronDown className={cn(
                        'w-4 h-4 transition-transform duration-200',
                        c.icon,
                        expandedFilters[variantType.id] && 'rotate-180'
                      )} />
                    </button>
                    <AnimatePresence initial={false}>
                      {expandedFilters[variantType.id] && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: 'auto' }}
                          exit={{ height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="flex flex-wrap gap-2 px-3 pb-3">
                            {variantType.values.map((value) => {
                              const isSelected = selectedVariants[variantType.id]?.includes(value.value);
                              return (
                                <button
                                  key={value.id}
                                  onClick={() => handleVariantToggle(variantType.id, value.value)}
                                  className={cn(
                                    'px-3 py-1.5 rounded-full text-sm transition-all duration-200 border font-medium',
                                    isSelected ? c.chipActive : c.chipInactive
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
                );
              })}


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

            {/* Desktop Sort Bar */}
            <motion.div
              className="hidden lg:flex items-center justify-between mb-5"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                {results ? (
                  <>Mostrando <span className="font-bold text-neutral-700 dark:text-neutral-200">{results.meta.total}</span> productos</>
                ) : (
                  'Cargando productos...'
                )}
              </p>
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-neutral-500">Ordenar:</span>
                <div className="relative">
                  <select
                    value={sort}
                    onChange={(e) => {
                      setSort(e.target.value);
                      handleSearch(query, 1);
                    }}
                    className="appearance-none pl-3.5 pr-8 py-2 rounded-xl bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 text-sm font-medium text-neutral-700 dark:text-neutral-300 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 outline-none cursor-pointer transition-all"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                </div>
              </div>
            </motion.div>

            {/* Loading State */}
            {isSearching && (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 text-cyan-600 animate-spin mx-auto mb-3" />
                  <p className="text-sm text-neutral-500">Buscando productos...</p>
                </div>
              </div>
            )}

            {/* Results - Mobile LIST view + Desktop GRID */}
            {!isSearching && results && results.products.length > 0 && (
              <>
                {/* Desktop Grid (unchanged) */}
                <motion.div
                  className="hidden lg:grid lg:grid-cols-3 gap-4"
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

                {/* Mobile Brand Grid View - BETA.pen style cards (2 cols) */}
                {activeBrandInfo && (
                  <motion.div
                    className="lg:hidden grid grid-cols-2 gap-2.5 px-3.5 pt-2"
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                  >
                    {results.products.map((product, index) => {
                      const price = Number(product.price);
                      const salePrice = product.salePrice ? Number(product.salePrice) : null;
                      const discount = salePrice ? Math.round(((price - salePrice) / price) * 100) : 0;
                      const mainImage = product.images?.[0]?.url;

                      return (
                        <motion.div key={product.id} variants={staggerItem}>
                          <Link
                            href={`/productos/${product.slug}`}
                            className="block bg-white rounded-[18px] overflow-hidden shadow-[0_2px_12px_#0000000A] active:scale-[0.98] transition-transform"
                          >
                            {/* Product Image */}
                            <div className="relative h-[130px] bg-neutral-100 overflow-hidden">
                              {mainImage ? (
                                <Image
                                  src={mainImage}
                                  alt={product.name}
                                  fill
                                  className="object-cover"
                                  sizes="(max-width: 768px) 50vw"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <ShoppingBag className="w-8 h-8 text-neutral-300" />
                                </div>
                              )}
                              {/* Discount badge */}
                              {discount > 0 && (
                                <div className="absolute top-2 left-2 flex items-center gap-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                  <Tag className="w-3 h-3" />
                                  -{discount}%
                                </div>
                              )}
                              {/* Variant badge */}
                              {(product as any).variantCount > 1 && (
                                <div className="absolute top-2 right-2 bg-black/60 text-white text-[9px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm">
                                  +{(product as any).variantCount} sabores
                                </div>
                              )}
                            </div>
                            {/* Body */}
                            <div className="p-2.5 flex flex-col gap-0.5">
                              <p className="text-[9px] font-bold text-[#0891B2] uppercase tracking-[1px]">
                                {product.category?.name}
                              </p>
                              <h3 className="text-[13px] font-bold text-[#0C4A6E] leading-tight line-clamp-2" style={{ fontFamily: 'var(--font-heading, Plus Jakarta Sans, sans-serif)' }}>
                                {product.name}
                              </h3>
                              {product.brand && (
                                <p className="text-[11px] text-[#94A3B8]">{product.brand.name}</p>
                              )}
                              <div className="flex items-center gap-1.5 mt-1">
                                {salePrice ? (
                                  <>
                                    <span className="text-[15px] font-extrabold text-[#0C4A6E]">S/ {salePrice.toFixed(2)}</span>
                                    <span className="text-[11px] text-[#94A3B8] line-through">S/ {price.toFixed(2)}</span>
                                  </>
                                ) : (
                                  <span className="text-[15px] font-extrabold text-[#0C4A6E]">S/ {price.toFixed(2)}</span>
                                )}
                              </div>
                            </div>
                          </Link>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                )}

                {/* Mobile List View - BETA.pen Screen 05 style (white cards, square images, cyan price) */}
                {!activeBrandInfo && (
                  <motion.div
                    className="lg:hidden flex flex-col gap-2.5 px-3.5"
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                  >
                    {results.products.map((product, index) => {
                      const price = Number(product.price);
                      const salePrice = product.salePrice ? Number(product.salePrice) : null;
                      const discount = salePrice ? Math.round(((price - salePrice) / price) * 100) : 0;
                      const mainImage = product.images?.[0]?.url;

                      return (
                        <motion.div key={product.id} variants={staggerItem}>
                          <Link
                            href={`/productos/${product.slug}`}
                            className="flex items-center gap-3 p-2.5 bg-white rounded-[16px] shadow-[0_2px_8px_#0000000A] active:scale-[0.98] transition-transform"
                          >
                            {/* Square Product Image - 76x76 rounded-[12px] */}
                            <div className="w-[76px] h-[76px] flex-shrink-0 rounded-[12px] overflow-hidden bg-neutral-100">
                              {mainImage ? (
                                <Image
                                  src={mainImage}
                                  alt={product.name}
                                  width={76}
                                  height={76}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <ShoppingBag className="w-6 h-6 text-neutral-300" />
                                </div>
                              )}
                            </div>

                            {/* Product Info */}
                            <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5">
                              <p className="text-[10px] font-semibold text-[#0891B2]">
                                {product.category?.name}
                              </p>
                              <h3 className="text-[14px] font-bold text-[#0F172A] leading-tight line-clamp-1" style={{ fontFamily: 'var(--font-heading, Plus Jakarta Sans, sans-serif)' }}>
                                {product.name}
                              </h3>
                              {product.brand && (
                                <p className="text-[11px] text-[#94A3B8] font-medium">
                                  {product.brand.name}
                                </p>
                              )}
                              <div className="flex items-center gap-1.5 mt-0.5">
                                {salePrice ? (
                                  <>
                                    <span className="text-[15px] font-extrabold text-[#0891B2]" style={{ fontFamily: 'var(--font-heading, Plus Jakarta Sans, sans-serif)' }}>
                                      S/ {salePrice.toFixed(2)}
                                    </span>
                                    <span className="text-[11px] text-[#94A3B8] line-through">
                                      S/ {price.toFixed(2)}
                                    </span>
                                    <span className="text-[10px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded-full">
                                      -{discount}%
                                    </span>
                                  </>
                                ) : (
                                  <span className="text-[15px] font-extrabold text-[#0891B2]" style={{ fontFamily: 'var(--font-heading, Plus Jakarta Sans, sans-serif)' }}>
                                    S/ {price.toFixed(2)}
                                  </span>
                                )}
                              </div>
                            </div>

                            <ChevronRight className="w-4 h-4 text-[#CBD5E1] flex-shrink-0" />
                          </Link>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                )}

                {/* Pagination */}
                {results.meta.totalPages > 1 && (
                  <motion.div
                    className="flex items-center justify-center gap-2 mt-10 px-4 lg:px-0"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage <= 1}
                      className={cn(
                        'flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300',
                        currentPage <= 1
                          ? 'text-neutral-300 dark:text-neutral-600 cursor-not-allowed bg-neutral-100 dark:bg-white/5'
                          : 'text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-white/5 hover:bg-neutral-200 dark:hover:bg-white/10 hover:shadow-sm'
                      )}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Anterior
                    </button>

                    <div className="flex items-center gap-1.5">
                      {Array.from({ length: results.meta.totalPages }, (_, i) => i + 1)
                        .filter(p => p === 1 || p === results.meta.totalPages || Math.abs(p - currentPage) <= 1)
                        .map((p, idx, arr) => (
                          <span key={p}>
                            {idx > 0 && arr[idx - 1] !== p - 1 && (
                              <span className="px-1.5 text-neutral-400 text-sm">...</span>
                            )}
                            <button
                              onClick={() => handlePageChange(p)}
                              className={cn(
                                'w-10 h-10 rounded-xl text-sm font-semibold transition-all duration-300',
                                p === currentPage
                                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/30 scale-105'
                                  : 'text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-white/5 hover:bg-neutral-200 dark:hover:bg-white/10'
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
                        'flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300',
                        currentPage >= results.meta.totalPages
                          ? 'text-neutral-300 dark:text-neutral-600 cursor-not-allowed bg-neutral-100 dark:bg-white/5'
                          : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/40 hover:scale-105'
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
