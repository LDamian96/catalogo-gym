'use client';

import { motion } from 'framer-motion';
import { ShoppingBag, Eye, Sparkles, Heart } from 'lucide-react';
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
          'bg-gradient-to-b from-white to-violet-50/30 dark:from-[#12121a] dark:to-violet-950/20',
          'border-2 border-violet-300/50 dark:border-violet-500/30',
          'shadow-lg shadow-violet-500/10 dark:shadow-violet-500/5',
          'transition-all duration-300 ease-out',
          'hover:border-violet-500/70 dark:hover:border-violet-400/50',
          'hover:shadow-xl hover:shadow-violet-500/20 dark:hover:shadow-violet-500/15',
          'hover:-translate-y-2 hover:scale-[1.02]',
          'active:scale-[0.98]'
        )}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.5,
          delay: index * 0.05,
          ease: v0Ease,
        }}
      >
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-neutral-50 dark:bg-[#0a0a0f]">
          {/* Main Image */}
          {mainImage ? (
            <>
              <Image
                src={mainImage}
                alt={product.name}
                fill
                className={cn(
                  'object-cover transition-all duration-700 ease-out',
                  'group-hover:scale-105',
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
                  className="object-cover transition-all duration-700 ease-out opacity-0 group-hover:opacity-100 group-hover:scale-105"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                />
              )}
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-violet-50 to-pink-50 dark:from-violet-500/5 dark:to-pink-500/5">
              <ShoppingBag className="w-10 h-10 text-violet-300 dark:text-violet-500/50" />
            </div>
          )}

          {/* Subtle Gradient Overlay on Hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Quick View Button */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-3 group-hover:translate-y-0">
            <span className="flex items-center gap-2 px-4 py-2 bg-white/95 dark:bg-[#12121a]/95 backdrop-blur-sm rounded-full text-xs font-medium text-neutral-700 dark:text-neutral-200 border border-violet-200/50 dark:border-violet-500/20 shadow-lg shadow-violet-500/10">
              <Eye className="w-3.5 h-3.5 text-violet-500" />
              Ver detalles
            </span>
          </div>

          {/* Badges Container - V0 Soft Style */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
            {/* Sale Badge */}
            {salePrice && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + index * 0.02, duration: 0.4, ease: v0Ease }}
              >
                <span className="inline-flex items-center px-2.5 py-1 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-[10px] font-semibold rounded-lg shadow-lg shadow-pink-500/25">
                  -{discount}%
                </span>
              </motion.div>
            )}

            {/* Featured Badge */}
            {product.isFeatured && !salePrice && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + index * 0.02, duration: 0.4, ease: v0Ease }}
              >
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-violet-500 to-purple-500 text-white text-[10px] font-semibold rounded-lg shadow-lg shadow-violet-500/25">
                  <Sparkles className="w-2.5 h-2.5" />
                  Destacado
                </span>
              </motion.div>
            )}
          </div>

          {/* Variants Badge */}
          {hasVariants && (
            <motion.div
              className="absolute top-2.5 right-2.5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 + index * 0.02, duration: 0.4, ease: v0Ease }}
            >
              <span className="inline-flex items-center px-2.5 py-1 bg-white/95 dark:bg-[#12121a]/95 backdrop-blur-sm rounded-lg text-[10px] font-medium text-violet-600 dark:text-violet-400 border border-violet-200/50 dark:border-violet-500/20 shadow-sm">
                +{product._count?.variants} opciones
              </span>
            </motion.div>
          )}

          {/* Wishlist Button - Only show if no variants badge */}
          {!hasVariants && (
            <button
              className="absolute top-2.5 right-2.5 w-8 h-8 rounded-xl bg-white/95 dark:bg-[#12121a]/95 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 border border-violet-200/30 dark:border-violet-500/20 hover:border-pink-400/50 hover:shadow-lg hover:shadow-pink-500/20"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <Heart className="w-4 h-4 text-neutral-400 hover:text-pink-500 transition-colors duration-300" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col p-4">
          {/* Category */}
          <span className="text-[10px] font-medium text-violet-600 dark:text-violet-400 uppercase tracking-wider mb-1.5">
            {product.category.name}
          </span>

          {/* Title */}
          <h3 className="text-sm font-medium text-neutral-800 dark:text-neutral-100 leading-snug line-clamp-2 mb-1 group-hover:text-violet-700 dark:group-hover:text-violet-300 transition-colors duration-300">
            {product.name}
          </h3>

          {/* Brand */}
          {product.brand && (
            <p className="text-[11px] text-neutral-500 dark:text-neutral-500 mb-2">
              {product.brand.name}
            </p>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Price */}
          {product.showPrice && (
            <div className="flex items-baseline gap-2 mt-2">
              {salePrice ? (
                <>
                  <span className="text-lg font-semibold bg-gradient-to-r from-violet-600 to-pink-600 dark:from-violet-400 dark:to-pink-400 bg-clip-text text-transparent">
                    S/ {salePrice.toFixed(2)}
                  </span>
                  <span className="text-xs text-neutral-400 line-through">
                    S/ {price.toFixed(2)}
                  </span>
                </>
              ) : (
                <span className="text-lg font-semibold text-neutral-900 dark:text-white">
                  S/ {price.toFixed(2)}
                </span>
              )}
            </div>
          )}

          {/* Stock Indicator */}
          {product.showStock && product.stock !== null && (
            <div className="mt-2.5">
              {product.stock > 0 ? (
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                    {product.stock > 10 ? 'Disponible' : `${product.stock} unidades`}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
                  <span className="text-[10px] text-neutral-500 font-medium">
                    {product.stockMessage || 'Agotado'}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Accent Line - V0 Soft Gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 opacity-50 group-hover:opacity-100 transition-opacity duration-500 ease-out" />
      </motion.article>
    </a>
  );
}
