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
  Search,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProductCard, WhatsAppButton, Footer, SearchBar, MobileBottomNav, Navbar } from '@/components/catalog';
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
  const [selectedBrand, setSelectedBrand] = useState(searchParams.get('brandId') || '');
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
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-blue-50 to-cyan-50 dark:bg-[#000000] dark:from-[#000000] dark:via-[#000000] dark:to-[#000000] pb-24 lg:pb-0 lg:bg-white lg:from-white lg:via-white lg:to-white">
      {/* Navbar */}
      <Navbar settings={settings} categories={categories} />

      {/* Mobile Native UI */}
      <div className="lg:hidden">
        {/* Hero section - cyan/teal gradient matching BETA.pen */}
        <div className="relative overflow-hidden rounded-b-[26px] bg-gradient-to-br from-cyan-500 via-sky-600 to-blue-700 shadow-[0_8px_24px_rgba(14,165,233,0.15)]">
          {/* pt-20 = navbar height (56px) + extra spacing so content sits below navbar */}
          <div className="relative px-3.5 pt-20 pb-4 flex flex-col gap-3">
            {/* Top row: back button + cart */}
            <div className="flex items-center justify-between">
              <Link
                href="/categorias"
                className="inline-flex items-center gap-1.5 text-white/80 active:scale-95 transition-transform"
              >
                <ChevronLeft className="w-5 h-5" />
                <span className="text-[13px] font-medium">Categorías</span>
              </Link>
            </div>

            {/* Title block */}
            <div className="flex flex-col gap-1">
              <h1 className="text-[26px] font-extrabold text-white tracking-tight leading-none" style={{ fontFamily: 'var(--font-heading, inherit)' }}>
                {category.name}
              </h1>
              <p className="text-[13px] text-sky-200 font-medium">
                {category.description || motivation.tagline.split('. ').map(s => s.charAt(0) + s.slice(1).toLowerCase()).join('. ')}
              </p>
            </div>

            {/* Search bar - white translucent */}
            <div className="flex items-center gap-2 h-[42px] px-3 rounded-xl bg-white/90">
              <Search className="w-4 h-4 text-cyan-600 flex-shrink-0" />
              <Link
                href="/"
                className="text-[12px] text-slate-500 font-medium truncate"
              >
                Buscar en {category.name.toLowerCase()}...
              </Link>
            </div>
          </div>
        </div>

        {/* Controls section */}
        <div className="px-3.5 pt-3 pb-2 space-y-2.5">
          {/* Filter Chips: Todos + Brands + Variants */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-0.5 -mx-3.5 px-3.5">
            {/* "Todos" chip - teal filled when selected */}
            <button
              onClick={() => {
                setSelectedBrand('');
                updateFilters({ brandId: undefined });
              }}
              className={cn(
                'flex-shrink-0 px-3.5 py-[7px] rounded-full text-[12px] transition-all active:scale-95',
                !selectedBrand
                  ? 'bg-cyan-600 text-white font-bold'
                  : 'bg-white text-slate-500 font-semibold border border-slate-200'
              )}
            >
              Todos
            </button>
            {/* Brand chips - white with border, teal when selected */}
            {filters.brands.map((brand) => (
              <button
                key={brand.id}
                onClick={() => {
                  const newBrand = selectedBrand === brand.id ? '' : brand.id;
                  setSelectedBrand(newBrand);
                  updateFilters({ brandId: newBrand || undefined });
                }}
                className={cn(
                  'flex-shrink-0 px-3.5 py-[7px] rounded-full text-[12px] transition-all active:scale-95',
                  selectedBrand === brand.id
                    ? 'bg-cyan-600 text-white font-bold'
                    : 'bg-white text-slate-500 font-semibold border border-slate-200'
                )}
              >
                {brand.name}
              </button>
            ))}
            {/* Variant chips */}
            {variantFilters.flatMap((variantType) =>
              variantType.values.slice(0, 4).map((val) => {
                const isSelected = selectedVariants[variantType.id]?.includes(val.value);
                return (
                  <button
                    key={val.id}
                    onClick={() => handleVariantToggle(variantType.id, val.value)}
                    className={cn(
                      'flex-shrink-0 px-3.5 py-[7px] rounded-full text-[12px] transition-all active:scale-95',
                      isSelected
                        ? 'bg-cyan-600 text-white font-bold'
                        : 'bg-white text-slate-500 font-semibold border border-slate-200'
                    )}
                  >
                    {val.value}
                  </button>
                );
              })
            )}
          </div>

          {/* Results + Sort + Filters row */}
          <div className="flex items-center justify-between">
            <p className="text-[12px] text-slate-500 font-semibold">
              {pagination.total} resultados
            </p>
            <div className="flex items-center gap-2">
              <div className="relative">
                <select
                  value={currentSort || ''}
                  onChange={(e) => updateFilters({ sort: e.target.value || undefined })}
                  className="appearance-none pl-3 pr-7 py-1.5 rounded-[10px] bg-white border border-slate-200 text-[11px] font-semibold text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-300/50"
                >
                  <option value="">Ordenar</option>
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ArrowUpDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
              </div>
              <button
                onClick={() => setShowFilters(true)}
                className={cn(
                  'w-[34px] h-[34px] rounded-[10px] flex items-center justify-center border transition-all active:scale-95',
                  hasActiveFilters
                    ? 'bg-cyan-600 text-white border-transparent shadow-md'
                    : 'bg-white border-slate-200 text-slate-400'
                )}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Header with Category Info - BEAST MODE (Desktop only) */}
      <div className="hidden lg:block relative bg-[#000000] overflow-hidden">
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
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#000000] to-transparent" />

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

      {/* Search & Filters Bar - Desktop only */}
      <div className="hidden lg:block lg:sticky lg:top-0 z-30 bg-gradient-to-r from-cyan-50/80 via-white to-white dark:bg-[#000000] border-b border-cyan-100 dark:border-neutral-800 shadow-sm">
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
      <div className="max-w-7xl mx-auto px-3.5 lg:px-4 py-2.5 lg:py-6">
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
                    'grid gap-2.5 lg:gap-4',
                    viewMode === 'grid'
                      ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
                      : 'grid-cols-2 md:grid-cols-2 lg:grid-cols-3'
                  )}
                  variants={staggerContainer}
                  initial="initial"
                  animate="animate"
                >
                  {products.map((product, index) => (
                    <motion.div
                      key={product.id}
                      variants={staggerItem}
                      className="min-w-0"
                    >
                      <ProductCard product={product} index={index} />
                    </motion.div>
                  ))}
                </motion.div>

                {/* Pagination - Mobile: Load More button, Desktop: page numbers */}
                {pagination.totalPages > 1 && (
                  <>
                    {/* Mobile: Load More */}
                    {pagination.page < pagination.totalPages && (
                      <motion.div
                        className="lg:hidden flex flex-col items-center gap-2 mt-6 mb-2"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, type: 'spring', stiffness: 300, damping: 30 }}
                      >
                        <button
                          onClick={() => updateFilters({ page: String(pagination.page + 1) })}
                          className="w-full py-3.5 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-[14px] font-bold active:scale-[0.98] transition-transform shadow-lg"
                        >
                          Cargar más productos
                        </button>
                        <span className="text-[11px] text-neutral-400">
                          Página {pagination.page} de {pagination.totalPages}
                        </span>
                      </motion.div>
                    )}

                    {/* Desktop: Page numbers */}
                    <motion.div
                      className="hidden lg:flex items-center justify-center gap-2 mt-12"
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
                  </>
                )}
              </>
            ) : (
              <motion.div
                className="text-center py-16 lg:py-20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                <div className="w-20 h-20 lg:w-24 lg:h-24 mx-auto mb-5 lg:mb-6 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                  <Grid3X3 className="w-8 h-8 lg:w-10 lg:h-10 text-neutral-400" />
                </div>
                <h3 className="text-lg lg:text-xl font-semibold text-[#000000] dark:text-white mb-2">
                  No hay productos
                </h3>
                <p className="text-sm lg:text-base text-slate-500 dark:text-neutral-400 mb-6 px-4">
                  No encontramos productos con los filtros seleccionados
                </p>
                {hasActiveFilters && (
                  <motion.button
                    onClick={clearFilters}
                    className="px-6 py-3 bg-cyan-600 text-white rounded-xl font-medium hover:bg-cyan-700 active:scale-[0.98] transition-all"
                    whileTap={{ scale: 0.98 }}
                  >
                    Limpiar filtros
                  </motion.button>
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
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setShowFilters(false)}
            />
            <motion.div
              className="fixed right-0 top-0 bottom-0 w-[85vw] max-w-[320px] bg-white dark:bg-neutral-950 z-50 lg:hidden shadow-2xl overflow-y-auto"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            >
              <div className="flex items-center justify-between p-5 border-b border-neutral-200 dark:border-neutral-800 sticky top-0 bg-white dark:bg-neutral-950 z-10">
                <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Filtros</h2>
                <button
                  onClick={() => setShowFilters(false)}
                  className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center active:scale-95 transition-transform"
                >
                  <X className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                </button>
              </div>
              <div className="p-5 space-y-6">
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
                <div className="space-y-3 pt-4 pb-8">
                  <motion.button
                    onClick={() => {
                      applyPriceFilter();
                      setShowFilters(false);
                    }}
                    className="w-full py-3.5 text-[14px] font-bold text-white bg-cyan-600 rounded-xl active:scale-[0.98] transition-transform shadow-lg shadow-cyan-600/25"
                    whileTap={{ scale: 0.98 }}
                  >
                    Aplicar filtros
                  </motion.button>
                  {hasActiveFilters && (
                    <button
                      onClick={() => {
                        clearFilters();
                        setShowFilters(false);
                      }}
                      className="w-full py-2.5 text-[13px] font-medium text-neutral-500 dark:text-neutral-400 active:text-cyan-600 transition-colors"
                    >
                      Limpiar todos los filtros
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Footer - Desktop only (mobile uses bottom nav) */}
      <div className="hidden lg:block">
        <Footer settings={settings} categories={categories} />
      </div>

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
