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
  Flame,
  Zap,
  Target,
  Trophy,
  TrendingUp,
  Shield,
  Dumbbell,
  Heart,
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

// Category-specific motivational content for supplements
const categoryMotivation: Record<string, {
  tagline: string;
  benefits: { icon: React.ElementType; text: string }[];
  accentColor: string;
}> = {
  'proteinas': {
    tagline: 'CONSTRUYE MÚSCULO. DOMINA TU FÍSICO.',
    benefits: [
      { icon: Dumbbell, text: 'Máxima síntesis proteica' },
      { icon: Zap, text: 'Recuperación acelerada' },
      { icon: TrendingUp, text: 'Ganancia muscular real' },
    ],
    accentColor: 'from-red-600 to-orange-500',
  },
  'gainers': {
    tagline: 'GANA MASA. ROMPE TUS LÍMITES.',
    benefits: [
      { icon: Flame, text: 'Alto contenido calórico' },
      { icon: Target, text: 'Crecimiento explosivo' },
      { icon: Trophy, text: 'Resultados visibles' },
    ],
    accentColor: 'from-orange-600 to-amber-500',
  },
  'pre-entrenos': {
    tagline: 'ENERGÍA BRUTAL. ENTRENA COMO BESTIA.',
    benefits: [
      { icon: Zap, text: 'Energía explosiva' },
      { icon: Flame, text: 'Foco mental extremo' },
      { icon: Target, text: 'Rendimiento máximo' },
    ],
    accentColor: 'from-red-700 to-red-500',
  },
  'creatinas': {
    tagline: 'FUERZA PURA. POTENCIA REAL.',
    benefits: [
      { icon: Dumbbell, text: '+20% más fuerza' },
      { icon: Zap, text: 'ATP inmediato' },
      { icon: Shield, text: 'Resistencia superior' },
    ],
    accentColor: 'from-purple-600 to-red-500',
  },
  'aminoacidos': {
    tagline: 'RECUPERA. REPARA. CRECE.',
    benefits: [
      { icon: Heart, text: 'Anti-catabólico' },
      { icon: Zap, text: 'Recuperación 24/7' },
      { icon: TrendingUp, text: 'Síntesis constante' },
    ],
    accentColor: 'from-blue-600 to-purple-500',
  },
  'quemadores': {
    tagline: 'QUEMA GRASA. DEFINE TU CUERPO.',
    benefits: [
      { icon: Flame, text: 'Metabolismo acelerado' },
      { icon: Target, text: 'Definición extrema' },
      { icon: Zap, text: 'Energía sin calorías' },
    ],
    accentColor: 'from-orange-600 to-red-600',
  },
  'vitaminas': {
    tagline: 'OPTIMIZA TU CUERPO. RINDE AL 100%.',
    benefits: [
      { icon: Shield, text: 'Sistema inmune fuerte' },
      { icon: Heart, text: 'Salud integral' },
      { icon: Zap, text: 'Energía natural' },
    ],
    accentColor: 'from-green-600 to-emerald-500',
  },
  'accesorios': {
    tagline: 'EQUÍPATE COMO PROFESIONAL.',
    benefits: [
      { icon: Trophy, text: 'Calidad premium' },
      { icon: Target, text: 'Máximo rendimiento' },
      { icon: Shield, text: 'Durabilidad garantizada' },
    ],
    accentColor: 'from-neutral-600 to-neutral-500',
  },
};

