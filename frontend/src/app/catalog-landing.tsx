'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import {
  ArrowRight,
  Sparkles,
  TrendingUp,
  Tag,
  ChevronRight,
  Star,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ProductCard,
  WhatsAppButton,
  Footer,
  Navbar,
} from '@/components/catalog';
import type { CatalogHomeData } from '@/lib/api/catalog';
import { cn } from '@/lib/utils';

interface CatalogLandingProps {
  data: CatalogHomeData;
}

export function CatalogLanding({ data }: CatalogLandingProps) {
  const { settings, categories, featuredProducts, brands } = data;
  const [currentSlide, setCurrentSlide] = useState(0);

  if (!settings) {
    return null;
  }

  const featuredOnly = featuredProducts.filter((p) => p.isFeatured).slice(0, 8);
  const productsOnSale = featuredProducts.filter((p) => p.salePrice).slice(0, 8);

  // Hero products for slideshow
  const heroProducts = featuredOnly.length > 0 ? featuredOnly.slice(0, 4) : featuredProducts.slice(0, 4);

  // Auto-rotate slides
  useEffect(() => {
    if (heroProducts.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroProducts.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroProducts.length]);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Navbar - transparent over hero */}
      <Navbar settings={settings} categories={categories} transparent />

      {/* Hero Section - Clean & Modern */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />

        {/* Subtle Pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm-30 30v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />

        {/* Floating Blurs */}
        <motion.div
          className="absolute top-1/4 left-10 w-72 h-72 bg-violet-500/20 rounded-full blur-[100px]"
          animate={{ y: [0, 30, 0], x: [0, 20, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-1/4 right-10 w-96 h-96 bg-fuchsia-500/20 rounded-full blur-[120px]"
          animate={{ y: [0, -40, 0], x: [0, -30, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 lg:py-0">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="text-center lg:text-left"
            >
              {/* Badge */}
              {productsOnSale.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-rose-500/20 backdrop-blur-sm border border-rose-500/30 rounded-full text-rose-300 text-sm font-semibold mb-8"
                >
                  <Tag className="w-4 h-4" />
                  ¡Hasta 50% de descuento!
                </motion.div>
              )}

              {/* Title */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-[1.1] mb-6">
                Encuentra lo que
                <span className="block mt-2 bg-gradient-to-r from-amber-300 via-yellow-300 to-orange-300 bg-clip-text text-transparent">
                  estás buscando
                </span>
              </h1>

              {/* Description */}
              <p className="text-lg lg:text-xl text-slate-300 max-w-xl mx-auto lg:mx-0 mb-10">
                Las mejores marcas, los mejores precios. Compra fácil y recibe en la puerta de tu casa.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center lg:items-start gap-4">
                <Link
                  href="/buscar"
                  className="group inline-flex items-center gap-3 px-8 py-4 bg-white text-slate-900 rounded-full font-semibold text-lg hover:bg-slate-100 transition-all shadow-lg shadow-white/10"
                >
                  Ver Catálogo
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/categorias"
                  className="inline-flex items-center gap-2 px-8 py-4 text-white/90 hover:text-white font-medium transition-colors"
                >
                  Explorar Categorías
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </div>

              {/* Stats */}
              <div className="flex items-center justify-center lg:justify-start gap-8 mt-12 pt-8 border-t border-white/10">
                <div>
                  <p className="text-3xl font-bold text-white">{featuredProducts.length}+</p>
                  <p className="text-sm text-slate-400">Productos</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">{categories.length}</p>
                  <p className="text-sm text-slate-400">Categorías</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">{brands.length}+</p>
                  <p className="text-sm text-slate-400">Marcas</p>
                </div>
              </div>
            </motion.div>

            {/* Right Content - Product Showcase */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
              className="relative hidden lg:block"
            >
              {heroProducts.length > 0 && (
                <div className="relative">
                  {/* Main Product Card */}
                  <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="relative aspect-[4/5] rounded-3xl overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 shadow-2xl"
                  >
                    {heroProducts[currentSlide]?.images?.[0]?.url && (
                      <Image
                        src={heroProducts[currentSlide].images[0].url}
                        alt={heroProducts[currentSlide].name}
                        fill
                        className="object-cover"
                        priority
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {/* Product Info */}
                    <div className="absolute bottom-0 left-0 right-0 p-8">
                      <div className="flex items-center gap-2 mb-3">
                        {heroProducts[currentSlide].brand && (
                          <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs font-medium">
                            {heroProducts[currentSlide].brand.name}
                          </span>
                        )}
                        {heroProducts[currentSlide].salePrice && (
                          <span className="px-3 py-1 bg-rose-500 rounded-full text-white text-xs font-bold">
                            OFERTA
                          </span>
                        )}
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-2">
                        {heroProducts[currentSlide].name}
                      </h3>
                      <div className="flex items-baseline gap-3">
                        <span className="text-3xl font-bold text-white">
                          {settings.currency} {Number(heroProducts[currentSlide].salePrice || heroProducts[currentSlide].price).toFixed(2)}
                        </span>
                        {heroProducts[currentSlide].salePrice && (
                          <span className="text-lg text-white/50 line-through">
                            {settings.currency} {Number(heroProducts[currentSlide].price).toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>

                  {/* Slide Indicators */}
                  {heroProducts.length > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-6">
                      {heroProducts.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentSlide(index)}
                          className={cn(
                            'h-2 rounded-full transition-all duration-300',
                            currentSlide === index
                              ? 'w-8 bg-white'
                              : 'w-2 bg-white/30 hover:bg-white/50'
                          )}
                        />
                      ))}
                    </div>
                  )}

                  {/* Decorative */}
                  <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-2xl -z-10 blur-sm opacity-50" />
                  <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl -z-10 blur-sm opacity-30" />
                </div>
              )}
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2">
            <motion.div
              className="w-1.5 h-1.5 bg-white rounded-full"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </section>

      {/* Categories Section */}
      {categories.length > 0 && (
        <section className="py-20 lg:py-28 bg-slate-50 dark:bg-slate-900/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                Explora por Categoría
              </h2>
              <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                Encuentra exactamente lo que buscas navegando por nuestras categorías
              </p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
              {categories.slice(0, 8).map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    href={`/categorias/${category.slug}`}
                    className="group block relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-200 dark:bg-slate-800"
                  >
                    {category.image && (
                      <Image
                        src={category.image}
                        alt={category.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute inset-0 flex items-end p-5">
                      <div>
                        <h3 className="text-lg font-bold text-white mb-1">
                          {category.name}
                        </h3>
                        <span className="text-sm text-white/70 group-hover:text-white transition-colors flex items-center gap-1">
                          Ver productos
                          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            {categories.length > 8 && (
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-center mt-10"
              >
                <Link
                  href="/categorias"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
                >
                  Ver todas las categorías
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            )}
          </div>
        </section>
      )}

      {/* Featured Products Section */}
      {featuredOnly.length > 0 && (
        <section className="py-20 lg:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-end justify-between mb-12"
            >
              <div>
                <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400 mb-2">
                  <Star className="w-5 h-5 fill-current" />
                  <span className="text-sm font-semibold uppercase tracking-wider">Destacados</span>
                </div>
                <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white">
                  Productos Destacados
                </h2>
              </div>
              <Link
                href="/buscar?destacados=true"
                className="hidden sm:flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 font-medium transition-colors"
              >
                Ver todos
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
              {featuredOnly.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Offers Section */}
      {productsOnSale.length > 0 && (
        <section className="py-20 lg:py-28 bg-gradient-to-br from-rose-50 to-orange-50 dark:from-rose-950/20 dark:to-orange-950/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-end justify-between mb-12"
            >
              <div>
                <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 mb-2">
                  <Tag className="w-5 h-5" />
                  <span className="text-sm font-semibold uppercase tracking-wider">Ofertas</span>
                </div>
                <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white">
                  Aprovecha las Ofertas
                </h2>
              </div>
              <Link
                href="/buscar?ofertas=true"
                className="hidden sm:flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 font-medium transition-colors"
              >
                Ver todas
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
              {productsOnSale.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Brands Section */}
      {brands.length > 0 && (
        <section className="py-16 lg:py-20 border-t border-slate-200 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-10"
            >
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Marcas que Confían en Nosotros
              </h2>
              <p className="text-slate-500 dark:text-slate-400">
                Trabajamos con las mejores marcas del mercado
              </p>
            </motion.div>

            <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-12">
              {brands.slice(0, 10).map((brand, index) => (
                <motion.div
                  key={brand.id}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="group"
                >
                  <Link
                    href={`/buscar?marca=${brand.slug}`}
                    className="block px-6 py-3 text-lg font-semibold text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    {brand.name}
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 lg:py-28 bg-slate-900 dark:bg-slate-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <TrendingUp className="w-12 h-12 text-violet-400 mx-auto mb-6" />
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
              ¿Listo para comenzar?
            </h2>
            <p className="text-lg text-slate-400 mb-10 max-w-2xl mx-auto">
              Explora nuestro catálogo completo y encuentra los productos perfectos para ti.
              Envíos rápidos y atención personalizada por WhatsApp.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/buscar"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-slate-900 rounded-full font-semibold hover:bg-slate-100 transition-colors"
              >
                Explorar Productos
                <ArrowRight className="w-5 h-5" />
              </Link>
              {settings.whatsapp && (
                <a
                  href={`https://wa.me/${settings.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(settings.welcomeMessage || '¡Hola! Me interesa conocer más sobre sus productos.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-green-500 text-white rounded-full font-semibold hover:bg-green-600 transition-colors"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Contáctanos
                </a>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <Footer settings={settings} />

      {/* WhatsApp Floating Button */}
      {settings.whatsapp && (
        <WhatsAppButton
          phoneNumber={settings.whatsapp}
          businessName={settings.businessName || 'el catálogo'}
        />
      )}
    </div>
  );
}
