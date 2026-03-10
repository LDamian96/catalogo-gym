'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Search, ShoppingCart, ChevronDown, Grid3X3, Home, Package, X, Loader2, Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCart } from '@/hooks/useCart';
import { v0Ease, dropdownVariants } from '@/lib/animations';
import type { CatalogSettings, CatalogCategory, CatalogProduct } from '@/lib/api/catalog';
import { searchCatalog } from '@/lib/api/catalog';

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
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearch]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowSearch(false);
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await searchCatalog({ q: query, limit: 8 });
      setSearchResults(response.products || []);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

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
    // Check initial scroll position on mount
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isTransparent = transparent && !isScrolled;

  return (
    <motion.header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 hidden lg:block',
        isTransparent
          ? 'bg-transparent'
          : isScrolled
            ? 'bg-white/80 dark:bg-[#000000]/80 backdrop-blur-xl backdrop-saturate-150 border-b border-neutral-200/50 dark:border-white/10 shadow-sm'
            : 'bg-white/40 dark:bg-[#000000]/40 backdrop-blur-xl backdrop-saturate-150 border-b border-white/30 dark:border-white/10'
      )}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: v0Ease }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Mobile Header - Native App Style */}
        <div className="flex lg:hidden items-center justify-between h-[56px]">
          <Link href="/" className="flex items-center gap-2.5">
            {settings.logo ? (
              <div className="relative w-8 h-8 rounded-full overflow-hidden">
                <Image
                  src={settings.logo}
                  alt={settings.businessName || 'Logo'}
                  fill
                  className="object-contain"
                />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-neutral-900 dark:bg-white flex items-center justify-center">
                <span className="text-white dark:text-neutral-900 font-bold text-sm">
                  {(settings.businessName || 'C')[0]}
                </span>
              </div>
            )}
            <span className={cn(
              "font-semibold text-[15px] truncate max-w-[140px]",
              isTransparent ? "text-white" : "text-neutral-900 dark:text-white"
            )}>
              {settings.businessName || 'Catálogo'}
            </span>
          </Link>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowSearch(true)}
              className={cn(
                "w-9 h-9 rounded-full flex items-center justify-center transition-colors",
                isTransparent
                  ? "text-white active:bg-white/10"
                  : "text-neutral-700 dark:text-neutral-300 active:bg-neutral-100 dark:active:bg-white/10"
              )}
            >
              <Search className="w-[20px] h-[20px]" />
            </button>
            {settings.cartEnabled && (
              <button
                onClick={openCart}
                className={cn(
                  "relative w-9 h-9 rounded-full flex items-center justify-center transition-colors",
                  isTransparent
                    ? "text-white active:bg-white/10"
                    : "text-neutral-700 dark:text-neutral-300 active:bg-neutral-100 dark:active:bg-white/10"
                )}
              >
                <ShoppingCart className="w-[20px] h-[20px]" />
                {cartItemCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {cartItemCount > 9 ? '9+' : cartItemCount}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3">
            {settings.logo ? (
              <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-br from-cyan-500 to-blue-500 dark:bg-[#1A1A1F] dark:border dark:border-white/10">
                <Image
                  src={settings.logo}
                  alt={settings.businessName || 'Logo'}
                  fill
                  className="object-contain"
                />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 dark:bg-[#1A1A1F] dark:border dark:border-white/10 flex items-center justify-center">
                <span className="text-white font-bold text-xl">
                  {(settings.businessName || 'C')[0]}
                </span>
              </div>
            )}
            <span className={cn(
              "font-bold text-lg",
              isTransparent ? "text-white" : "text-neutral-900 dark:text-white/90"
            )}>
              {settings.businessName || 'Catálogo'}
            </span>
          </Link>

          <nav className="flex items-center gap-1">
            <Link
              href="/"
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                isTransparent
                  ? "text-white/90 hover:text-white hover:bg-white/10"
                  : "text-neutral-600 dark:text-white/70 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/10"
              )}
            >
              <Home className="w-4 h-4" />
              Inicio
            </Link>

            <div
              className="relative"
              onMouseEnter={() => setShowCategories(true)}
              onMouseLeave={() => setShowCategories(false)}
            >
              <Link
                href="/categorias"
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  isTransparent
                    ? "text-white/90 hover:text-white hover:bg-white/10"
                    : "text-neutral-600 dark:text-white/70 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/10"
                )}
              >
                <Grid3X3 className="w-4 h-4" />
                Categorías
                <ChevronDown className={cn(
                  'w-4 h-4 transition-transform duration-200',
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
                    className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-[#1A1A1F] rounded-xl border border-neutral-200 dark:border-white/10 shadow-xl overflow-hidden"
                  >
                    <div className="py-2 max-h-[60vh] overflow-y-auto">
                      {categories.filter(c => c.level === 0 || !c.parentId).slice(0, 8).map((category) => (
                        <Link
                          key={category.id}
                          href={`/categorias/${category.slug}`}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 dark:hover:bg-white/5 transition-colors"
                        >
                          {category.image ? (
                            <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-neutral-100 dark:bg-white/10 flex-shrink-0">
                              <Image
                                src={category.image}
                                alt={category.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 dark:bg-white/10 flex items-center justify-center flex-shrink-0">
                              <Grid3X3 className="w-5 h-5 text-white" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <span className="block font-medium text-neutral-900 dark:text-white text-sm">
                              {category.name}
                            </span>
                            {category._count?.products !== undefined && (
                              <span className="text-xs text-neutral-500 dark:text-white/50">
                                {category._count.products} productos
                              </span>
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>
                    <Link
                      href="/categorias"
                      className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-cyan-500 dark:text-white hover:bg-cyan-50 dark:hover:bg-white/5 border-t border-neutral-100 dark:border-white/10 transition-colors"
                    >
                      Ver todas las categorías
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link
              href="/productos"
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                isTransparent
                  ? "text-white/90 hover:text-white hover:bg-white/10"
                  : "text-neutral-600 dark:text-white/70 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/10"
              )}
            >
              <Package className="w-4 h-4" />
              Productos
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            {mounted && (
              <motion.button
                onClick={toggleTheme}
                className={cn(
                  "p-2.5 rounded-xl transition-colors",
                  isTransparent
                    ? "bg-black/20 text-white hover:bg-black/30"
                    : "bg-neutral-100 dark:bg-white/10 text-neutral-700 dark:text-white hover:bg-neutral-200 dark:hover:bg-white/20"
                )}
                whileTap={{ scale: 0.95 }}
                title={resolvedTheme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
              >
                {resolvedTheme === 'dark' ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </motion.button>
            )}
            <motion.button
              onClick={() => setShowSearch(true)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors",
                isTransparent
                  ? "bg-black/20 text-white hover:bg-black/30"
                  : "bg-[#1A1A1F] text-white hover:bg-[#252530]"
              )}
              whileTap={{ scale: 0.98 }}
            >
              <Search className="w-4 h-4" />
              Buscar
            </motion.button>

            {settings.cartEnabled && (
              <motion.button
                onClick={openCart}
                className="relative flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 dark:bg-[#1A1A1F] dark:border dark:border-white/10 text-white text-sm font-medium"
                whileTap={{ scale: 0.98 }}
              >
                <ShoppingCart className="w-4 h-4" />
                Carrito
                {cartItemCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 bg-white text-cyan-500 dark:text-neutral-900 text-xs font-bold rounded-full min-w-[20px] text-center">
                    {cartItemCount > 9 ? '9+' : cartItemCount}
                  </span>
                )}
              </motion.button>
            )}
          </div>
        </div>
      </div>

      {/* Search Modal */}
      <AnimatePresence>
        {showSearch && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSearch(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />

            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="fixed top-0 left-0 right-0 z-50 p-4 pt-20"
            >
              <div className="max-w-xl mx-auto">
                <form onSubmit={handleSearch}>
                  <div className="relative bg-white dark:bg-[#1A1A1F] rounded-2xl overflow-hidden shadow-2xl border border-neutral-200 dark:border-white/10">
                    <div className="flex items-center">
                      {isSearching ? (
                        <Loader2 className="absolute left-4 w-5 h-5 text-neutral-400 animate-spin" />
                      ) : (
                        <Search className="absolute left-4 w-5 h-5 text-neutral-400" />
                      )}
                      <input
                        ref={searchInputRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Buscar productos..."
                        className="w-full pl-12 pr-12 py-4 bg-transparent text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSearch(false)}
                        className="absolute right-3 p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/10 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Search Results */}
                  <AnimatePresence>
                    {searchResults.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mt-3 bg-white dark:bg-[#1A1A1F] rounded-2xl border border-neutral-200 dark:border-white/10 shadow-xl overflow-hidden max-h-[50vh] overflow-y-auto"
                      >
                        <div className="px-4 py-2 border-b border-neutral-100 dark:border-white/10">
                          <p className="text-sm text-neutral-500 dark:text-white/50">
                            {searchResults.length} resultado{searchResults.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                        {searchResults.map((product) => (
                          <button
                            key={product.id}
                            type="button"
                            onClick={() => handleResultClick(product.slug)}
                            className="w-full flex items-center gap-3 p-3 hover:bg-neutral-50 dark:hover:bg-white/5 transition-colors text-left border-b border-neutral-100 dark:border-white/5 last:border-0"
                          >
                            <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-neutral-100 dark:bg-white/10 flex-shrink-0">
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
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-neutral-900 dark:text-white truncate text-sm">
                                {product.name}
                              </p>
                              <p className="text-xs text-neutral-500 dark:text-white/50">
                                {product.category?.name}
                              </p>
                              {product.showPrice && (
                                <p className="text-sm font-bold text-cyan-500 dark:text-white mt-0.5">
                                  S/ {product.salePrice ? Number(product.salePrice).toFixed(2) : Number(product.price).toFixed(2)}
                                </p>
                              )}
                            </div>
                          </button>
                        ))}
                        <button
                          type="submit"
                          className="w-full p-3 text-center text-sm font-medium text-cyan-500 dark:text-white hover:bg-cyan-50 dark:hover:bg-white/5 transition-colors"
                        >
                          Ver todos los resultados
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* No Results */}
                  {searchQuery.trim() && !isSearching && searchResults.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-3 p-6 bg-white dark:bg-[#1A1A1F] rounded-2xl border border-neutral-200 dark:border-white/10 text-center"
                    >
                      <Package className="w-10 h-10 mx-auto mb-3 text-neutral-300 dark:text-white/20" />
                      <p className="text-neutral-500 dark:text-white/50 text-sm">
                        No se encontraron productos
                      </p>
                    </motion.div>
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