// Default motivation for unknown categories
const defaultMotivation = {
  tagline: 'TRANSFORMA TU CUERPO. ALCANZA TUS METAS.',
  benefits: [
    { icon: Trophy, text: 'Resultados comprobados' },
    { icon: Zap, text: 'Fórmulas premium' },
    { icon: Shield, text: 'Calidad garantizada' },
  ],
  accentColor: 'from-red-600 to-orange-500',
};

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

  // Get category-specific motivation or default
  const motivation = categoryMotivation[category.slug] || defaultMotivation;

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0f]">
      {/* Header with Category Info - BEAST MODE */}
      <div className="relative bg-[#0a0a0f] overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0">
          <div className={cn(
            'absolute inset-0 bg-gradient-to-br opacity-90',
            motivation.accentColor
          )} />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyek0zNiAxNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        </div>

        {/* Background Image with aggressive overlay */}
        {category.image && (
          <div className="absolute inset-0">
            <Image
              src={category.image}
              alt={category.name}
              fill
              quality={85}
              className="object-cover mix-blend-overlay opacity-40"
            />
          </div>
        )}

        {/* Diagonal cut overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/40" />
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#0a0a0f] to-transparent" />

        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 py-10 md:py-16">
          {/* Breadcrumb */}
          <motion.nav
            className="flex items-center gap-2 text-sm mb-6"
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

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            {/* Left: Title & Tagline */}
            <div className="flex-1">
              {/* Category Badge */}
              <motion.div
                className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full mb-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Flame className="w-4 h-4 text-orange-400" />
                <span className="text-white/90 text-xs font-semibold tracking-wider uppercase">
                  {pagination.total} productos disponibles
                </span>
              </motion.div>

              {/* Category Title */}
              <motion.h1
                className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-3 tracking-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                style={{ textShadow: '0 4px 30px rgba(0,0,0,0.5)' }}
              >
                {category.name.toUpperCase()}
              </motion.h1>

              {/* Motivational Tagline */}
              <motion.p
                className={cn(
                  'text-lg md:text-2xl font-bold tracking-wide',
                  'bg-gradient-to-r bg-clip-text text-transparent',
                  motivation.accentColor
                )}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                style={{
                  WebkitBackgroundClip: 'text',
                  backgroundImage: `linear-gradient(to right, #fff, rgba(255,255,255,0.8))`
                }}
              >
                {motivation.tagline}
              </motion.p>

              {/* Description */}
              {category.description && (
                <motion.p
                  className="text-white/60 max-w-xl text-sm md:text-base mt-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {category.description}
                </motion.p>
              )}
            </div>

            {/* Right: Benefits Cards */}
            <motion.div
              className="flex flex-wrap lg:flex-col gap-2 lg:gap-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
            >
              {motivation.benefits.map((benefit, index) => {
                const IconComponent = benefit.icon;
                return (
                  <motion.div
                    key={benefit.text}
                    className={cn(
                      'flex items-center gap-3 px-4 py-2.5',
                      'bg-white/10 backdrop-blur-md rounded-xl',
                      'border border-white/10',
                      'hover:bg-white/20 transition-all duration-300'
                    )}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    whileHover={{ scale: 1.02, x: -5 }}
                  >
                    <div className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center',
                      'bg-gradient-to-br',
                      motivation.accentColor
                    )}>
                      <IconComponent className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-white font-semibold text-sm whitespace-nowrap">
                      {benefit.text}
                    </span>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
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
                    'focus:outline-none focus:ring-2 focus:ring-red-500/50'
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
                  hasActiveFilters && 'border-red-500 text-red-600 dark:text-red-400'
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filtros
                {hasActiveFilters && (
                  <span className="w-2 h-2 rounded-full bg-red-500" />
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
                            ? 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300 font-medium'
                            : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-white/5'
                        )}
                      >
                        {option.label}
                        {currentSort === option.value && (
                          <div className="ml-auto w-1.5 h-1.5 rounded-full bg-red-500" />
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
                          <span className="px-1.5 py-0.5 text-[10px] bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded-full normal-case font-medium">
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
                                      ? 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300 border-red-300 dark:border-red-500/40 font-medium'
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
                            ? 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300 font-medium'
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
                        className="w-full px-3 py-2 text-sm rounded-lg bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 focus:ring-2 focus:ring-red-500/50 focus:border-red-500 outline-none transition-all"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-neutral-500 mb-1 block">Máximo</label>
                      <input
                        type="number"
                        placeholder="S/ 999"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className="w-full px-3 py-2 text-sm rounded-lg bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 focus:ring-2 focus:ring-red-500/50 focus:border-red-500 outline-none transition-all"
                      />
                    </div>
                  </div>
                  <button
                    onClick={applyPriceFilter}
                    className="w-full py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-500/10 rounded-lg hover:bg-red-200 dark:hover:bg-red-500/20 transition-colors"
                  >
                    Aplicar precio
                  </button>
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="w-full py-2 text-xs text-neutral-500 hover:text-red-600 transition-colors"
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
                                  ? 'bg-red-600 text-white'
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
                    className="px-6 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors"
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
                            ? 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300'
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
                        className="w-full flex items-center justify-between text-sm font-semibold uppercase tracking-wider mb-3 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          {variantType.name}
                          {selectedVariants[variantType.id]?.length > 0 && (
                            <span className="px-1.5 py-0.5 text-[10px] bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded-full normal-case font-medium">
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
                                        ? 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300 font-medium'
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
                              ? 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300 font-medium'
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
                    className="w-full py-3 text-sm font-medium text-white bg-red-600 rounded-lg"
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
