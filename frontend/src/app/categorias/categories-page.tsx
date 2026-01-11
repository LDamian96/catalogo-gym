'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, Home, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Navbar, Footer, WhatsAppButton } from '@/components/catalog';
import type { CatalogSettings, CatalogCategory } from '@/lib/api/catalog';
import { staggerContainer, staggerItem } from '@/lib/animations';

interface CategoriesPageProps {
  categories: CatalogCategory[];
  settings: CatalogSettings;
}

export function CategoriesPage({ categories, settings }: CategoriesPageProps) {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Navbar */}
      <Navbar settings={settings} categories={categories} />

      {/* Spacer for fixed navbar */}
      <div className="h-16 md:h-20" />

      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 via-violet-900/50 to-slate-900">
        <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
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
            <span className="text-white font-medium">Categorías</span>
          </motion.nav>

          {/* Title */}
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="p-3 bg-violet-500/20 rounded-xl">
              <Layers className="w-8 h-8 text-violet-400" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                Categorías
              </h1>
              <p className="text-white/60 mt-1">
                {categories.length} {categories.length === 1 ? 'categoría disponible' : 'categorías disponibles'}
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Categories Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {categories.map((category, index) => (
              <motion.div key={category.id} variants={staggerItem}>
                <Link
                  href={`/categorias/${category.slug}`}
                  className="group block"
                >
                  <div className={cn(
                    'relative h-64 rounded-2xl overflow-hidden',
                    'bg-gradient-to-br from-violet-500 to-fuchsia-600',
                    'transition-transform duration-300 group-hover:scale-[1.02]',
                    'shadow-lg group-hover:shadow-xl'
                  )}>
                    {category.image ? (
                      <>
                        <Image
                          src={category.image}
                          alt={category.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                      </>
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-violet-600 to-fuchsia-600" />
                    )}

                    {/* Content */}
                    <div className="absolute inset-0 flex flex-col justify-end p-6">
                      <h2 className="text-2xl font-bold text-white mb-2">
                        {category.name}
                      </h2>
                      {category.description && (
                        <p className="text-white/70 text-sm line-clamp-2 mb-3">
                          {category.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-white/60 text-sm">
                          {category._count?.products || 0} productos
                        </span>
                        <span className="flex items-center gap-1 text-white font-medium text-sm group-hover:gap-2 transition-all">
                          Ver productos
                          <ChevronRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>

          {/* Empty State */}
          {categories.length === 0 && (
            <motion.div
              className="text-center py-20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <Layers className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                No hay categorías
              </h3>
              <p className="text-slate-500 dark:text-slate-400">
                Aún no se han creado categorías
              </p>
            </motion.div>
          )}
        </div>
      </section>

      {/* Footer */}
      <Footer settings={settings} categories={categories} />

      {/* WhatsApp */}
      {settings.whatsapp && (
        <WhatsAppButton
          phoneNumber={settings.whatsapp}
          businessName={settings.businessName || 'nosotros'}
        />
      )}
    </div>
  );
}
