'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Search, ShoppingCart, ChevronDown, Grid3X3, Home, Package, Zap, X, Loader2, Sparkles, Star, Crown } from 'lucide-react';
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
      const response = await catalogApi.getProducts({ search: query, limit: 8 });
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
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isTransparent = transparent && !isScrolled;

  return (
    <motion.header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        isTransparent
          ? 'bg-transparent'
          : 'bg-gradient-to-r from-cyan-600/95 via-blue-600/95 to-purple-600/95 dark:from-cyan-900/95 dark:via-blue-900/95 dark:to-purple-900/95 backdrop-blur-xl shadow-lg shadow-cyan-500/20'
      )}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: v0Ease }}
    >
      {/* Animated bottom border */}
      <motion.div
        className={cn(
          'absolute bottom-0 left-0 right-0 h-[2px] transition-opacity duration-500',
          isTransparent ? 'opacity-0' : 'opacity-100'
        )}
        style={{
          background: 'linear-gradient(90deg, transparent, #22d3ee, #3b82f6, #a855f7, transparent)',
        }}
        animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Mobile Header */}
        <div className="flex lg:hidden items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5 group">
            {settings.logo ? (
              <motion.div
                className="relative w-10 h-10 rounded-xl overflow-hidden ring-2 ring-white/30 shadow-lg shadow-cyan-500/30"
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <Image
                  src={settings.logo}
                  alt={settings.businessName || 'Logo'}
                  fill
                  className="object-contain"
                />
              </motion.div>
            ) : (
              <motion.div
                className="w-10 h-10 rounded-xl bg-white shadow-lg shadow-white/30 flex items-center justify-center"
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-transparent bg-clip-text bg-gradient-to-br from-cyan-600 to-purple-600 font-bold text-lg">
                  {(settings.businessName || 'C')[0]}
                </span>
              </motion.div>
            )}
            <div className="flex flex-col">
              <span className="font-bold text-white truncate max-w-[120px] drop-shadow-md">
                {settings.businessName || 'Catálogo'}
              </span>
              <span className="text-[10px] text-white/70 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Online
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <motion.button
              onClick={() => setShowSearch(true)}
              className="p-2.5 rounded-xl bg-white/20 text-white hover:bg-white/30 transition-all duration-300 shadow-lg"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Search className="w-5 h-5" />
            </motion.button>
            {settings.cartEnabled && (
              <motion.button
                onClick={openCart}
                className="relative p-2.5 rounded-xl bg-white/20 text-white hover:bg-white/30 transition-all duration-300 shadow-lg"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ShoppingCart className="w-5 h-5" />
                {cartItemCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg shadow-orange-500/50 ring-2 ring-white"
                  >
                    {cartItemCount > 9 ? '9+' : cartItemCount}
                  </motion.span>
                )}
              </motion.button>
            )}
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:flex items-center justify-between h-18 py-3">
          <Link href="/" className="flex items-center gap-4 group">
            {settings.logo ? (
              <motion.div
                className="relative w-12 h-12 rounded-xl overflow-hidden ring-2 ring-white/40 shadow-xl shadow-cyan-500/30"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: 'spring', stiffness: 400 }}
              >
                <Image
                  src={settings.logo}
                  alt={settings.businessName || 'Logo'}
                  fill
                  className="object-contain"
                />
              </motion.div>
            ) : (
              <motion.div
                className="w-12 h-12 rounded-xl bg-white shadow-xl shadow-white/30 flex items-center justify-center"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: 'spring', stiffness: 400 }}
              >
                <span className="text-transparent bg-clip-text bg-gradient-to-br from-cyan-600 to-purple-600 font-black text-xl">
                  {(settings.businessName || 'C')[0]}
                </span>
              </motion.div>
            )}
            {settings.businessName && (
              <div className="flex flex-col">
                <span className="font-bold text-lg text-white drop-shadow-lg">
                  {settings.businessName}
                </span>
                <span className="text-xs text-white/80 flex items-center gap-1">
                  <Crown className="w-3 h-3 text-amber-400" />
                  Catálogo Premium
                </span>
              </div>
            )}
          </Link>

          <nav className="flex items-center gap-0.5">
            <Link
              href="/"
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium text-white/90 hover:text-white hover:bg-white/15 transition-all duration-300"
            >
              <Home className="w-3.5 h-3.5" />
              Inicio
            </Link>

            <div
              className="relative"
              onMouseEnter={() => setShowCategories(true)}
              onMouseLeave={() => setShowCategories(false)}
            >
              <Link
                href="/categorias"
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium text-white/90 hover:text-white hover:bg-white/15 transition-all duration-300"
              >
                <Grid3X3 className="w-3.5 h-3.5" />
                Categorías
                <ChevronDown className={cn(
                  'w-3.5 h-3.5 transition-transform duration-300',
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
                    className="absolute top-full left-0 mt-3 w-96 bg-gradient-to-br from-white to-cyan-50 dark:from-neutral-900 dark:to-cyan-950 rounded-2xl border-2 border-cyan-200 dark:border-cyan-500/30 overflow-hidden shadow-2xl shadow-cyan-500/30"
                  >
                    {/* Header con gradiente */}
                    <div className="px-5 py-4 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-lg">
                          <Zap className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">
                            Explorar Categorías
                          </p>
                          <p className="text-xs text-white/70">
                            Encuentra lo que buscas
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="py-3 max-h-[50vh] overflow-y-auto">
                      {categories.filter(c => c.level === 0 || !c.parentId).slice(0, 8).map((category, index) => (
                        <motion.div
                          key={category.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05, duration: 0.3, ease: v0Ease }}
                        >
                          <Link
                            href={`/categorias/${category.slug}`}
                            className="flex items-center gap-4 px-5 py-3 text-sm hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50 dark:hover:from-cyan-950/50 dark:hover:to-blue-950/50 transition-all duration-300 group"
                          >
                            {category.image ? (
                              <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gradient-to-br from-cyan-100 to-blue-100 dark:from-cyan-900 dark:to-blue-900 flex-shrink-0 ring-2 ring-transparent group-hover:ring-cyan-400 transition-all duration-300 shadow-md">
                                <Image
                                  src={category.image}
                                  alt={category.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center flex-shrink-0 ring-2 ring-transparent group-hover:ring-cyan-400 transition-all duration-300 shadow-md">
                                <Grid3X3 className="w-6 h-6 text-white" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <span className="block font-bold text-neutral-800 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                                {category.name}
                              </span>
                              {category._count?.products !== undefined && (
                                <span className="text-xs text-cyan-600 dark:text-cyan-400 font-medium">
                                  {category._count.products} productos disponibles
                                </span>
                              )}
                            </div>
                            <motion.span
                              className="text-cyan-500 opacity-0 group-hover:opacity-100"
                              initial={{ x: -10 }}
                              whileHover={{ x: 0 }}
                            >
                              →
                            </motion.span>
                          </Link>
                        </motion.div>
                      ))}
                    </div>

                    <Link
                      href="/categorias"
                      className="flex items-center justify-center gap-2 px-5 py-4 text-sm font-bold text-white bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-600 hover:via-blue-700 hover:to-purple-700 transition-all duration-300"
                    >
                      <Star className="w-4 h-4" />
                      <span>Ver todas las categorías</span>
                      <motion.span
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1, repeat: Infinity }}
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
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium text-white/90 hover:text-white hover:bg-white/15 transition-all duration-300"
            >
              <Package className="w-3.5 h-3.5" />
              Productos
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            {/* Search Button */}
            <motion.button
              onClick={() => setShowSearch(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-medium transition-all duration-300 shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Search className="w-4 h-4" />
              <span className="text-sm">Buscar</span>
            </motion.button>

            {/* Cart Button */}
            {settings.cartEnabled && (
              <motion.button
                onClick={openCart}
                className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-cyan-600 font-bold transition-all duration-300 shadow-xl shadow-white/30"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ShoppingCart className="w-5 h-5" />
                <span className="text-sm">Carrito</span>
                {cartItemCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg shadow-orange-500/50 ring-2 ring-white"
                  >
                    {cartItemCount > 9 ? '9+' : cartItemCount}
                  </motion.span>
                )}
              </motion.button>
            )}
          </div>
        </div>
      </div>

      {/* Search Modal - Vibrant */}
      <AnimatePresence>
        {showSearch && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSearch(false)}
              className="fixed inset-0 bg-gradient-to-br from-cyan-900/80 via-blue-900/80 to-purple-900/80 backdrop-blur-md z-50"
            />

            <motion.div
              initial={{ opacity: 0, y: -30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 0.9 }}
              transition={{ duration: 0.3, ease: v0Ease }}
              className="fixed top-0 left-0 right-0 z-50 p-4 pt-24 lg:pt-28"
            >
              <div className="max-w-2xl mx-auto">
                <form onSubmit={handleSearch} className="relative">
                  {/* Search Input Container */}
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-2xl blur-sm" />
                    <div className="relative bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden">
                      <div className="flex items-center">
                        {isSearching ? (
                          <Loader2 className="absolute left-5 w-6 h-6 text-cyan-500 animate-spin" />
                        ) : (
                          <Search className="absolute left-5 w-6 h-6 text-cyan-500" />
                        )}
                        <input
                          ref={searchInputRef}
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="¿Qué estás buscando hoy?"
                          className="w-full pl-14 pr-14 py-5 bg-transparent text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none text-lg font-medium"
                        />
                        <button
                          type="button"
                          onClick={() => setShowSearch(false)}
                          className="absolute right-4 p-2 rounded-xl text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all duration-200"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Search Results */}
                  <AnimatePresence>
                    {searchResults.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        className="mt-4 bg-white dark:bg-neutral-900 rounded-2xl border-2 border-cyan-200 dark:border-cyan-500/30 shadow-2xl shadow-cyan-500/20 overflow-hidden max-h-[55vh] overflow-y-auto"
                      >
                        <div className="px-5 py-3 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-950/50 dark:to-blue-950/50 border-b border-cyan-100 dark:border-cyan-500/20">
                          <p className="text-sm font-semibold text-cyan-700 dark:text-cyan-400 flex items-center gap-2">
                            <Sparkles className="w-4 h-4" />
                            {searchResults.length} productos encontrados
                          </p>
                        </div>
                        {searchResults.map((product, index) => (
                          <motion.button
                            key={product.id}
                            type="button"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => handleResultClick(product.slug)}
                            className="w-full flex items-center gap-4 p-4 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50 dark:hover:from-cyan-950/30 dark:hover:to-blue-950/30 transition-colors text-left border-b border-neutral-100 dark:border-neutral-800 last:border-0 group"
                          >
                            <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-cyan-100 to-blue-100 dark:from-cyan-900 dark:to-blue-900 flex-shrink-0 ring-2 ring-transparent group-hover:ring-cyan-400 transition-all duration-300">
                              {product.images?.[0]?.url ? (
                                <Image
                                  src={product.images[0].url}
                                  alt={product.name}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="w-6 h-6 text-cyan-400" />
                                </div>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-neutral-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 truncate transition-colors">
                                {product.name}
                              </p>
                              <p className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1 mt-1">
                                <Grid3X3 className="w-3 h-3" />
                                {product.category?.name}
                              </p>
                              {product.showPrice && (
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-sm font-bold text-cyan-600 dark:text-cyan-400">
                                    S/ {product.salePrice ? Number(product.salePrice).toFixed(2) : Number(product.price).toFixed(2)}
                                  </span>
                                  {product.salePrice && (
                                    <span className="text-xs text-neutral-400 line-through">
                                      S/ {Number(product.price).toFixed(2)}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                            <span className="text-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                          </motion.button>
                        ))}

                        <button
                          type="submit"
                          className="w-full p-4 text-center text-sm font-bold text-white bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-600 hover:via-blue-700 hover:to-purple-700 transition-all duration-300"
                        >
                          Ver todos los resultados →
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* No Results */}
                  {searchQuery.trim() && !isSearching && searchResults.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-4 p-8 bg-white dark:bg-neutral-900 rounded-2xl border-2 border-cyan-200 dark:border-cyan-500/30 text-center"
                    >
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-cyan-100 to-blue-100 dark:from-cyan-900/50 dark:to-blue-900/50 flex items-center justify-center">
                        <Package className="w-8 h-8 text-cyan-500" />
                      </div>
                      <p className="text-neutral-500 dark:text-neutral-400">
                        No encontramos productos para "<span className="font-semibold text-cyan-600 dark:text-cyan-400">{searchQuery}</span>"
                      </p>
                      <p className="text-sm text-neutral-400 mt-2">Intenta con otras palabras</p>
                    </motion.div>
                  )}

                  {/* Suggestions */}
                  {!searchQuery && (
                    <>
                      <div className="mt-5 flex flex-wrap gap-2 justify-center">
                        <span className="text-sm text-white/70">Populares:</span>
                        {['Ofertas', 'Nuevo', 'Popular', 'Destacados'].map((hint) => (
                          <motion.button
                            key={hint}
                            type="button"
                            onClick={() => {
                              setSearchQuery(hint);
                              searchInputRef.current?.focus();
                            }}
                            className="px-4 py-2 text-sm font-medium bg-white/20 hover:bg-white/30 text-white rounded-xl transition-all duration-300 shadow-lg"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {hint}
                          </motion.button>
                        ))}
                      </div>

                      <p className="mt-5 text-center text-sm text-white/60 flex items-center justify-center gap-2">
                        <Sparkles className="w-4 h-4 text-cyan-400" />
                        Escribe para buscar productos increíbles
                      </p>
                    </>
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
