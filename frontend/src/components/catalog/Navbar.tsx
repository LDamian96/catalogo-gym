'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, Search, ShoppingCart, ChevronDown, Store } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCart } from '@/hooks/useCart';
import type { CatalogSettings, CatalogCategory } from '@/lib/api/catalog';

interface NavbarProps {
  settings: CatalogSettings;
  categories: CatalogCategory[];
  transparent?: boolean;
}

export function Navbar({ settings, categories, transparent = false }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const { items } = useCart();

  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isTransparent = transparent && !isScrolled;

  return (
    <>
      <motion.header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
          isTransparent
            ? 'bg-transparent'
            : 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-lg shadow-black/5'
        )}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo / Brand */}
            <Link href="/" className="flex items-center gap-3 group">
              {settings.logo ? (
                <div className="relative w-10 h-10 lg:w-11 lg:h-11 rounded-xl overflow-hidden ring-2 ring-transparent group-hover:ring-violet-500/50 transition-all">
                  <Image
                    src={settings.logo}
                    alt={settings.businessName || 'Logo'}
                    fill
                    className="object-contain"
                  />
                </div>
              ) : (
                <div className={cn(
                  'w-10 h-10 lg:w-11 lg:h-11 rounded-xl flex items-center justify-center transition-all',
                  isTransparent
                    ? 'bg-white/20 backdrop-blur-sm'
                    : 'bg-gradient-to-br from-violet-500 to-fuchsia-500'
                )}>
                  <Store className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                </div>
              )}
              {settings.businessName && (
                <div className="hidden sm:block">
                  <span className={cn(
                    'font-bold text-lg tracking-tight transition-colors',
                    isTransparent ? 'text-white' : 'text-slate-900 dark:text-white'
                  )}>
                    {settings.businessName}
                  </span>
                </div>
              )}
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              <NavLink href="/" isTransparent={isTransparent}>
                Inicio
              </NavLink>

              {/* Categories Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setShowCategories(true)}
                onMouseLeave={() => setShowCategories(false)}
              >
                <button className={cn(
                  'flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium transition-all',
                  isTransparent
                    ? 'text-white/90 hover:text-white hover:bg-white/10'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                )}>
                  Categorías
                  <ChevronDown className={cn(
                    'w-4 h-4 transition-transform',
                    showCategories && 'rotate-180'
                  )} />
                </button>

                <AnimatePresence>
                  {showCategories && categories.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-black/10 dark:shadow-black/30 border border-slate-200 dark:border-slate-800 overflow-hidden"
                    >
                      <div className="py-2 max-h-[70vh] overflow-y-auto">
                        {/* Solo mostrar categorías raíz (level 0) */}
                        {categories.filter(c => c.level === 0 || !c.parentId).slice(0, 10).map((category) => (
                          <div key={category.id}>
                            <Link
                              href={`/categorias/${category.slug}`}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-violet-50 dark:hover:bg-violet-500/10 hover:text-violet-600 dark:hover:text-violet-400 transition-colors font-medium"
                            >
                              {category.image && (
                                <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                                  <Image
                                    src={category.image}
                                    alt={category.name}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                              )}
                              <span>{category.name}</span>
                              {category._count?.products && (
                                <span className="ml-auto text-xs text-slate-400">
                                  {category._count.products}
                                </span>
                              )}
                            </Link>
                            {/* Subcategorías */}
                            {category.children && category.children.length > 0 && (
                              <div className="ml-6 border-l-2 border-slate-100 dark:border-slate-800">
                                {category.children.slice(0, 5).map((child) => (
                                  <Link
                                    key={child.id}
                                    href={`/categorias/${child.slug}`}
                                    className="flex items-center gap-2 pl-4 pr-4 py-2 text-sm text-slate-500 dark:text-slate-400 hover:bg-violet-50 dark:hover:bg-violet-500/10 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                                  >
                                    <span>{child.name}</span>
                                    {child._count?.products && (
                                      <span className="ml-auto text-xs text-slate-400">
                                        {child._count.products}
                                      </span>
                                    )}
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                        <Link
                          href="/categorias"
                          className="block px-4 py-2.5 text-sm font-medium text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-500/10 border-t border-slate-100 dark:border-slate-800 mt-1"
                        >
                          Ver todas las categorías
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <NavLink href="/buscar" isTransparent={isTransparent}>
                Productos
              </NavLink>
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {/* Search Button */}
              <Link
                href="/buscar"
                className={cn(
                  'p-2.5 rounded-full transition-all',
                  isTransparent
                    ? 'text-white/90 hover:text-white hover:bg-white/10'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                )}
              >
                <Search className="w-5 h-5" />
              </Link>

              {/* Cart Button */}
              {settings.cartEnabled && (
                <Link
                  href="/carrito"
                  className={cn(
                    'relative p-2.5 rounded-full transition-all',
                    isTransparent
                      ? 'text-white/90 hover:text-white hover:bg-white/10'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  )}
                >
                  <ShoppingCart className="w-5 h-5" />
                  {cartItemCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
                    >
                      {cartItemCount > 9 ? '9+' : cartItemCount}
                    </motion.span>
                  )}
                </Link>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className={cn(
                  'lg:hidden p-2.5 rounded-full transition-all',
                  isTransparent
                    ? 'text-white/90 hover:text-white hover:bg-white/10'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                )}
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              className="fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] bg-white dark:bg-slate-900 z-50 shadow-2xl"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  {settings.logo ? (
                    <div className="relative w-9 h-9 rounded-xl overflow-hidden">
                      <Image
                        src={settings.logo}
                        alt={settings.businessName || 'Logo'}
                        fill
                        className="object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                      <Store className="w-5 h-5 text-white" />
                    </div>
                  )}
                  <span className="font-bold text-slate-900 dark:text-white">
                    {settings.businessName || 'Menú'}
                  </span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="p-4 space-y-1">
                <MobileNavLink href="/" onClick={() => setIsMobileMenuOpen(false)}>
                  Inicio
                </MobileNavLink>
                <MobileNavLink href="/categorias" onClick={() => setIsMobileMenuOpen(false)}>
                  Categorías
                </MobileNavLink>
                <MobileNavLink href="/buscar" onClick={() => setIsMobileMenuOpen(false)}>
                  Productos
                </MobileNavLink>
                {settings.cartEnabled && (
                  <MobileNavLink href="/carrito" onClick={() => setIsMobileMenuOpen(false)}>
                    <span className="flex items-center justify-between w-full">
                      Carrito
                      {cartItemCount > 0 && (
                        <span className="px-2 py-0.5 text-xs font-bold bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 rounded-full">
                          {cartItemCount}
                        </span>
                      )}
                    </span>
                  </MobileNavLink>
                )}
              </nav>

              {/* Categories */}
              {categories.length > 0 && (
                <div className="px-4 pt-2 pb-4 border-t border-slate-100 dark:border-slate-800">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-4">
                    Categorías
                  </h3>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {categories.slice(0, 6).map((category) => (
                      <Link
                        key={category.id}
                        href={`/categorias/${category.slug}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        {category.image && (
                          <div className="relative w-7 h-7 rounded-md overflow-hidden bg-slate-100 dark:bg-slate-800">
                            <Image
                              src={category.image}
                              alt={category.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <span className="text-sm">{category.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function NavLink({
  href,
  children,
  isTransparent,
}: {
  href: string;
  children: React.ReactNode;
  isTransparent: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'px-4 py-2 rounded-full text-sm font-medium transition-all',
        isTransparent
          ? 'text-white/90 hover:text-white hover:bg-white/10'
          : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
      )}
    >
      {children}
    </Link>
  );
}

function MobileNavLink({
  href,
  children,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center px-4 py-3 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium transition-colors"
    >
      {children}
    </Link>
  );
}
