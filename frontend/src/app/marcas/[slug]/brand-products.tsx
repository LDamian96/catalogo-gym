'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ChevronRight,
  Home,
  SlidersHorizontal,
  X,
  ChevronLeft,
  ArrowUpDown,
  Search,
  Package,
  Award,
  ShoppingBag,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProductCard, WhatsAppButton, Footer, SearchBar, MobileBottomNav, Navbar } from '@/components/catalog';
import type {
  CatalogSettings,
  CatalogCategory,
  CatalogProduct,
  CatalogBrand,
} from '@/lib/api/catalog';
import { staggerContainer, staggerItem } from '@/lib/animations';

interface BrandProductsProps {
  brand: CatalogBrand;
  products: CatalogProduct[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  filters: {
    categories: { id: string; name: string; slug: string; _count: { products: number } }[];
    priceRange: { min: number; max: number };
  };
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

export function BrandProducts({
  brand,
  products,
  pagination,
  filters,
  settings,
  categories,
  currentSort,
  currentMinPrice,
  currentMaxPrice,
}: BrandProductsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [showFilters, setShowFilters] = useState(false);
  const [minPrice, setMinPrice] = useState(currentMinPrice || '');
  const [maxPrice, setMaxPrice] = useState(currentMaxPrice || '');

  const hasActiveFilters = currentMinPrice || currentMaxPrice || currentSort;

  const updateFilters = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-blue-50 to-cyan-50 dark:bg-[#000000] dark:from-[#000000] dark:via-[#000000] dark:to-[#000000] lg:bg-white lg:from-white lg:via-white lg:to-white">
      {/* Navbar */}
      <Navbar settings={settings} categories={categories} />

      {/* Mobile Hero - Mini Brand Header */}
      <div className="lg:hidden">
        <div className="relative overflow-hidden rounded-b-[26px] bg-gradient-to-br from-cyan-500 via-sky-600 to-blue-700 shadow-[0_8px_24px_rgba(14,165,233,0.15)]">
          <div className="relative px-3.5 pt-20 pb-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <Link
                href="/productos"
                className="inline-flex items-center gap-1.5 text-white/80 active:scale-95 transition-transform"
              >
                <ChevronLeft className="w-5 h-5" />
                <span className="text-[13px] font-medium">Productos</span>
              </Link>
            </div>

            {/* Brand info */}
            <div className="flex items-center gap-3">
              {brand.logo ? (
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm p-1.5 flex items-center justify-center">
                  <Image
                    src={brand.logo}
                    alt={brand.name}
                    width={44}
                    height={44}
                    className="object-contain rounded-lg"
                  />
                </div>
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Award className="w-7 h-7 text-white" />
                </div>
              )}
              <div className="flex flex-col gap-0.5">
                <h1 className="text-[24px] font-extrabold text-white tracking-tight leading-none">
                  {brand.name}
                </h1>
                <p className="text-[12px] text-sky-200 font-medium">
                  {pagination.total} productos disponibles
                </p>
              </div>
            </div>

            {brand.description && (
              <p className="text-[12px] text-white/70 leading-relaxed line-clamp-2">
                {brand.description}
              </p>
            )}

            {/* Search bar */}
            <div className="flex items-center gap-2 h-[42px] px-3 rounded-xl bg-white/90">
              <Search className="w-4 h-4 text-cyan-600 flex-shrink-0" />
              <Link href="/" className="text-[12px] text-slate-500 font-medium truncate">
                Buscar en {brand.name}...
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile Controls */}
        <div className="px-3.5 pt-3 pb-2 space-y-2.5">
          {/* Category filter chips */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-0.5 -mx-3.5 px-3.5">
            <Link
              href={pathname}
              className="flex-shrink-0 px-3.5 py-[7px] rounded-full text-[12px] bg-cyan-600 text-white font-bold"
            >
              Todos
            </Link>
            {filters.categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/categorias/${cat.slug}`}
                className="flex-shrink-0 px-3.5 py-[7px] rounded-full text-[12px] bg-white text-slate-500 font-semibold border border-slate-200"
              >
                {cat.name}
              </Link>
            ))}
          </div>

          {/* Results + Sort */}
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
                    <option key={option.value} value={option.value}>{option.label}</option>
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

      {/* Desktop Brand Header - Mini & Clean */}
      <div className="hidden lg:block relative overflow-hidden bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-700">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyek0zNiAxNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />

        <div className="relative max-w-7xl mx-auto px-4 py-8">
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
            <Link href="/productos" className="text-white/60 hover:text-white transition-colors">
              Productos
            </Link>
            <ChevronRight className="w-4 h-4 text-white/40" />
            <span className="text-white font-medium">{brand.name}</span>
          </motion.nav>

          {/* Brand Info Row */}
          <div className="flex items-center gap-5">
            {brand.logo ? (
              <motion.div
                className="w-20 h-20 rounded-2xl bg-white/15 backdrop-blur-sm p-2 flex items-center justify-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Image
                  src={brand.logo}
                  alt={brand.name}
                  width={64}
                  height={64}
                  className="object-contain rounded-lg"
                />
              </motion.div>
            ) : (
              <motion.div
                className="w-20 h-20 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Award className="w-10 h-10 text-white" />
              </motion.div>
            )}

            <div className="flex-1">
              <motion.h1
                className="text-3xl md:text-4xl font-black text-white tracking-tight"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                {brand.name}
              </motion.h1>
              {brand.description && (
                <motion.p
                  className="text-white/70 text-sm md:text-base mt-1 max-w-2xl"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  {brand.description}
                </motion.p>
              )}
              <motion.div
                className="flex items-center gap-4 mt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <span className="inline-flex items-center gap-1.5 text-white/80 text-sm">
                  <Package className="w-4 h-4" />
                  {pagination.total} productos
                </span>
                {filters.categories.length > 0 && (
                  <span className="inline-flex items-center gap-1.5 text-white/80 text-sm">
                    <ShoppingBag className="w-4 h-4" />
                    {filters.categories.length} categorías
                  </span>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Search & Filters Bar */}
      <div className="hidden lg:block lg:sticky lg:top-0 z-30 bg-gradient-to-r from-cyan-50/80 via-white to-white border-b border-cyan-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <SearchBar variant="compact" placeholder={`Buscar en ${brand.name}...`} />
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <select
                  value={currentSort || ''}
                  onChange={(e) => updateFilters({ sort: e.target.value || undefined })}
                  className="appearance-none px-4 py-2.5 pr-10 rounded-xl bg-neutral-100 border border-neutral-200 text-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                >
                  <option value="">Ordenar por</option>
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
                <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
              </div>
              <motion.button
                onClick={() => setShowFilters(true)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-100 border border-neutral-200 text-neutral-700 text-sm',
                  hasActiveFilters && 'border-cyan-500 text-cyan-600'
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filtros
                {hasActiveFilters && (
                  <span className="w-2 h-2 bg-cyan-500 rounded-full" />
                )}
              </motion.button>
            </div>
          </div>

          {/* Category chips for desktop */}
          {filters.categories.length > 0 && (
            <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-hide">
              {filters.categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/categorias/${cat.slug}`}
                  className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium bg-cyan-50 text-cyan-700 border border-cyan-200 hover:bg-cyan-100 transition-colors"
                >
                  {cat.name} ({cat._count.products})
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-3.5 lg:px-4 py-4 lg:py-8">
        {products.length > 0 ? (
          <>
            <motion.div
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-5"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {products.map((product) => (
                <motion.div key={product.id} variants={staggerItem}>
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => updateFilters({ page: String(pagination.page - 1) })}
                  disabled={!pagination.hasPreviousPage}
                  className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                >
                  Anterior
                </button>
                <span className="px-4 py-2 text-sm text-slate-600">
                  {pagination.page} de {pagination.totalPages}
                </span>
                <button
                  onClick={() => updateFilters({ page: String(pagination.page + 1) })}
                  disabled={!pagination.hasNextPage}
                  className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                >
                  Siguiente
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <Package className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-2">
              No hay productos disponibles
            </h3>
            <p className="text-slate-500 text-sm mb-6 max-w-sm">
              No encontramos productos de {brand.name} con los filtros seleccionados
            </p>
            <button
              onClick={clearFilters}
              className="px-6 py-2.5 bg-cyan-600 text-white rounded-xl text-sm font-medium hover:bg-cyan-700 transition-colors"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>

      {/* Filter Sheet */}
      {showFilters && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowFilters(false)} />
          <motion.div
            className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white shadow-xl"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-bold text-slate-800">Filtros</h3>
              <button onClick={() => setShowFilters(false)} className="p-2 rounded-xl hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-6 overflow-y-auto h-[calc(100%-70px)]">
              {/* Price Range */}
              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-3">Rango de precio</h4>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  />
                  <span className="text-slate-400">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  />
                </div>
                <button
                  onClick={() => {
                    applyPriceFilter();
                    setShowFilters(false);
                  }}
                  className="w-full mt-3 py-2.5 bg-cyan-600 text-white rounded-xl text-sm font-medium hover:bg-cyan-700 transition-colors"
                >
                  Aplicar precio
                </button>
              </div>

              {/* Categories in this brand */}
              {filters.categories.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-3">Categorías</h4>
                  <div className="space-y-1">
                    {filters.categories.map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/categorias/${cat.slug}`}
                        className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors"
                      >
                        <span className="text-sm text-slate-700">{cat.name}</span>
                        <span className="text-xs text-slate-400">{cat._count.products}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {hasActiveFilters && (
                <button
                  onClick={() => {
                    clearFilters();
                    setShowFilters(false);
                  }}
                  className="w-full py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Limpiar todos los filtros
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}

      <WhatsAppButton phoneNumber={settings.whatsapp || ''} businessName={settings.businessName || ''} />
      <Footer settings={settings} />
      <MobileBottomNav />
    </div>
  );
}
