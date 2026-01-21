'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Search, ShoppingCart, ChevronDown, Grid3X3, Home, Package, Sparkles, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCart } from '@/hooks/useCart';
import { v0Ease, dropdownVariants } from '@/lib/animations';
import type { CatalogSettings, CatalogCategory, CatalogProduct } from '@/lib/api/catalog';
import { catalogApi } from '@/lib/api/catalog';

interface NavbarProps {
  settings: CatalogSettings;
  categories: CatalogCategory[];
  transparent?: boolean;
}

export function Navbar({ settings, categories, transparent = false }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CatalogProduct[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();
  const { items, openCart } = useCart();

  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Focus input when search opens
  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearch]);

  // Close search on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowSearch(false);
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  // Live search with debounce
  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await catalogApi.getProducts({ search: query, limit: 8 });
      setSearchResults(response.products || []);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Debounced search on query change
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.trim()) {
      setIsSearching(true);
      searchTimeoutRef.current = setTimeout(() => {
        performSearch(searchQuery);
      }, 300);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, performSearch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/productos?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearch(false);
      setSearchQuery('');
      setSearchResults([]);
    }
  };

  const handleResultClick = (slug: string) => {
    router.push(`/productos/${slug}`);
    setShowSearch(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isTransparent = transparent && !isScrolled;

  return (
    <motion.header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out',
        isTransparent
          ? 'bg-black/10 dark:bg-white/5 backdrop-blur-2xl border-b border-white/10 dark:border-white/5'
          : 'bg-white/30 dark:bg-black/40 backdrop-blur-2xl backdrop-saturate-150 border-b border-white/50 dark:border-white/10'
      )}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: v0Ease }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Mobile Header */}
        <div className="flex lg:hidden items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2.5">
            {settings.logo ? (
              <div className="relative w-8 h-8 rounded-xl overflow-hidden shadow-lg shadow-violet-500/10">
                <Image
                  src={settings.logo}
                  alt={settings.businessName || 'Logo'}
                  fill
                  className="object-contain"
                />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center shadow-lg shadow-violet-500/25">
                <span className="text-white font-semibold text-sm">
                  {(settings.businessName || 'C')[0]}
                </span>
              </div>
            )}
            <span className={cn(
              "font-medium text-sm truncate max-w-[140px] transition-colors",
              isTransparent ? "text-white" : "text-neutral-800 dark:text-white"
            )}>
              {settings.businessName || 'Catálogo'}
            </span>
          </Link>

          {/* Mobile Actions */}
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => setShowSearch(true)}
              className={cn(
                "p-2.5 rounded-xl transition-all duration-300",
                isTransparent
                  ? "text-white/80 hover:text-white hover:bg-white/10"
                  : "text-neutral-500 hover:text-violet-600 dark:text-neutral-400 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-500/10"
              )}
            >
              <Search className="w-5 h-5" />
            </button>
            {settings.cartEnabled && (
              <button
                onClick={openCart}
                className={cn(
                  "relative p-2.5 rounded-xl transition-all duration-300",
                  isTransparent
                    ? "text-white/80 hover:text-white hover:bg-white/10"
                    : "text-neutral-500 hover:text-violet-600 dark:text-neutral-400 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-500/10"
                )}
              >
                <ShoppingCart className="w-5 h-5" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-gradient-to-r from-violet-500 to-pink-500 text-white text-[10px] font-semibold rounded-full flex items-center justify-center shadow-lg shadow-violet-500/30">
                    {cartItemCount > 9 ? '9+' : cartItemCount}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            {settings.logo ? (
              <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-violet-500/10 group-hover:shadow-violet-500/20 transition-shadow duration-300">
                <Image
                  src={settings.logo}
                  alt={settings.businessName || 'Logo'}
                  fill
                  className="object-contain"
                />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center shadow-lg shadow-violet-500/25 group-hover:shadow-violet-500/40 transition-shadow duration-300">
                <span className="text-white font-semibold">
                  {(settings.businessName || 'C')[0]}
                </span>
              </div>
            )}
            {settings.businessName && (
              <span className={cn(
                "font-semibold transition-colors",
                isTransparent ? "text-white" : "text-neutral-800 dark:text-white"
              )}>
                {settings.businessName}
              </span>
            )}
          </Link>

          {/* Desktop Navigation */}
          <nav className="flex items-center gap-1">
            <Link
              href="/"
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300",
                isTransparent
                  ? "text-white/80 hover:text-white hover:bg-white/10"
                  : "text-neutral-600 hover:text-violet-600 dark:text-neutral-400 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-500/10"
              )}
            >
              <Home className="w-4 h-4" />
              Inicio
            </Link>

            {/* Categories Dropdown - Now with Link */}
            <div
              className="relative"
              onMouseEnter={() => setShowCategories(true)}
              onMouseLeave={() => setShowCategories(false)}
            >
              <Link
                href="/categorias"
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300",
                  isTransparent
                    ? "text-white/80 hover:text-white hover:bg-white/10"
                    : "text-neutral-600 hover:text-violet-600 dark:text-neutral-400 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-500/10"
                )}
              >
                <Grid3X3 className="w-4 h-4" />
                Categorías
                <ChevronDown className={cn(
                  'w-4 h-4 transition-transform duration-300',
                  showCategories && 'rotate-180'
                )} />
              </Link>

              <AnimatePresence>
                {showCategories && categories.length > 0 && (
                  <motion.div
                    variants={dropdownVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="absolute top-full left-0 mt-2 w-80 bg-white dark:bg-[#12121a] rounded-2xl border border-black/[0.06] dark:border-white/[0.06] overflow-hidden shadow-xl shadow-violet-500/10 dark:shadow-violet-500/5"
                  >
                    {/* Header del dropdown */}
                    <div className="px-4 py-3 border-b border-neutral-100 dark:border-white/[0.06] bg-gradient-to-r from-violet-50 to-pink-50 dark:from-violet-500/5 dark:to-pink-500/5">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-violet-500" />
                        <p className="text-xs font-medium text-violet-600 dark:text-violet-400 uppercase tracking-wider">
                          Explorar categorías
                        </p>
                      </div>
                    </div>

                    <div className="py-2 max-h-[60vh] overflow-y-auto">
                      {categories.filter(c => c.level === 0 || !c.parentId).slice(0, 10).map((category, index) => (
                        <motion.div
                          key={category.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.03, duration: 0.3, ease: v0Ease }}
                        >
                          <Link
                            href={`/categorias/${category.slug}`}
                            className="flex items-center gap-3 px-4 py-3 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-violet-50 dark:hover:bg-violet-500/10 transition-all duration-300 group"
                          >
                            {category.image ? (
                              <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 flex-shrink-0 group-hover:ring-2 ring-violet-500/30 transition-all duration-300 shadow-sm">
                                <Image
                                  src={category.image}
                                  alt={category.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-100 to-pink-100 dark:from-violet-500/10 dark:to-pink-500/10 flex items-center justify-center flex-shrink-0 group-hover:ring-2 ring-violet-500/30 transition-all duration-300">
                                <Grid3X3 className="w-5 h-5 text-violet-500 dark:text-violet-400" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <span className="block font-medium truncate group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                                {category.name}
                              </span>
                              {category._count?.products !== undefined && (
                                <span className="text-xs text-neutral-400 dark:text-white/40">
                                  {category._count.products} productos
                                </span>
                              )}
                            </div>
                          </Link>
                          {/* Subcategories */}
                          {category.children && category.children.length > 0 && (
                            <div className="ml-10 border-l-2 border-violet-100 dark:border-violet-500/20">
                              {category.children.slice(0, 4).map((child) => (
                                <Link
                                  key={child.id}
                                  href={`/categorias/${child.slug}`}
                                  className="flex items-center gap-2 pl-4 pr-4 py-2 text-sm text-neutral-500 dark:text-neutral-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-violet-300 dark:bg-violet-500/50" />
                                  <span>{child.name}</span>
                                </Link>
                              ))}
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>

                    {/* Ver todas link */}
                    <Link
                      href="/categorias"
                      className="flex items-center justify-center gap-2 px-4 py-4 text-sm font-medium text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-500/10 border-t border-neutral-100 dark:border-white/[0.06] transition-all duration-300"
                    >
                      <span>Ver todas las categorías</span>
                      <motion.span
                        animate={{ x: [0, 4, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                      >
                        →
                      </motion.span>
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link
              href="/productos"
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300",
                isTransparent
                  ? "text-white/80 hover:text-white hover:bg-white/10"
                  : "text-neutral-600 hover:text-violet-600 dark:text-neutral-400 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-500/10"
              )}
            >
              <Package className="w-4 h-4" />
              Productos
            </Link>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowSearch(true)}
              className={cn(
                "p-2.5 rounded-xl transition-all duration-300",
                isTransparent
                  ? "text-white/80 hover:text-white hover:bg-white/10"
                  : "text-neutral-500 hover:text-violet-600 dark:text-neutral-400 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-500/10"
              )}
            >
              <Search className="w-5 h-5" />
            </button>

            {settings.cartEnabled && (
              <button
                onClick={openCart}
                className={cn(
                  "relative p-2.5 rounded-xl transition-all duration-300",
                  isTransparent
                    ? "text-white/80 hover:text-white hover:bg-white/10"
                    : "text-neutral-500 hover:text-violet-600 dark:text-neutral-400 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-500/10"
                )}
              >
                <ShoppingCart className="w-5 h-5" />
                {cartItemCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-gradient-to-r from-violet-500 to-pink-500 text-white text-xs font-semibold rounded-full flex items-center justify-center shadow-lg shadow-violet-500/30"
                  >
                    {cartItemCount > 9 ? '9+' : cartItemCount}
                  </motion.span>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Search Modal */}
      <AnimatePresence>
        {showSearch && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSearch(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />

            {/* Search Container */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2, ease: v0Ease }}
              className="fixed top-0 left-0 right-0 z-50 p-4 pt-20 lg:pt-24"
            >
              <div className="max-w-2xl mx-auto">
                <form onSubmit={handleSearch} className="relative">
                  <div className="relative">
                    {isSearching ? (
                      <Loader2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-violet-500 animate-spin" />
                    ) : (
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-violet-500" />
                    )}
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Buscar productos..."
                      className="w-full pl-12 pr-12 py-4 bg-white dark:bg-[#12121a] rounded-2xl border border-violet-200 dark:border-violet-500/20 text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 shadow-2xl shadow-violet-500/20 text-lg"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSearch(false)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Search Results */}
                  <AnimatePresence>
                    {searchResults.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mt-2 bg-white dark:bg-[#12121a] rounded-2xl border border-violet-200 dark:border-violet-500/20 shadow-2xl shadow-violet-500/20 overflow-hidden max-h-[60vh] overflow-y-auto"
                      >
                        {searchResults.map((product, index) => (
                          <motion.button
                            key={product.id}
                            type="button"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.03 }}
                            onClick={() => handleResultClick(product.slug)}
                            className="w-full flex items-center gap-3 p-3 hover:bg-violet-50 dark:hover:bg-violet-500/10 transition-colors text-left border-b border-neutral-100 dark:border-white/5 last:border-0"
                          >
                            {/* Product Image */}
                            <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 flex-shrink-0">
                              {product.images?.[0]?.url ? (
                                <Image
                                  src={product.images[0].url}
                                  alt={product.name}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="w-5 h-5 text-neutral-400" />
                                </div>
                              )}
                            </div>

                            {/* Product Info */}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-neutral-900 dark:text-white truncate">
                                {product.name}
                              </p>
                              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                {product.category?.name}
                              </p>
                              {product.showPrice && (
                                <p className="text-sm font-semibold text-violet-600 dark:text-violet-400 mt-0.5">
                                  S/ {product.salePrice ? Number(product.salePrice).toFixed(2) : Number(product.price).toFixed(2)}
                                  {product.salePrice && (
                                    <span className="ml-2 text-xs text-neutral-400 line-through">
                                      S/ {Number(product.price).toFixed(2)}
                                    </span>
                                  )}
                                </p>
                              )}
                            </div>
                          </motion.button>
                        ))}

                        {/* Ver todos link */}
                        <button
                          type="submit"
                          className="w-full p-3 text-center text-sm font-medium text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-500/10 transition-colors"
                        >
                          Ver todos los resultados →
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* No results message */}
                  {searchQuery.trim() && !isSearching && searchResults.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-2 p-6 bg-white dark:bg-[#12121a] rounded-2xl border border-violet-200 dark:border-violet-500/20 text-center"
                    >
                      <Package className="w-10 h-10 mx-auto text-neutral-300 dark:text-neutral-600 mb-2" />
                      <p className="text-neutral-500 dark:text-neutral-400 text-sm">
                        No se encontraron productos para "{searchQuery}"
                      </p>
                    </motion.div>
                  )}

                  {/* Quick hints - only show when no query */}
                  {!searchQuery && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="text-xs text-white/60">Sugerencias:</span>
                      {['Ofertas', 'Nuevo', 'Popular'].map((hint) => (
                        <button
                          key={hint}
                          type="button"
                          onClick={() => {
                            setSearchQuery(hint);
                            searchInputRef.current?.focus();
                          }}
                          className="px-3 py-1 text-xs bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
                        >
                          {hint}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Press enter hint */}
                  {!searchQuery && (
                    <p className="mt-3 text-center text-xs text-white/40">
                      Escribe para buscar productos
                    </p>
                  )}
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
