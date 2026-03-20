'use client';

import { motion } from 'framer-motion';
import { ShoppingBag, ShoppingCart, Eye, Zap, Heart, Sparkles, Tag, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { v0Ease } from '@/lib/animations';
import { usePageTransition } from './PageTransition';
import { useCart } from '@/hooks/useCart';
import type { CatalogProduct } from '@/lib/api/catalog';

interface ProductCardProps {
  product: CatalogProduct;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { navigateWithTransition } = usePageTransition();
  const { addItem } = useCart();
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
      {/* ==================== MOBILE CARD ==================== */}
      <motion.article
        className={cn(
          'lg:hidden relative h-full flex flex-col overflow-hidden rounded-[18px]',
          'bg-white dark:bg-[#111]',
          'active:scale-[0.97] transition-transform duration-150'
        )}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.4,
          delay: index * 0.04,
          ease: v0Ease,
        }}
      >
        {/* Image - compact height */}
        <div className="relative h-[130px] overflow-hidden bg-neutral-100 dark:bg-neutral-900">
          {mainImage ? (
            <Image
              src={mainImage}
              alt={product.name}
              fill
              quality={85}
              className="object-cover"
              sizes="50vw"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-50 dark:bg-neutral-900">
              <ShoppingBag className="w-10 h-10 text-neutral-300 dark:text-neutral-700" />
            </div>
          )}

          {/* Badges - top left */}
          <div className="absolute top-1.5 left-1.5 flex flex-col gap-1">
            {salePrice && (
              <span className="inline-flex items-center gap-1 px-[7px] py-[3px] bg-red-600 text-white text-[8px] font-bold rounded-[7px]">
                <Tag className="w-[9px] h-[9px]" />
                -{discount}%
              </span>
            )}
            {hasVariants && (
              <span className="inline-flex items-center gap-1 px-[7px] py-[3px] bg-black/60 text-white text-[8px] font-bold rounded-[7px]">
                <Zap className="w-[9px] h-[9px]" />
                +{product._count?.variants} sabores
              </span>
            )}
          </div>
        </div>

        {/* Content - compact padding matching design */}
        <div className="flex-1 flex flex-col gap-0.5 px-2.5 py-2">
          {/* Category label - teal */}
          <span className="text-[9px] font-bold uppercase text-cyan-600 dark:text-cyan-400" style={{ letterSpacing: '1px' }}>
            {product.category.name}
          </span>

          {/* Title */}
          <h3 className="text-[12px] font-bold leading-tight line-clamp-2 text-slate-900 dark:text-white" style={{ fontFamily: 'var(--font-heading, inherit)' }}>
            {product.name}
          </h3>

          {/* Brand */}
          {product.brand && (
            <p className="text-[10px] text-slate-400 font-medium">
              {product.brand.name}
            </p>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Price */}
          {product.showPrice && (
            <div className="flex items-center gap-1.5 mt-1">
              {salePrice ? (
                <>
                  <span className="text-[15px] font-extrabold text-red-600" style={{ fontFamily: 'var(--font-heading, inherit)' }}>
                    S/ {salePrice.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-slate-300 line-through font-medium">
                    S/ {price.toFixed(2)}
                  </span>
                </>
              ) : (
                <span className="text-[15px] font-extrabold text-slate-900 dark:text-white" style={{ fontFamily: 'var(--font-heading, inherit)' }}>
                  S/ {price.toFixed(2)}
                </span>
              )}
            </div>
          )}

          {/* Stock */}
          {product.showStock && product.stock !== null && (
            <div className="mt-1">
              {product.stock > 0 ? (
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    {product.stock > 10 ? 'En stock' : `Solo ${product.stock} disponibles`}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-300" />
                  <span className="text-[10px] text-neutral-400 font-medium">
                    {product.stockMessage || 'Agotado'}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.article>

      {/* ==================== DESKTOP CARD ==================== */}
      <motion.article
        className={cn(
          'hidden lg:flex group relative h-full flex-col overflow-hidden rounded-2xl',
          'bg-white dark:bg-[#0a0a0a]',
          'border-2 border-cyan-100 dark:border-neutral-800',
          'transition-all duration-500',
          'hover:border-cyan-400 dark:hover:border-cyan-500/50',
          'hover:shadow-2xl hover:shadow-cyan-500/30 dark:hover:shadow-cyan-500/10',
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
        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-500 rounded-2xl opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-500 -z-10 dark:group-hover:opacity-10" />

        {/* Image Container */}
        <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-br from-cyan-50 via-sky-50 to-blue-50 dark:from-neutral-900 dark:via-neutral-900 dark:to-neutral-900">
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
                sizes="(max-width: 1024px) 33vw, 25vw"
              />
              {secondImage && (
                <Image
                  src={`${secondImage}`}
                  alt={`${product.name} - Vista 2`}
                  fill
                  quality={90}
                  className="object-cover transition-all duration-700 opacity-0 group-hover:opacity-100 group-hover:scale-110"
                  sizes="(max-width: 1024px) 33vw, 25vw"
                />
              )}
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-cyan-100 via-sky-100 to-blue-100 dark:from-neutral-900 dark:via-neutral-900 dark:to-neutral-900">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 dark:from-neutral-700 dark:to-neutral-600 flex items-center justify-center mb-2 shadow-lg shadow-cyan-500/30 dark:shadow-none">
                <ShoppingBag className="w-8 h-8 text-white dark:text-neutral-400" />
              </div>
              <span className="text-xs font-medium text-cyan-600 dark:text-neutral-500">Sin imagen</span>
            </div>
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />

          {/* Quick View Button */}
          <motion.div
            className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className={cn(
              'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold shadow-xl',
              'bg-gradient-to-r from-cyan-500 via-sky-600 to-blue-600 text-white shadow-cyan-500/50',
              'dark:bg-white dark:text-black dark:shadow-white/20'
            )}>
              <Eye className="w-4 h-4" />
              Ver producto
              <Sparkles className="w-4 h-4 dark:hidden" />
            </span>
          </motion.div>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {salePrice && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.03, duration: 0.4, ease: v0Ease }}
              >
                <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 text-white text-xs font-bold rounded-lg shadow-lg shadow-orange-500/50">
                  <Tag className="w-3 h-3" />
                  -{discount}% OFF
                </span>
              </motion.div>
            )}
          </div>

          {/* Variants Badge */}
          {hasVariants && (
            <motion.div
              className="absolute top-3 right-3"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + index * 0.03, duration: 0.4, ease: v0Ease }}
            >
              <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold rounded-lg shadow-lg shadow-cyan-500/50">
                <Zap className="w-3 h-3" />
                +{product._count?.variants} sabores
              </span>
            </motion.div>
          )}

          {/* Wishlist Button */}
          {!hasVariants && (
            <motion.button
              className={cn(
                'absolute top-3 right-3 w-10 h-10 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg',
                'bg-white hover:bg-cyan-50 hover:shadow-cyan-500/50',
                'dark:bg-black/50 dark:backdrop-blur-sm dark:hover:bg-black/70 dark:shadow-none'
              )}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
            >
              <Heart className="w-5 h-5 text-neutral-400 group-hover:text-cyan-500 dark:group-hover:text-white transition-colors duration-300" />
            </motion.button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col p-4 bg-gradient-to-b from-white to-cyan-50/50 dark:from-[#0a0a0a] dark:to-[#0a0a0a]">
          {/* Category */}
          <span className={cn(
            'inline-flex items-center gap-1 self-start px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md mb-2',
            'bg-gradient-to-r from-cyan-100 to-sky-100 text-cyan-700',
            'dark:from-cyan-500/10 dark:to-cyan-500/10 dark:text-cyan-400'
          )}>
            {product.category.name}
          </span>

          {/* Title */}
          <h3 className={cn(
            'text-sm font-bold leading-snug line-clamp-2 mb-1 transition-all duration-300',
            'bg-gradient-to-r from-cyan-700 via-sky-600 to-blue-700 bg-clip-text text-transparent',
            'group-hover:from-cyan-500 group-hover:via-sky-500 group-hover:to-blue-500',
            'dark:from-white dark:via-white dark:to-white dark:group-hover:from-cyan-400 dark:group-hover:to-cyan-400'
          )}>
            {product.name}
          </h3>

          {/* Brand */}
          {product.brand && (
            <p className="text-[11px] text-neutral-500 dark:text-neutral-500 mb-2 font-medium">
              {product.brand.name}
            </p>
          )}

          <div className="flex-1" />

          {/* Price */}
          {product.showPrice && (
            <div className="flex items-center gap-3 mt-3">
              {salePrice ? (
                <>
                  <span className="text-xl font-black bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 dark:from-red-500 dark:via-orange-500 dark:to-amber-500 bg-clip-text text-transparent">
                    S/ {salePrice.toFixed(2)}
                  </span>
                  <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-500/20 rounded text-xs text-slate-400 dark:text-slate-500 line-through font-medium">
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

          {/* Stock */}
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

        {/* Add to Cart Button */}
        {product.showPrice && (
          <div className="px-4 pb-4">
            <motion.button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                addItem({
                  id: product.id,
                  productId: product.id,
                  name: product.name,
                  price: salePrice || price,
                  image: mainImage || null,
                });
              }}
              className={cn(
                'w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all duration-300',
                'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/25',
                'hover:from-cyan-600 hover:to-blue-600 hover:shadow-cyan-500/40',
                'dark:from-cyan-600 dark:to-blue-600 dark:hover:from-cyan-500 dark:hover:to-blue-500'
              )}
              whileTap={{ scale: 0.95 }}
            >
              <ShoppingCart className="w-4 h-4" />
              Agregar al carrito
            </motion.button>
          </div>
        )}

        {/* Bottom Gradient Bar */}
        <div className={cn(
          'h-1 opacity-30 group-hover:opacity-100 transition-opacity duration-500',
          'bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-500',
          'dark:bg-cyan-500'
        )} />

        {/* Corner Decoration */}
        <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-500 dark:hidden">
          <div className="absolute -top-8 -right-8 w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rotate-45 transform origin-center" />
        </div>
      </motion.article>
    </a>
  );
}
