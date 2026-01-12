'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import {
  ChevronLeft,
  ShoppingBag,
  Heart,
  Share2,
  Truck,
  Shield,
  RotateCcw,
  Check,
  Minus,
  Plus,
  MessageCircle,
  ChevronRight,
  Home,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProductCard, WhatsAppButton, Footer, AddToCartButton, MobileBottomNav } from '@/components/catalog';
import type { CatalogProduct, CatalogSettings, CatalogProductDetail } from '@/lib/api/catalog';
import { trackEvent } from '@/lib/api/catalog';
import { useTracking } from '@/hooks/useTracking';

interface ProductDetailProps {
  product: CatalogProductDetail;
  relatedProducts: CatalogProduct[];
  settings: CatalogSettings;
}

export function ProductDetail({ product, relatedProducts, settings }: ProductDetailProps) {
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
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Breadcrumb */}
      <div className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <motion.nav
            className="flex items-center gap-2 text-sm"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Link href="/" className="text-slate-500 hover:text-violet-600 transition-colors flex items-center gap-1">
              <Home className="w-4 h-4" />
              Inicio
            </Link>
            <ChevronRight className="w-4 h-4 text-slate-400" />
            <Link
              href={`/categorias/${product.category.slug}`}
              className="text-slate-500 hover:text-violet-600 transition-colors"
            >
              {product.category.name}
            </Link>
            <ChevronRight className="w-4 h-4 text-slate-400" />
            <span className="text-slate-900 dark:text-white font-medium truncate max-w-[200px]">
              {product.name}
            </span>
          </motion.nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 md:py-12">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Image Gallery */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Main Image */}
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-slate-100 dark:bg-slate-900">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedImage}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4 }}
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
                      <ShoppingBag className="w-24 h-24 text-slate-300" />
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Sale Badge */}
              {salePrice && (
                <motion.div
                  className="absolute top-4 left-4"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: 'spring' }}
                >
                  <div className="px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full text-white font-bold shadow-lg">
                    -{discount}% OFF
                  </div>
                </motion.div>
              )}

              {/* Action Buttons */}
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                <motion.button
                  onClick={() => setIsLiked(!isLiked)}
                  className={cn(
                    'w-12 h-12 rounded-full flex items-center justify-center transition-all',
                    isLiked
                      ? 'bg-rose-500 text-white'
                      : 'bg-white/90 dark:bg-slate-800/90 text-slate-600 dark:text-slate-300 hover:bg-rose-500 hover:text-white'
                  )}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Heart className={cn('w-5 h-5', isLiked && 'fill-current')} />
                </motion.button>
                <motion.button
                  onClick={handleShare}
                  className="w-12 h-12 rounded-full bg-white/90 dark:bg-slate-800/90 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-violet-500 hover:text-white transition-all"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Share2 className="w-5 h-5" />
                </motion.button>
              </div>

              {/* Image Navigation */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImage(prev => (prev > 0 ? prev - 1 : images.length - 1))}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 dark:bg-slate-800/90 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-violet-500 hover:text-white transition-all"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setSelectedImage(prev => (prev < images.length - 1 ? prev + 1 : 0))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 dark:bg-slate-800/90 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-violet-500 hover:text-white transition-all"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((image, index) => (
                  <motion.button
                    key={image.id}
                    onClick={() => setSelectedImage(index)}
                    className={cn(
                      'relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 ring-2 transition-all',
                      selectedImage === index
                        ? 'ring-violet-500'
                        : 'ring-transparent hover:ring-violet-300'
                    )}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Image
                      src={image.url}
                      alt={`${product.name} ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Product Info */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Category & Brand */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-violet-600 dark:text-violet-400 uppercase tracking-wider">
                {product.category.name}
              </span>
              {product.brand && (
                <>
                  <span className="w-1 h-1 rounded-full bg-slate-300" />
                  <span className="text-sm text-slate-500">{product.brand.name}</span>
                </>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
              {product.name}
            </h1>

            {/* Price */}
            {product.showPrice && (
              <div className="flex items-baseline gap-4">
                {salePrice ? (
                  <>
                    <span className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                      S/ {displayPrice.toFixed(2)}
                    </span>
                    <span className="text-xl text-slate-400 line-through">
                      S/ {price.toFixed(2)}
                    </span>
                    <span className="px-3 py-1 bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-full text-sm font-semibold">
                      Ahorras S/ {(price - (salePrice || 0)).toFixed(2)}
                    </span>
                  </>
                ) : (
                  <span className="text-4xl font-bold text-slate-900 dark:text-white">
                    S/ {displayPrice.toFixed(2)}
                  </span>
                )}
              </div>
            )}

            {/* Stock */}
            {product.showStock && displayStock !== null && (
              <div className="flex items-center gap-2">
                {displayStock > 0 ? (
                  <>
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                      {displayStock} disponibles
                    </span>
                  </>
                ) : (
                  <>
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <span className="text-rose-600 dark:text-rose-400 font-medium">
                      {product.stockMessage || 'Agotado'}
                    </span>
                  </>
                )}
              </div>
            )}

            {/* Description */}
            {product.description && (
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                {product.description}
              </p>
            )}

            {/* Variant Value Selector (e.g., Color selector with image change) */}
            {hasVariantImages && variantImageValues.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
                  {product.imageVariantType?.name || 'Variante'}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {variantImageValues.map((value) => {
                    const isSelected = selectedVariantValue === value;
                    const valueImages = product.imagesByVariantValue?.[value] || [];
                    const firstImage = valueImages[0]?.url;

                    return (
                      <motion.button
                        key={value}
                        onClick={() => setSelectedVariantValue(isSelected ? null : value)}
                        className={cn(
                          'relative rounded-xl border-2 transition-all overflow-hidden',
                          isSelected
                            ? 'border-violet-500 ring-2 ring-violet-500/20'
                            : 'border-slate-200 dark:border-slate-700 hover:border-violet-300'
                        )}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
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
                              <div className="absolute inset-0 bg-violet-500/20 flex items-center justify-center">
                                <div className="w-5 h-5 rounded-full bg-violet-500 flex items-center justify-center">
                                  <Check className="w-3 h-3 text-white" />
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className={cn(
                            'px-4 py-2 text-sm font-medium',
                            isSelected
                              ? 'bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300'
                              : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                          )}>
                            {value}
                          </div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
                {selectedVariantValue && (
                  <p className="text-sm text-violet-600 dark:text-violet-400">
                    {product.imageVariantType?.name}: <strong>{selectedVariantValue}</strong>
                  </p>
                )}
              </div>
            )}

            {/* Variants (Sub-products) - WooCommerce Style */}
            {variants.length > 0 && (() => {
              // Filter variants based on selected variant value (e.g., selected Color)
              // If a color is selected, only show variants with that color
              const filteredVariants = hasVariantImages && selectedVariantValue && product.imageVariantType
                ? variants.filter(v => {
                    const matchingValue = v.variantValues?.find(
                      vv => vv.variantType.id === product.imageVariantType?.id
                    );
                    return matchingValue?.value === selectedVariantValue;
                  })
                : variants;

              // Get the other variant types (not the image type) to show as labels
              const otherVariantTypes = hasVariantImages && product.imageVariantType
                ? [...new Set(variants.flatMap(v =>
                    v.variantValues?.filter(vv => vv.variantType.id !== product.imageVariantType?.id)
                      .map(vv => vv.variantType.name) || []
                  ))]
                : [];

              return filteredVariants.length > 0 ? (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
                    {otherVariantTypes.length > 0
                      ? `Selecciona ${otherVariantTypes.join(' / ')}`
                      : 'Opciones disponibles'}
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {filteredVariants.map((variant) => {
                      const variantPrice = variant.price ? Number(variant.price) : displayPrice;
                      const isSelected = selectedVariant === variant.id;

                      // Get the non-image variant values (e.g., Talla if Color is the image type)
                      const displayValues = hasVariantImages && product.imageVariantType
                        ? variant.variantValues?.filter(vv => vv.variantType.id !== product.imageVariantType?.id)
                        : variant.variantValues;

                      const label = displayValues?.map(v => v.value).join(' / ') || variant.name || 'Opción';

                      return (
                        <motion.button
                          key={variant.id}
                          onClick={() => setSelectedVariant(isSelected ? null : variant.id)}
                          className={cn(
                            'relative px-4 py-3 rounded-xl border-2 transition-all min-w-[60px]',
                            isSelected
                              ? 'border-violet-500 bg-violet-50 dark:bg-violet-500/20 ring-2 ring-violet-500/20'
                              : 'border-slate-200 dark:border-slate-700 hover:border-violet-300 bg-white dark:bg-slate-800'
                          )}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <p className={cn(
                            'text-sm font-semibold',
                            isSelected
                              ? 'text-violet-700 dark:text-violet-300'
                              : 'text-slate-900 dark:text-white'
                          )}>
                            {label}
                          </p>
                          {variant.price && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                              S/ {variantPrice.toFixed(2)}
                            </p>
                          )}
                          {variant.stock !== null && variant.stock !== undefined && variant.stock <= 3 && variant.stock > 0 && (
                            <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                              ¡Últimos {variant.stock}!
                            </p>
                          )}
                          {isSelected && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-violet-500 flex items-center justify-center">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              ) : null;
            })()}

            {/* Quantity */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
                Cantidad
              </h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-12 h-12 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-16 text-center font-semibold text-slate-900 dark:text-white">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(q => q + 1)}
                    className="w-12 h-12 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {product.showPrice && (
                  <div className="text-slate-500">
                    Total: <span className="font-semibold text-slate-900 dark:text-white">
                      S/ {(displayPrice * quantity).toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              {/* Botón Añadir al carrito - Solo si cartEnabled */}
              {settings.cartEnabled && (
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
              )}

              {/* Botón WhatsApp - Siempre visible */}
              <motion.button
                onClick={handleWhatsAppOrder}
                className={cn(
                  'flex-1 flex items-center justify-center gap-3',
                  'px-8 py-4 rounded-xl font-semibold text-white',
                  'bg-gradient-to-r from-green-500 to-green-600',
                  'shadow-lg shadow-green-500/25',
                  'hover:shadow-xl hover:shadow-green-500/30 transition-shadow'
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <MessageCircle className="w-5 h-5" />
                Pedir por WhatsApp
              </motion.button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200 dark:border-slate-800">
              {[
                { icon: Truck, label: 'Envío rápido' },
                { icon: Shield, label: 'Garantía' },
                { icon: RotateCcw, label: 'Devolución' },
              ].map((feature, index) => (
                <motion.div
                  key={feature.label}
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                >
                  <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-violet-100 dark:bg-violet-500/10 flex items-center justify-center">
                    <feature.icon className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                  </div>
                  <span className="text-xs text-slate-600 dark:text-slate-400">{feature.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <motion.section
            className="mt-20 pt-12 border-t border-slate-200 dark:border-slate-800"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-8">
              También te puede interesar
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
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

      {/* Spacer para bottom nav en móvil */}
      <div className="h-20 lg:hidden" />
    </div>
  );
}
