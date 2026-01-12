'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Search, ShoppingCart, ChevronDown, Sparkles, Grid3X3, Home, Package } from 'lucide-react';
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
    <motion.header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        isTransparent
          ? 'bg-white/50 backdrop-blur-md'
          : 'bg-white/85 backdrop-blur-xl shadow-sm'
      )}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Mobile Header - Minimalista estilo app */}
        <div className="flex lg:hidden items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2">
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
                <Sparkles className="w-5 h-5 text-white" />
              </div>
            )}
            <span className="font-semibold text-slate-800 truncate max-w-[150px]">
              {settings.businessName || 'Catálogo'}
            </span>
          </Link>

          {/* Mobile: Solo icono de búsqueda y carrito */}
          <div className="flex items-center gap-1">
            <Link
              href="/productos"
              className="p-2 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all"
            >
              <Search className="w-5 h-5" />
            </Link>
            {settings.cartEnabled && (
              <Link
                href="/carrito"
                className="relative p-2 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-violet-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {cartItemCount > 9 ? '9+' : cartItemCount}
                  </span>
                )}
              </Link>
            )}
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:flex items-center justify-between h-20">
          {/* Logo / Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            {settings.logo ? (
              <div className="relative w-11 h-11 rounded-xl overflow-hidden ring-1 ring-slate-200 group-hover:ring-slate-300 transition-all">
                <Image
                  src={settings.logo}
                  alt={settings.businessName || 'Logo'}
                  fill
                  className="object-contain"
                />
              </div>
            ) : (
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
            )}
            {settings.businessName && (
              <span className="font-bold text-lg text-slate-800">
                {settings.businessName}
              </span>
            )}
          </Link>

          {/* Desktop Navigation */}
          <nav className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              <Home className="w-4 h-4" />
              Inicio
            </Link>

            {/* Categories Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setShowCategories(true)}
              onMouseLeave={() => setShowCategories(false)}
            >
              <button className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                <Grid3X3 className="w-4 h-4" />
                Categorías
                <ChevronDown className={cn(
                  'w-4 h-4 transition-transform',
                  showCategories && 'rotate-180'
                )} />
              </button>

              <AnimatePresence>
                {showCategories && categories.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 mt-3 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
                  >
                    <div className="py-2 max-h-[60vh] overflow-y-auto">
                      {categories.filter(c => c.level === 0 || !c.parentId).slice(0, 10).map((category) => (
                        <div key={category.id}>
                          <Link
                            href={`/categorias/${category.slug}`}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                          >
                            {category.image ? (
                              <div className="relative w-9 h-9 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                                <Image
                                  src={category.image}
                                  alt={category.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                                <Grid3X3 className="w-4 h-4 text-slate-400" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <span className="block font-medium truncate">{category.name}</span>
                              {category._count?.products && (
                                <span className="text-xs text-slate-400">
                                  {category._count.products} productos
                                </span>
                              )}
                            </div>
                          </Link>
                          {/* Subcategorías */}
                          {category.children && category.children.length > 0 && (
                            <div className="ml-6 border-l border-slate-200">
                              {category.children.slice(0, 5).map((child) => (
                                <Link
                                  key={child.id}
                                  href={`/categorias/${child.slug}`}
                                  className="flex items-center gap-2 pl-4 pr-4 py-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors"
                                >
                                  <span>{child.name}</span>
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    <Link
                      href="/categorias"
                      className="block px-4 py-3 text-sm font-medium text-center text-violet-600 hover:bg-slate-50 border-t border-slate-100 transition-colors"
                    >
                      Ver todas las categorías
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link href="/productos" className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              <Package className="w-4 h-4" />
              Productos
            </Link>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-1">
            <Link
              href="/productos"
              className="p-2.5 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all"
            >
              <Search className="w-5 h-5" />
            </Link>

            {settings.cartEnabled && (
              <Link
                href="/carrito"
                className="relative p-2.5 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartItemCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-violet-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
                  >
                    {cartItemCount > 9 ? '9+' : cartItemCount}
                  </motion.span>
                )}
              </Link>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
}
