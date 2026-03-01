'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import {
  ShoppingBag,
  Heart,
  Share2,
  Truck,
  Shield,
  RotateCcw,
  Check,
  Minus,
  Plus,
  ChevronRight,
  ChevronLeft,
  Tag,
  MessageCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProductCard, WhatsAppButton, Footer, AddToCartButton, MobileBottomNav, Navbar } from '@/components/catalog';
import type { CatalogProduct, CatalogSettings, CatalogProductDetail, CatalogCategory } from '@/lib/api/catalog';
import { trackEvent } from '@/lib/api/catalog';
import { useTracking } from '@/hooks/useTracking';

// V0 ease curve
const v0Ease = [0.22, 1, 0.36, 1] as const;

interface ProductDetailProps {
  product: CatalogProductDetail;
  relatedProducts: CatalogProduct[];
  settings: CatalogSettings;
  categories?: CatalogCategory[];
}

export function ProductDetail({ product, relatedProducts, settings, categories = [] }: ProductDetailProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [selectedVariantValue, setSelectedVariantValue] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isLiked, setIsLiked] = useState(false);

  // Tracking hooks
  const { trackViewItem, trackAddToCart } = useTracking();

  // Check if product has variant value images (e.g., images per color)
  const hasVariantImages = product.imageVariantType && product.imagesByVariantValue;
  const variantImageValues = hasVariantImages ? Object.keys(product.imagesByVariantValue || {}) : [];

  // Get images to display based on selected variant value
  const getDisplayImages = () => {
    if (hasVariantImages && selectedVariantValue && product.imagesByVariantValue?.[selectedVariantValue]) {
      // Return images for the selected variant value (e.g., Color=Negro)
      return product.imagesByVariantValue[selectedVariantValue].map(img => ({
        id: img.id,
        url: img.url,
        order: img.order,
      }));
    }
    // Fallback to product's main images
    return product.images || [];
  };

  const images = getDisplayImages();
  const variants = product.variants || [];

  // Track if initial selection has been done
  const initializedRef = useRef(false);

  // Auto-select first variant value and variant ONLY on initial mount
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    // Auto-select first variant value (e.g., first Color)
    if (hasVariantImages && variantImageValues.length > 0) {
      const firstVariantValue = variantImageValues[0];
      setSelectedVariantValue(firstVariantValue);

      // Also select first variant that matches this value
      if (product.imageVariantType) {
        const matchingVariant = variants.find(v => {
          const matchingValue = v.variantValues?.find(
            vv => vv.variantType.id === product.imageVariantType?.id
          );
          return matchingValue?.value === firstVariantValue;
        });
        if (matchingVariant) {
          setSelectedVariant(matchingVariant.id);
        }
      }
    } else if (variants.length > 0) {
      // No image variants, just select first variant
      setSelectedVariant(variants[0].id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reset selected image when variant value changes (user interaction only)
  const prevVariantValueRef = useRef<string | null>(null);
  useEffect(() => {
    if (prevVariantValueRef.current !== null && prevVariantValueRef.current !== selectedVariantValue) {
      setSelectedImage(0);
    }
    prevVariantValueRef.current = selectedVariantValue;
  }, [selectedVariantValue]);
  const price = Number(product.price);
  const salePrice = product.salePrice ? Number(product.salePrice) : null;
  const discount = salePrice ? Math.round(((price - salePrice) / price) * 100) : 0;

  // Get selected variant data
  const currentVariant = variants.find(v => v.id === selectedVariant);
  const displayPrice = currentVariant?.price ? Number(currentVariant.price) : (salePrice || price);
  const displayStock = currentVariant?.stock !== null && currentVariant?.stock !== undefined
    ? currentVariant.stock
    : product.stock;

  // Sync variant value images when user selects a sub-variant with different color (after initialization)
  const prevVariantRef = useRef<string | null>(null);
  useEffect(() => {
    // Skip if not initialized yet or no variant selected
    if (!initializedRef.current || !currentVariant || !hasVariantImages || !product.imageVariantType) return;
    // Skip if this is the first time setting the variant (initial selection)
    if (prevVariantRef.current === null) {
      prevVariantRef.current = selectedVariant;
      return;
    }
    // Only sync if variant changed (user interaction)
    if (prevVariantRef.current !== selectedVariant) {
      prevVariantRef.current = selectedVariant;
      const matchingValue = currentVariant.variantValues?.find(
        vv => vv.variantType.id === product.imageVariantType?.id
      );
      if (matchingValue && matchingValue.value !== selectedVariantValue) {
        setSelectedVariantValue(matchingValue.value);
      }
    }
  }, [selectedVariant, currentVariant, hasVariantImages, product.imageVariantType, selectedVariantValue]);

  // Track page view (internal API + pixels)
  useEffect(() => {
    // Track to internal API
    trackEvent({
      type: 'PRODUCT_VIEW',
      productId: product.id,
      metadata: { slug: product.slug },
    }).catch(console.error);

    // Track to GA4, FB Pixel, TikTok Pixel
    trackViewItem(product as unknown as import('@/types').Product, settings.currency);
  }, [product, settings.currency, trackViewItem]);

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: product.name,
        text: product.description || `Mira este producto: ${product.name}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleWhatsAppOrder = () => {
    // Track add to cart / begin checkout (WhatsApp order)
    trackAddToCart(product as unknown as import('@/types').Product, quantity, settings.currency);

    const variantInfo = currentVariant
      ? `\nVariante: ${currentVariant.variantValues?.map(v => `${v.variantType.name}: ${v.value}`).join(', ')}`
      : '';
    const message = `¡Hola! Me interesa el producto:\n\n*${product.name}*${variantInfo}\nCantidad: ${quantity}\nPrecio: S/ ${(displayPrice * quantity).toFixed(2)}\n\n${window.location.href}`;
    const phone = settings.whatsapp?.replace(/\D/g, '') || '';
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#000000]">
      {/* Navbar */}
      <Navbar settings={settings} categories={categories} />

      {/* Mobile Full-Bleed Product Image Header */}
      <div className="lg:hidden relative">
        <div className="relative w-full h-[320px] bg-neutral-100 dark:bg-[#0a0a0a] overflow-hidden">
          {/* Swipeable Image */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`mobile-img-${selectedImage}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: v0Ease }}
              drag={images.length > 1 ? 'x' : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={(_e, info) => {
                if (info.offset.x < -60) {
                  setSelectedImage(prev => (prev < images.length - 1 ? prev + 1 : 0));
                } else if (info.offset.x > 60) {
                  setSelectedImage(prev => (prev > 0 ? prev - 1 : images.length - 1));
                }
              }}
              className="absolute inset-0"
            >
              {images[selectedImage]?.url ? (
                <Image
                  src={images[selectedImage].url}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                  sizes="100vw"
                  draggable={false}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ShoppingBag className="w-16 h-16 text-neutral-300 dark:text-neutral-700" />
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Floating Back Button - Cyan circle */}
          <Link
            href={`/categorias/${product.category.slug}`}
            className="absolute top-3.5 left-3.5 z-10 w-[42px] h-[42px] rounded-full bg-cyan-600 flex items-center justify-center shadow-lg"
          >
            <ChevronLeft className="w-[22px] h-[22px] text-white" />
          </Link>

          {/* Floating Share Button - Cyan circle */}
          <button
            onClick={handleShare}
            className="absolute top-3.5 right-3.5 z-10 w-[42px] h-[42px] rounded-full bg-cyan-600 flex items-center justify-center shadow-lg"
          >
            <Share2 className="w-[22px] h-[22px] text-white" />
          </button>

          {/* Discount Badge - Bottom-left on image */}
          {salePrice && (
            <div className="absolute bottom-10 left-3.5 z-10">
              <span className="inline-flex items-center gap-1 px-2.5 py-[5px] bg-red-500 rounded-[10px] text-white text-[11px] font-bold">
                <Tag className="w-3 h-3 text-white" />
                -{discount}% OFF
              </span>
            </div>
          )}

          {/* Carousel Dots */}
          {images.length > 1 && (
            <div className="absolute bottom-[38px] left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={cn(
                    'h-1.5 rounded-full transition-all duration-300',
                    selectedImage === index
                      ? 'bg-cyan-600 w-[22px]'
                      : 'bg-slate-300 w-1.5'
                  )}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Breadcrumb - V0 Style (Desktop only) */}
      <div className="hidden lg:block border-b border-black/[0.06] dark:border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <motion.nav
            className="flex items-center gap-2 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, ease: v0Ease }}
          >
            <Link href="/" className="text-neutral-400 hover:text-cyan-500 transition-colors">
              Inicio
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-300 dark:text-neutral-600" />
            <Link
              href={`/categorias/${product.category.slug}`}
              className="text-neutral-400 hover:text-cyan-500 transition-colors"
            >
              {product.category.name}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-300 dark:text-neutral-600" />
            <span className="text-neutral-700 dark:text-white font-medium truncate max-w-[200px]">
              {product.name}
            </span>
          </motion.nav>
        </div>
      </div>

      {/* Main Content - V0 Style Layout */}
      <div className="max-w-7xl mx-auto relative lg:static -mt-6 lg:mt-0 bg-gradient-to-b from-white to-[#EFF9FF] lg:bg-white lg:bg-none dark:bg-[#000000] rounded-t-3xl lg:rounded-none z-10 px-4 sm:px-6 lg:px-8 pt-4 lg:py-12 pb-24 lg:pb-12">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">

          {/* Left Column - Images + Color Selector (Desktop only) */}
          <motion.div
            className="hidden lg:block space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: v0Ease }}
          >
            {/* Main Image - V0 Style */}
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-neutral-100 dark:bg-[#0a0a0a] border border-black/[0.06] dark:border-white/[0.06]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedImage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, ease: v0Ease }}
                  className="absolute inset-0"
                >
                  {images[selectedImage]?.url ? (
                    <Image
                      src={images[selectedImage].url}
                      alt={product.name}
                      fill
                      className="object-cover"
                      priority
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBag className="w-16 h-16 text-neutral-300 dark:text-neutral-700" />
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Sale Badge - V0 Style */}
              {salePrice && (
                <motion.div
                  className="absolute top-3 left-3"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.4, ease: v0Ease }}
                >
                  <span className="px-3 py-1.5 bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 rounded-lg text-white text-xs font-semibold shadow-lg shadow-orange-500/25">
                    -{discount}%
                  </span>
                </motion.div>
              )}

              {/* Action Buttons - V0 Style */}
              <div className="absolute top-3 right-3 flex flex-col gap-2">
                <motion.button
                  onClick={() => setIsLiked(!isLiked)}
                  className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center transition-all backdrop-blur-sm border',
                    isLiked
                      ? 'bg-cyan-500 text-white border-cyan-500'
                      : 'bg-white/90 dark:bg-[#0a0a0a]/90 text-neutral-500 dark:text-neutral-400 border-black/[0.06] dark:border-white/[0.1] hover:border-cyan-500/50 hover:text-cyan-500'
                  )}
                  whileTap={{ scale: 0.95 }}
                >
                  <Heart className={cn('w-4 h-4', isLiked && 'fill-current')} />
                </motion.button>
                <motion.button
                  onClick={handleShare}
                  className="w-10 h-10 rounded-xl bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-sm flex items-center justify-center text-neutral-500 dark:text-neutral-400 border border-black/[0.06] dark:border-white/[0.1] hover:border-cyan-500/50 hover:text-cyan-500 transition-all"
                  whileTap={{ scale: 0.95 }}
                >
                  <Share2 className="w-4 h-4" />
                </motion.button>
              </div>

              {/* Image Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImage(prev => (prev > 0 ? prev - 1 : images.length - 1))}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-sm flex items-center justify-center text-neutral-500 dark:text-neutral-400 border border-black/[0.06] dark:border-white/[0.1] hover:border-cyan-500/50 transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setSelectedImage(prev => (prev < images.length - 1 ? prev + 1 : 0))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-sm flex items-center justify-center text-neutral-500 dark:text-neutral-400 border border-black/[0.06] dark:border-white/[0.1] hover:border-cyan-500/50 transition-all"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}

              {/* Image Indicators (dots) */}
              {images.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={cn(
                        'w-2 h-2 rounded-full transition-all',
                        selectedImage === index
                          ? 'bg-cyan-500 w-6'
                          : 'bg-white/50 hover:bg-white/80'
                      )}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Thumbnails - V0 Style */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                {images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setSelectedImage(index)}
                    className={cn(
                      'relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all',
                      selectedImage === index
                        ? 'border-cyan-500'
                        : 'border-transparent hover:border-cyan-500/30'
                    )}
                  >
                    <Image
                      src={image.url}
                      alt={`${product.name} ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Color Selector - BELOW IMAGE - V0 Style */}
            {hasVariantImages && variantImageValues.length > 0 && (
              <motion.div
                className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#0a0a0a] border border-black/[0.06] dark:border-white/[0.06]"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4, ease: v0Ease }}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    {product.imageVariantType?.name || 'Color'}
                  </h3>
                  {selectedVariantValue && (
                    <span className="text-sm text-cyan-600 dark:text-cyan-400 font-medium">
                      {selectedVariantValue}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {variantImageValues.map((value) => {
                    const isSelected = selectedVariantValue === value;
                    const valueImages = product.imagesByVariantValue?.[value] || [];
                    const firstImage = valueImages[0]?.url;

                    return (
                      <button
                        key={value}
                        onClick={() => setSelectedVariantValue(isSelected ? null : value)}
                        className={cn(
                          'relative rounded-xl border-2 transition-all overflow-hidden',
                          isSelected
                            ? 'border-cyan-500 ring-2 ring-cyan-500/20'
                            : 'border-neutral-200 dark:border-neutral-700 hover:border-cyan-400'
                        )}
                      >
                        {firstImage ? (
                          <div className="w-12 h-12 relative">
                            <Image
                              src={firstImage}
                              alt={value}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                            {isSelected && (
                              <div className="absolute inset-0 bg-cyan-500/20 flex items-center justify-center">
                                <div className="w-4 h-4 rounded-full bg-cyan-500 flex items-center justify-center">
                                  <Check className="w-2.5 h-2.5 text-white" />
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className={cn(
                            'px-4 py-2 text-sm font-medium',
                            isSelected
                              ? 'bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300'
                              : 'text-neutral-600 dark:text-neutral-400'
                          )}>
                            {value}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Mobile Color/Variant Image Selector */}
          {hasVariantImages && variantImageValues.length > 0 && (
            <div className="lg:hidden">
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                {variantImageValues.map((value) => {
                  const isSelected = selectedVariantValue === value;
                  const valueImages = product.imagesByVariantValue?.[value] || [];
                  const firstImage = valueImages[0]?.url;

                  return (
                    <button
                      key={value}
                      onClick={() => setSelectedVariantValue(isSelected ? null : value)}
                      className={cn(
                        'relative rounded-xl border-2 transition-all overflow-hidden flex-shrink-0',
                        isSelected
                          ? 'border-cyan-500 ring-2 ring-cyan-500/20'
                          : 'border-neutral-200 dark:border-neutral-700 hover:border-cyan-400'
                      )}
                    >
                      {firstImage ? (
                        <div className="w-14 h-14 relative">
                          <Image
                            src={firstImage}
                            alt={value}
                            fill
                            className="object-cover"
                            sizes="56px"
                          />
                          {isSelected && (
                            <div className="absolute inset-0 bg-cyan-500/20 flex items-center justify-center">
                              <div className="w-4 h-4 rounded-full bg-cyan-500 flex items-center justify-center">
                                <Check className="w-2.5 h-2.5 text-white" />
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className={cn(
                          'px-3 py-2 text-sm font-medium',
                          isSelected
                            ? 'bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300'
                            : 'text-neutral-600 dark:text-neutral-400'
                        )}>
                          {value}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Right Column - Product Info - V0 Style */}
          <motion.div
            className="space-y-3.5 lg:space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: v0Ease }}
          >
            {/* Category & Brand - V0 Style */}
            <div className="flex items-center gap-2">
              {/* Mobile: inline cyan text breadcrumb */}
              <span className="lg:hidden text-[11px] font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">
                {product.category.name}
                {product.brand && ` \u2022 ${product.brand.name}`}
              </span>
              {/* Desktop: pill style */}
              <span className="hidden lg:inline-flex px-2.5 py-1 rounded-full bg-cyan-50 dark:bg-cyan-500/10 text-[11px] font-semibold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">
                {product.category.name}
              </span>
              {product.brand && (
                <span className="hidden lg:flex items-center gap-2">
                  <span className="text-neutral-300 dark:text-neutral-600">&bull;</span>
                  <span className="text-xs text-neutral-500 font-medium">{product.brand.name}</span>
                </span>
              )}
            </div>

            {/* Title - V0 Style */}
            <h1 className="text-[22px] lg:text-3xl font-extrabold lg:font-semibold text-slate-900 dark:text-white tracking-tight leading-[1.15]">
              {product.name}
            </h1>

            {/* Price - V0 Style */}
            {product.showPrice && (
              <div className="flex items-center gap-2.5">
                {salePrice ? (
                  <>
                    <span className="text-[26px] lg:text-3xl font-extrabold lg:font-semibold text-red-600 dark:text-red-500">
                      S/ {displayPrice.toFixed(2)}
                    </span>
                    <span className="text-[15px] lg:text-lg text-slate-300 dark:text-slate-500 line-through font-medium">
                      S/ {price.toFixed(2)}
                    </span>
                    <span className="hidden lg:inline-flex px-2 py-0.5 bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-md text-xs font-medium">
                      -{discount}%
                    </span>
                  </>
                ) : (
                  <span className="text-[26px] lg:text-3xl font-extrabold lg:font-semibold text-slate-900 dark:text-white">
                    S/ {displayPrice.toFixed(2)}
                  </span>
                )}
              </div>
            )}

            {/* Stock - V0 Style */}
            {product.showStock && displayStock !== null && (
              <div className="flex items-center gap-2">
                {displayStock > 0 ? (
                  <>
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                    </span>
                    <span className="text-sm text-emerald-600 dark:text-emerald-400">
                      {displayStock} disponibles
                    </span>
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-neutral-400" />
                    <span className="text-sm text-neutral-500">
                      {product.stockMessage || 'Agotado'}
                    </span>
                  </>
                )}
              </div>
            )}

            {/* Description - V0 Style */}
            {product.description && (
              <p className="text-slate-500 dark:text-neutral-400 text-[13px] lg:text-sm leading-[1.5] lg:leading-relaxed">
                {product.description}
              </p>
            )}

            {/* Variants (Sub-products) - V0 Style - SEPARATED BY TYPE */}
            {variants.length > 0 && (() => {
              // Filter variants by selected image variant value (e.g., Color)
              const filteredVariants = hasVariantImages && selectedVariantValue && product.imageVariantType
                ? variants.filter(v => {
                    const matchingValue = v.variantValues?.find(
                      vv => vv.variantType.id === product.imageVariantType?.id
                    );
                    return matchingValue?.value === selectedVariantValue;
                  })
                : variants;

              // Get all variant types except the image variant type (e.g., exclude Color)
              const otherVariantTypesMap = new Map<string, { id: string; name: string; values: Set<string> }>();

              filteredVariants.forEach(v => {
                v.variantValues?.forEach(vv => {
                  // Skip the image variant type (e.g., Color)
                  if (hasVariantImages && product.imageVariantType && vv.variantType.id === product.imageVariantType.id) {
                    return;
                  }

                  if (!otherVariantTypesMap.has(vv.variantType.id)) {
                    otherVariantTypesMap.set(vv.variantType.id, {
                      id: vv.variantType.id,
                      name: vv.variantType.name,
                      values: new Set(),
                    });
                  }
                  otherVariantTypesMap.get(vv.variantType.id)!.values.add(vv.value);
                });
              });

              const otherVariantTypes = Array.from(otherVariantTypesMap.values());

              // State for selected values per variant type (we need to track selections)
              // For simplicity, we'll use the selectedVariant to determine current selections

              // Get the currently selected values per variant type from the selected variant
              const currentVariantValues = currentVariant?.variantValues || [];
              const selectedValuesByType = new Map<string, string>();
              currentVariantValues.forEach(vv => {
                if (!(hasVariantImages && product.imageVariantType && vv.variantType.id === product.imageVariantType.id)) {
                  selectedValuesByType.set(vv.variantType.id, vv.value);
                }
              });

              // Function to find a variant that matches the selected values
              const findMatchingVariant = (typeId: string, newValue: string) => {
                const newSelections = new Map(selectedValuesByType);
                newSelections.set(typeId, newValue);

                return filteredVariants.find(v => {
                  const vValues = v.variantValues?.filter(vv =>
                    !(hasVariantImages && product.imageVariantType && vv.variantType.id === product.imageVariantType.id)
                  ) || [];

                  // Check if all selected values match
                  return Array.from(newSelections.entries()).every(([tid, tval]) => {
                    const match = vValues.find(vv => vv.variantType.id === tid);
                    return match?.value === tval;
                  });
                });
              };

              return otherVariantTypes.length > 0 ? (
                <div className="space-y-3 lg:space-y-4">
                  {otherVariantTypes.map((variantType) => {
                    const values = Array.from(variantType.values);
                    const selectedValue = selectedValuesByType.get(variantType.id);

                    return (
                      <div key={variantType.id} className="space-y-2.5 lg:space-y-3">
                        {/* Mobile: "Elige tu sabor" style label / Desktop: variant type name */}
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-bold lg:font-medium text-slate-900 lg:text-neutral-700 dark:text-neutral-300">
                            <span className="lg:hidden">Elige tu {variantType.name.toLowerCase()}</span>
                            <span className="hidden lg:inline">{variantType.name}</span>
                          </h3>
                          {selectedValue && (
                            <span className="hidden lg:inline text-sm text-cyan-600 dark:text-cyan-400 font-medium">
                              {selectedValue}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {values.map((value) => {
                            const isSelected = selectedValue === value;
                            const matchingVariant = findMatchingVariant(variantType.id, value);
                            const isAvailable = !!matchingVariant;
                            const variantStock = matchingVariant?.stock;

                            return (
                              <button
                                key={value}
                                onClick={() => {
                                  if (matchingVariant) {
                                    setSelectedVariant(matchingVariant.id);
                                  }
                                }}
                                disabled={!isAvailable}
                                className={cn(
                                  'relative transition-all min-w-[50px]',
                                  // Mobile: rounded-xl chips with gradient selected
                                  'px-4 py-2.5 rounded-xl',
                                  // Desktop: keep old style
                                  'lg:rounded-xl lg:border',
                                  isSelected
                                    ? 'bg-gradient-to-b from-cyan-500 to-blue-600 text-white font-bold border-transparent lg:border-cyan-500 lg:bg-cyan-500/10 lg:bg-none lg:text-cyan-700 lg:dark:text-cyan-300 lg:font-medium'
                                    : isAvailable
                                      ? 'bg-white border border-slate-200 dark:border-neutral-700 text-slate-500 dark:text-neutral-300 font-semibold lg:font-medium hover:border-cyan-400'
                                      : 'bg-white border border-slate-100 dark:border-neutral-800 text-slate-300 dark:text-neutral-600 cursor-not-allowed opacity-50'
                                )}
                              >
                                <span className="text-xs lg:text-sm">{value}</span>
                                {variantStock !== null && variantStock !== undefined && variantStock <= 3 && variantStock > 0 && (
                                  <span className="ml-1.5 text-xs text-amber-500">
                                    ({variantStock})
                                  </span>
                                )}
                                {isSelected && (
                                  <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-cyan-500 hidden lg:flex items-center justify-center">
                                    <Check className="w-2.5 h-2.5 text-white" />
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : null;
            })()}

            {/* Quantity - V0 Style */}
            <div className="space-y-2.5 lg:space-y-3">
              <h3 className="text-sm font-bold lg:font-medium text-slate-900 lg:text-neutral-700 dark:text-neutral-300">
                Cantidad
              </h3>
              <div className="flex items-center gap-4">
                {/* Mobile: separate rounded buttons */}
                <div className="flex lg:hidden items-center gap-4">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-10 h-10 rounded-[10px] bg-slate-100 dark:bg-neutral-800 flex items-center justify-center text-slate-500 dark:text-neutral-400 active:scale-95 transition-all"
                  >
                    <Minus className="w-[18px] h-[18px]" />
                  </button>
                  <span className="text-xl font-extrabold text-slate-900 dark:text-white min-w-[24px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(q => q + 1)}
                    className="w-10 h-10 rounded-[10px] bg-cyan-600 flex items-center justify-center text-white active:scale-95 transition-all"
                  >
                    <Plus className="w-[18px] h-[18px]" />
                  </button>
                </div>
                {/* Desktop: bordered container */}
                <div className="hidden lg:flex items-center border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-10 h-10 flex items-center justify-center text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-medium text-neutral-900 dark:text-white">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(q => q + 1)}
                    className="w-10 h-10 flex items-center justify-center text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {product.showPrice && (
                  <span className="text-sm text-neutral-500 hidden lg:inline">
                    Total: <span className="font-semibold text-neutral-900 dark:text-white">
                      S/ {(displayPrice * quantity).toFixed(2)}
                    </span>
                  </span>
                )}
              </div>
            </div>

            {/* CTA Buttons - V0 Style */}
            <div className="flex flex-col gap-3 pt-2 lg:pt-4">
              {/* Mobile: WhatsApp first, then Cart */}
              {/* Desktop: Cart first, then WhatsApp */}

              {/* Desktop Cart Button (shows first on desktop) */}
              {settings.cartEnabled && (
                <div className="hidden lg:block">
                  <AddToCartButton
                    item={{
                      id: currentVariant?.id || product.id,
                      productId: product.id,
                      name: product.name,
                      price: displayPrice,
                      image: currentVariant?.image || images[0]?.url || null,
                      variant: currentVariant
                        ? {
                            id: currentVariant.id,
                            name: currentVariant.name || '',
                            values: currentVariant.variantValues?.map(v => `${v.variantType.name}: ${v.value}`).join(', ') || '',
                          }
                        : undefined,
                      maxStock: displayStock,
                    }}
                    quantity={quantity}
                  />
                </div>
              )}

              {/* WhatsApp Button - Mobile: green gradient prominent, Desktop: subtle */}
              <button
                onClick={handleWhatsAppOrder}
                className={cn(
                  'w-full flex items-center justify-center gap-2 transition-all duration-200',
                  // Mobile: green gradient, tall, rounded-2xl, shadow
                  'h-[54px] rounded-2xl text-[15px] font-bold bg-gradient-to-b from-[#25D366] to-[#128C7E] text-white shadow-[0_6px_20px_#0EA5E940]',
                  // Desktop: subtle style
                  'lg:h-auto lg:px-5 lg:py-2.5 lg:rounded-lg lg:text-sm lg:font-medium lg:bg-none lg:bg-emerald-500/10 lg:text-emerald-600 lg:dark:text-emerald-400 lg:border lg:border-emerald-500/20 lg:hover:bg-emerald-500/20 lg:shadow-none'
                )}
              >
                {/* Mobile: message-circle icon */}
                <MessageCircle className="w-[18px] h-[18px] lg:hidden" />
                {/* Desktop: WhatsApp SVG icon */}
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current hidden lg:block">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Pedir por WhatsApp
              </button>

              {/* Mobile Cart Button - outlined, cyan border, below WhatsApp */}
              {settings.cartEnabled && (
                <div className="lg:hidden">
                  <AddToCartButton
                    item={{
                      id: currentVariant?.id || product.id,
                      productId: product.id,
                      name: product.name,
                      price: displayPrice,
                      image: currentVariant?.image || images[0]?.url || null,
                      variant: currentVariant
                        ? {
                            id: currentVariant.id,
                            name: currentVariant.name || '',
                            values: currentVariant.variantValues?.map(v => `${v.variantType.name}: ${v.value}`).join(', ') || '',
                          }
                        : undefined,
                      maxStock: displayStock,
                    }}
                    quantity={quantity}
                    className="!h-[50px] !rounded-2xl !border-[1.5px] !border-cyan-600 !bg-white dark:!bg-transparent !text-cyan-600 dark:!text-cyan-400 !text-[15px] !font-bold hover:!bg-cyan-50"
                  />
                </div>
              )}
            </div>

            {/* Features - V0 Style (Desktop only) */}
            <div className="hidden lg:grid grid-cols-3 gap-3 pt-6 mt-2 border-t border-neutral-200 dark:border-neutral-800">
              {[
                { icon: Truck, label: 'Envío' },
                { icon: Shield, label: 'Garantía' },
                { icon: RotateCcw, label: 'Devolución' },
              ].map((feature) => (
                <div key={feature.label} className="text-center">
                  <div className="w-10 h-10 mx-auto mb-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                    <feature.icon className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
                  </div>
                  <span className="text-xs text-neutral-500">{feature.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Related Products - V0 Style */}
        {relatedProducts.length > 0 && (
          <motion.section
            className="mt-16 pt-10 border-t border-neutral-200 dark:border-neutral-800"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: v0Ease }}
          >
            <h2 className="text-xl md:text-2xl font-semibold text-neutral-900 dark:text-white mb-6">
              También te puede interesar
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.slice(0, 4).map((relatedProduct, index) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} index={index} />
              ))}
            </div>
          </motion.section>
        )}
      </div>

      {/* Footer */}
      <Footer settings={settings} />

      {/* WhatsApp Button */}
      {settings.whatsapp && (
        <WhatsAppButton
          phoneNumber={settings.whatsapp}
          businessName={settings.businessName || 'el catálogo'}
        />
      )}

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />

    </div>
  );
}
