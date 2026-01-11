'use client';

import { motion } from 'framer-motion';
import { ShoppingBag, Eye, Sparkles, Heart, Star } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { CatalogProduct } from '@/lib/api/catalog';

interface ProductCardProps {
  product: CatalogProduct;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const price = Number(product.price);
  const salePrice = product.salePrice ? Number(product.salePrice) : null;
  const discount = salePrice ? Math.round(((price - salePrice) / price) * 100) : 0;
  const mainImage = product.images?.[0]?.url;
  const secondImage = product.images?.[1]?.url;
  const hasVariants = (product._count?.variants || 0) > 0;

  return (
    <Link href={`/productos/${product.slug}`}>
      <motion.article
        className={cn(
          'group relative h-full flex flex-col overflow-hidden rounded-2xl',
          'bg-white dark:bg-slate-900',
          'border border-slate-100 dark:border-slate-800',
          'shadow-sm hover:shadow-xl',
          'transition-all duration-500 ease-out',
          'hover:-translate-y-1'
        )}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.4,
          delay: index * 0.05,
          ease: [0.25, 0.1, 0.25, 1],
        }}
        whileHover={{ scale: 1.02 }}
      >
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-slate-50 dark:bg-slate-800">
          {/* Main Image */}
          {mainImage ? (
            <>
              <Image
                src={mainImage}
                alt={product.name}
                fill
                className={cn(
                  'object-cover transition-all duration-700 ease-out',
                  'group-hover:scale-110',
                  secondImage && 'group-hover:opacity-0'
                )}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              />
              {/* Second Image on Hover */}
              {secondImage && (
                <Image
                  src={secondImage}
                  alt={`${product.name} - Vista 2`}
                  fill
                  className="object-cover transition-all duration-700 ease-out opacity-0 group-hover:opacity-100 group-hover:scale-110"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                />
              )}
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
              <ShoppingBag className="w-12 h-12 text-slate-300 dark:text-slate-600" />
            </div>
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Quick View Button */}
          <motion.div
            className="absolute bottom-4 left-1/2 -translate-x-1/2"
            initial={{ opacity: 0, y: 20 }}
            whileHover={{ opacity: 1, y: 0 }}
          >
            <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
              <span className="flex items-center gap-2 px-4 py-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm rounded-full text-sm font-medium text-slate-700 dark:text-slate-200 shadow-lg">
                <Eye className="w-4 h-4" />
                Ver detalles
              </span>
            </div>
          </motion.div>

          {/* Badges Container */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {/* Sale Badge */}
            {salePrice && (
              <motion.div
                initial={{ scale: 0, rotate: -12 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.1 + index * 0.02, type: 'spring', stiffness: 200 }}
              >
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full text-white text-xs font-bold shadow-lg shadow-rose-500/30">
                  -{discount}%
                </span>
              </motion.div>
            )}

            {/* Featured Badge */}
            {product.isFeatured && !salePrice && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1 + index * 0.02, type: 'spring', stiffness: 200 }}
              >
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full text-white text-xs font-bold shadow-lg shadow-amber-500/30">
                  <Sparkles className="w-3 h-3" />
                  Destacado
                </span>
              </motion.div>
            )}
          </div>

          {/* Variants Badge */}
          {hasVariants && (
            <motion.div
              className="absolute top-3 right-3"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.15 + index * 0.02, type: 'spring', stiffness: 200 }}
            >
              <span className="inline-flex items-center px-2.5 py-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-full text-xs font-medium text-slate-600 dark:text-slate-300 shadow-sm">
                +{product._count?.variants} opciones
              </span>
            </motion.div>
          )}

          {/* Wishlist Button */}
          <button
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-rose-50 dark:hover:bg-rose-950 hover:scale-110"
            style={{ display: hasVariants ? 'none' : 'flex' }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <Heart className="w-4 h-4 text-slate-500 hover:text-rose-500 transition-colors" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col p-4">
          {/* Category */}
          <span className="text-xs font-medium text-violet-600 dark:text-violet-400 uppercase tracking-wider mb-1.5">
            {product.category.name}
          </span>

          {/* Title */}
          <h3 className="text-sm sm:text-base font-semibold text-slate-800 dark:text-white leading-snug line-clamp-2 mb-1.5 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors duration-300">
            {product.name}
          </h3>

          {/* Brand */}
          {product.brand && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
              {product.brand.name}
            </p>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Rating (Visual only) */}
          <div className="flex items-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={cn(
                  'w-3 h-3',
                  i < 4 ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-slate-600'
                )}
              />
            ))}
            <span className="text-xs text-slate-500 ml-1">(4.0)</span>
          </div>

          {/* Price */}
          {product.showPrice && (
            <div className="flex items-baseline gap-2">
              {salePrice ? (
                <>
                  <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                    S/ {salePrice.toFixed(2)}
                  </span>
                  <span className="text-xs text-slate-400 line-through">
                    S/ {price.toFixed(2)}
                  </span>
                </>
              ) : (
                <span className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white">
                  S/ {price.toFixed(2)}
                </span>
              )}
            </div>
          )}

          {/* Stock Indicator */}
          {product.showStock && product.stock !== null && (
            <div className="mt-2">
              {product.stock > 0 ? (
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span className="text-xs text-emerald-600 dark:text-emerald-400">
                    {product.stock > 10 ? 'En stock' : `${product.stock} disponibles`}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span className="text-xs text-rose-600 dark:text-rose-400">
                    {product.stockMessage || 'Agotado'}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Accent Line */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
      </motion.article>
    </Link>
  );
}
