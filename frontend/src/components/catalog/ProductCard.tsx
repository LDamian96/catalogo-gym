'use client';

import { motion } from 'framer-motion';
import { ShoppingBag, Eye, Zap, Heart, Sparkles, Tag, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { v0Ease } from '@/lib/animations';
import { usePageTransition } from './PageTransition';
import type { CatalogProduct } from '@/lib/api/catalog';

interface ProductCardProps {
  product: CatalogProduct;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { navigateWithTransition } = usePageTransition();
  const price = Number(product.price);
  const salePrice = product.salePrice ? Number(product.salePrice) : null;
  const discount = salePrice ? Math.round(((price - salePrice) / price) * 100) : 0;
  const mainImage = product.images?.[0]?.url;
  const secondImage = product.images?.[1]?.url;
  const hasVariants = (product._count?.variants || 0) > 0;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigateWithTransition(`/productos/${product.slug}`);
  };

  return (
    <a href={`/productos/${product.slug}`} onClick={handleClick}>
      <motion.article
        className={cn(
          'group relative h-full flex flex-col overflow-hidden rounded-2xl',
          'bg-white dark:bg-neutral-900',
          'border-2 border-red-100 dark:border-red-500/20',
          'transition-all duration-500',
          'hover:border-red-400 dark:hover:border-red-500',
          'hover:shadow-2xl hover:shadow-red-500/30',
          'hover:-translate-y-2 hover:scale-[1.02]',
          'active:scale-[0.98]'
        )}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.5,
          delay: index * 0.06,
          ease: v0Ease,
        }}
      >
        {/* Glow Effect on Hover */}
        <div className="absolute -inset-1 bg-gradient-to-r from-red-400 via-orange-500 to-amber-500 rounded-2xl opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-500 -z-10" />

        {/* Image Container */}
        <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-br from-red-50 via-orange-50 to-amber-50 dark:from-red-950/50 dark:via-orange-950/50 dark:to-amber-950/50">
          {mainImage ? (
            <>
              <Image
                src={mainImage}
                alt={product.name}
                fill
                quality={90}
                className={cn(
                  'object-cover transition-all duration-700',
                  'group-hover:scale-110',
                  secondImage && 'group-hover:opacity-0'
                )}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
              {secondImage && (
                <Image
                  src={secondImage}
                  alt={`${product.name} - Vista 2`}
                  fill
                  quality={90}
                  className="object-cover transition-all duration-700 opacity-0 group-hover:opacity-100 group-hover:scale-110"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
              )}
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-red-100 via-orange-100 to-amber-100 dark:from-red-900/30 dark:via-orange-900/30 dark:to-amber-900/30">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-400 to-orange-500 flex items-center justify-center mb-2 shadow-lg shadow-red-500/30">
                <ShoppingBag className="w-8 h-8 text-white" />
              </div>
              <span className="text-xs font-medium text-red-600 dark:text-red-400">Sin imagen</span>
            </div>
          )}

          {/* Colorful Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />

          {/* Quick View Button - Colorful */}
          <motion.div
            className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-500 via-orange-600 to-amber-600 rounded-xl text-sm font-bold text-white shadow-xl shadow-red-500/50">
              <Eye className="w-4 h-4" />
              Ver producto
              <Sparkles className="w-4 h-4" />
            </span>
          </motion.div>

          {/* Badges Container - Colorful */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {salePrice && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.03, duration: 0.4, ease: v0Ease }}
              >
                <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-rose-500 to-red-600 text-white text-xs font-bold rounded-lg shadow-lg shadow-rose-500/50">
                  <Tag className="w-3 h-3" />
                  -{discount}% OFF
                </span>
              </motion.div>
            )}

          </div>

          {/* Variants Badge - Colorful */}
          {hasVariants && (
            <motion.div
              className="absolute top-3 right-3"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + index * 0.03, duration: 0.4, ease: v0Ease }}
            >
              <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-red-500 to-orange-600 text-white text-xs font-bold rounded-lg shadow-lg shadow-red-500/50">
                <Zap className="w-3 h-3" />
                +{product._count?.variants} sabores
              </span>
            </motion.div>
          )}

          {/* Wishlist Button - Colorful */}
          {!hasVariants && (
            <motion.button
              className="absolute top-3 right-3 w-10 h-10 rounded-xl bg-white dark:bg-neutral-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg hover:shadow-rose-500/50 hover:bg-rose-50 dark:hover:bg-rose-500/20"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
            >
              <Heart className="w-5 h-5 text-neutral-400 group-hover:text-rose-500 transition-colors duration-300" />
            </motion.button>
          )}
        </div>

        {/* Content - Colorful */}
        <div className="flex-1 flex flex-col p-4 bg-gradient-to-b from-white to-red-50/50 dark:from-neutral-900 dark:to-red-950/30">
          {/* Category - With color pill */}
          <span className="inline-flex items-center gap-1 self-start px-2.5 py-1 bg-gradient-to-r from-red-100 to-orange-100 dark:from-red-500/20 dark:to-orange-500/20 text-red-700 dark:text-red-400 text-[10px] font-bold uppercase tracking-wider rounded-md mb-2">
            {product.category.name}
          </span>

          {/* Title - Bold */}
          <h3 className="text-sm font-bold text-neutral-900 dark:text-white leading-snug line-clamp-2 mb-1 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-red-600 group-hover:to-orange-600 dark:group-hover:from-red-400 dark:group-hover:to-orange-400 transition-all duration-300">
            {product.name}
          </h3>

          {/* Brand */}
          {product.brand && (
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mb-2 font-medium">
              {product.brand.name}
            </p>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Price - Colorful */}
          {product.showPrice && (
            <div className="flex items-center gap-3 mt-3">
              {salePrice ? (
                <>
                  <span className="text-xl font-black bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 bg-clip-text text-transparent">
                    S/ {salePrice.toFixed(2)}
                  </span>
                  <span className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded text-xs text-neutral-400 line-through font-medium">
                    S/ {price.toFixed(2)}
                  </span>
                </>
              ) : (
                <span className="text-xl font-black text-neutral-900 dark:text-white">
                  S/ {price.toFixed(2)}
                </span>
              )}
            </div>
          )}

          {/* Stock Indicator - Colorful */}
          {product.showStock && product.stock !== null && (
            <div className="mt-3">
              {product.stock > 0 ? (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-100 dark:bg-emerald-500/20 rounded-lg">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span className="text-xs text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    {product.stock > 10 ? 'En stock' : `Solo ${product.stock} disponibles`}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                  <span className="w-2 h-2 rounded-full bg-neutral-400" />
                  <span className="text-xs text-neutral-500 font-medium">
                    {product.stockMessage || 'Agotado'}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Gradient Bar - Animated */}
        <div className="h-1 bg-gradient-to-r from-red-400 via-orange-500 to-amber-500 opacity-30 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Corner Decoration */}
        <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute -top-8 -right-8 w-16 h-16 bg-gradient-to-br from-red-400 to-orange-500 rotate-45 transform origin-center" />
        </div>
      </motion.article>
    </a>
  );
}
