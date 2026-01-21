'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Facebook, Instagram, MessageCircle, Mail, Phone, MapPin, Sparkles } from 'lucide-react';
import { v0Ease } from '@/lib/animations';
import type { CatalogSettings, CatalogCategory } from '@/lib/api/catalog';

interface FooterProps {
  settings: CatalogSettings;
  categories?: CatalogCategory[];
}

export function Footer({ settings, categories }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-[#0a0a0f] overflow-hidden">
      {/* V0 Soft Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(139,92,246,0.08),transparent)]" />
      <div className="absolute inset-0 bg-[radial-gradient(at_80%_20%,rgba(236,72,153,0.05),transparent)]" />

      {/* Dot Pattern */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: 'radial-gradient(rgba(167, 139, 250, 0.08) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* MOBILE FOOTER - Compact V0 Soft version */}
        <div className="lg:hidden py-6 pb-24">
          {/* Brand + Social in one row */}
          <div className="flex items-center justify-between mb-4">
            <Link href="/" className="flex items-center gap-2">
              {settings.logo ? (
                <div className="relative w-8 h-8 rounded-xl overflow-hidden border border-white/[0.06] shadow-lg shadow-violet-500/10">
                  <Image
                    src={settings.logo}
                    alt={settings.businessName || 'Logo'}
                    fill
                    className="object-contain"
                  />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center shadow-lg shadow-violet-500/25">
                  <span className="text-white font-semibold text-sm">
                    {(settings.businessName || 'C')[0]}
                  </span>
                </div>
              )}
              <span className="text-base font-medium text-white">
                {settings.businessName || 'Catálogo'}
              </span>
            </Link>

            {/* Social Links - V0 Soft */}
            <div className="flex items-center gap-1.5">
              {settings.facebook && (
                <a
                  href={settings.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-white/60 hover:text-violet-400 hover:border-violet-500/30 hover:bg-violet-500/10 transition-all duration-300"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {settings.instagram && (
                <a
                  href={settings.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-white/60 hover:text-pink-400 hover:border-pink-500/30 hover:bg-pink-500/10 transition-all duration-300"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {settings.whatsapp && (
                <a
                  href={`https://wa.me/${settings.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 hover:bg-emerald-500/20 transition-all duration-300"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Contact info - V0 Soft pills */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-white/50 mb-4">
            {settings.whatsapp && (
              <a
                href={`https://wa.me/${settings.whatsapp.replace(/\D/g, '')}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.04] border border-white/[0.06] rounded-full hover:border-violet-500/30 hover:bg-violet-500/5 transition-all duration-300"
              >
                <Phone className="w-3 h-3 text-violet-400" />
                <span>{settings.whatsapp}</span>
              </a>
            )}
            {settings.email && (
              <a
                href={`mailto:${settings.email}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.04] border border-white/[0.06] rounded-full hover:border-pink-500/30 hover:bg-pink-500/5 transition-all duration-300"
              >
                <Mail className="w-3 h-3 text-pink-400" />
                <span className="truncate max-w-[140px]">{settings.email}</span>
              </a>
            )}
          </div>

          {/* Copyright - Mobile V0 Soft */}
          <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
            <p className="text-white/40 text-xs">
              © {currentYear} {settings.businessName || 'Catálogo'}
            </p>
            <div className="flex items-center gap-1 text-white/40 text-[10px]">
              <span>Hecho con</span>
              <motion.span
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                className="text-pink-400"
              >
                ❤️
              </motion.span>
              <span>en Perú</span>
            </div>
          </div>
        </div>

        {/* DESKTOP FOOTER - V0 Soft Full version */}
        <div className="hidden lg:block py-12 lg:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
            {/* Brand Column */}
            <motion.div
              className="lg:col-span-1"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: v0Ease }}
            >
              <Link href="/" className="flex items-center gap-3 mb-4">
                {settings.logo ? (
                  <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-white/[0.06] shadow-lg shadow-violet-500/10">
                    <Image
                      src={settings.logo}
                      alt={settings.businessName || 'Logo'}
                      fill
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center shadow-lg shadow-violet-500/25">
                    <span className="text-white font-semibold">
                      {(settings.businessName || 'C')[0]}
                    </span>
                  </div>
                )}
                <span className="text-lg font-semibold text-white">
                  {settings.businessName || 'Catálogo'}
                </span>
              </Link>
              <p className="text-white/50 text-sm leading-relaxed mb-6">
                Tu tienda de confianza con los mejores productos y precios del mercado.
              </p>

              {/* Social Links - V0 Soft Style */}
              <div className="flex items-center gap-2">
                {settings.facebook && (
                  <motion.a
                    href={settings.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-white/60 hover:text-violet-400 hover:border-violet-500/30 hover:bg-violet-500/10 transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Facebook className="w-5 h-5" />
                  </motion.a>
                )}
                {settings.instagram && (
                  <motion.a
                    href={settings.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-white/60 hover:text-pink-400 hover:border-pink-500/30 hover:bg-pink-500/10 transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Instagram className="w-5 h-5" />
                  </motion.a>
                )}
                {settings.whatsapp && (
                  <motion.a
                    href={`https://wa.me/${settings.whatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/30 transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <MessageCircle className="w-5 h-5" />
                  </motion.a>
                )}
              </div>
            </motion.div>

            {/* Quick Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1, ease: v0Ease }}
            >
              <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-violet-400" />
                Navegación
              </h3>
              <ul className="space-y-3">
                {[
                  { href: '/', label: 'Inicio' },
                  { href: '/categorias', label: 'Categorías' },
                  { href: '/productos', label: 'Productos' },
                  { href: '/productos?ofertas=true', label: 'Ofertas' },
                ].map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-white/50 hover:text-violet-400 text-sm transition-colors duration-300 inline-flex items-center gap-2 group"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-violet-500/30 group-hover:bg-violet-500 transition-colors duration-300" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Categories */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2, ease: v0Ease }}
            >
              <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-pink-400" />
                Categorías
              </h3>
              <ul className="space-y-3">
                {categories && categories.slice(0, 4).map((category) => (
                  <li key={category.id}>
                    <Link
                      href={`/categorias/${category.slug}`}
                      className="text-white/50 hover:text-pink-400 text-sm transition-colors duration-300 inline-flex items-center gap-2 group"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-pink-500/30 group-hover:bg-pink-500 transition-colors duration-300" />
                      {category.name}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    href="/categorias"
                    className="text-white/50 hover:text-pink-400 text-sm transition-colors duration-300 inline-flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-pink-500/30 group-hover:bg-pink-500 transition-colors duration-300" />
                    Ver todas
                  </Link>
                </li>
              </ul>
            </motion.div>

            {/* Contact */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3, ease: v0Ease }}
            >
              <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                Contacto
              </h3>
              <ul className="space-y-3">
                {settings.whatsapp && (
                  <li>
                    <a
                      href={`https://wa.me/${settings.whatsapp.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/50 hover:text-white text-sm transition-colors duration-300 inline-flex items-center gap-3"
                    >
                      <div className="w-8 h-8 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                        <Phone className="w-4 h-4 text-violet-400" />
                      </div>
                      {settings.whatsapp}
                    </a>
                  </li>
                )}
                {settings.email && (
                  <li>
                    <a
                      href={`mailto:${settings.email}`}
                      className="text-white/50 hover:text-white text-sm transition-colors duration-300 inline-flex items-center gap-3"
                    >
                      <div className="w-8 h-8 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center">
                        <Mail className="w-4 h-4 text-pink-400" />
                      </div>
                      {settings.email}
                    </a>
                  </li>
                )}
                {settings.address && (
                  <li className="text-white/50 text-sm inline-flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-4 h-4 text-purple-400" />
                    </div>
                    <span>{settings.address}</span>
                  </li>
                )}
              </ul>
            </motion.div>
          </div>
        </div>

        {/* Bottom Bar - Desktop V0 Soft */}
        <div className="hidden lg:block py-6 border-t border-white/[0.06]">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-white/40 text-sm">
              © {currentYear} {settings.businessName || 'Catálogo'}. Todos los derechos reservados.
            </p>
            <div className="flex items-center gap-1.5 text-white/40 text-xs">
              <span>Hecho con</span>
              <motion.span
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                className="text-pink-400"
              >
                ❤️
              </motion.span>
              <span>en Perú</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
