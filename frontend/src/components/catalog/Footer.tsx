'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Facebook, Instagram, MessageCircle, Mail, Phone, MapPin, Zap, Star, Sparkles, ArrowRight, Crown, Heart } from 'lucide-react';
import { v0Ease } from '@/lib/animations';
import type { CatalogSettings, CatalogCategory } from '@/lib/api/catalog';

interface FooterProps {
  settings: CatalogSettings;
  categories?: CatalogCategory[];
}

export function Footer({ settings, categories }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-neutral-900 via-neutral-950 to-black dark:from-neutral-950 dark:via-black dark:to-black" />

      {/* Decorative gradient orbs */}
      <motion.div
        className="absolute -top-40 -left-40 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl"
        animate={{ scale: [1, 1.2, 1], x: [0, 30, 0] }}
        transition={{ duration: 10, repeat: Infinity }}
      />
      <motion.div
        className="absolute -bottom-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl"
        animate={{ scale: [1.2, 1, 1.2], y: [0, 30, 0] }}
        transition={{ duration: 12, repeat: Infinity }}
      />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(34,211,238,1) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* MOBILE FOOTER */}
        <div className="lg:hidden py-8 pb-28">
          {/* Logo and Social */}
          <div className="flex items-center justify-between mb-6">
            <Link href="/" className="flex items-center gap-3">
              {settings.logo ? (
                <motion.div
                  className="relative w-12 h-12 rounded-xl overflow-hidden ring-2 ring-cyan-500/30 shadow-lg shadow-cyan-500/20"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <Image
                    src={settings.logo}
                    alt={settings.businessName || 'Logo'}
                    fill
                    className="object-contain"
                  />
                </motion.div>
              ) : (
                <motion.div
                  className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <span className="text-white font-bold text-lg">
                    {(settings.businessName || 'C')[0]}
                  </span>
                </motion.div>
              )}
              <div>
                <span className="text-lg font-bold text-white block">
                  {settings.businessName || 'Catálogo'}
                </span>
                <span className="text-xs text-cyan-400 flex items-center gap-1">
                  <Crown className="w-3 h-3" />
                  Premium Store
                </span>
              </div>
            </Link>

            {/* Social Links - Colorful */}
            <div className="flex items-center gap-2">
              {settings.facebook && (
                <motion.a
                  href={settings.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white shadow-lg shadow-blue-500/30"
                  whileHover={{ scale: 1.15, rotate: 10 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Facebook className="w-5 h-5" />
                </motion.a>
              )}
              {settings.instagram && (
                <motion.a
                  href={settings.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500 flex items-center justify-center text-white shadow-lg shadow-pink-500/30"
                  whileHover={{ scale: 1.15, rotate: -10 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Instagram className="w-5 h-5" />
                </motion.a>
              )}
              {settings.whatsapp && (
                <motion.a
                  href={`https://wa.me/${settings.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30"
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <MessageCircle className="w-5 h-5" />
                </motion.a>
              )}
            </div>
          </div>

          {/* Contact info - Colorful pills */}
          <div className="flex flex-wrap gap-2 mb-6">
            {settings.whatsapp && (
              <a
                href={`https://wa.me/${settings.whatsapp.replace(/\D/g, '')}`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm font-medium hover:bg-emerald-500/30 transition-all duration-300"
              >
                <Phone className="w-4 h-4" />
                {settings.whatsapp}
              </a>
            )}
            {settings.email && (
              <a
                href={`mailto:${settings.email}`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-xl text-blue-400 text-sm font-medium hover:bg-blue-500/30 transition-all duration-300"
              >
                <Mail className="w-4 h-4" />
                <span className="truncate max-w-[150px]">{settings.email}</span>
              </a>
            )}
          </div>

          {/* Copyright - Mobile */}
          <div className="pt-6 border-t border-white/10 flex items-center justify-between">
            <p className="text-white/50 text-xs">
              © {currentYear} {settings.businessName || 'Catálogo'}
            </p>
            <motion.div
              className="flex items-center gap-1 text-white/50 text-xs"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span>Hecho con</span>
              <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
              <span>en Perú</span>
            </motion.div>
          </div>
        </div>

        {/* DESKTOP FOOTER */}
        <div className="hidden lg:block py-16">
          {/* Top Section with CTA */}
          <motion.div
            className="mb-12 p-8 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 rounded-3xl border border-white/10"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  ¿Tienes alguna pregunta?
                </h3>
                <p className="text-white/60">
                  Estamos aquí para ayudarte. Contáctanos por WhatsApp.
                </p>
              </div>
              {settings.whatsapp && (
                <motion.a
                  href={`https://wa.me/${settings.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-400 to-green-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <MessageCircle className="w-5 h-5" />
                  Chatear ahora
                  <ArrowRight className="w-4 h-4" />
                </motion.a>
              )}
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
            {/* Brand Column */}
            <motion.div
              className="lg:col-span-1"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: v0Ease }}
            >
              <Link href="/" className="flex items-center gap-3 mb-5">
                {settings.logo ? (
                  <motion.div
                    className="relative w-14 h-14 rounded-xl overflow-hidden ring-2 ring-cyan-500/30 shadow-lg shadow-cyan-500/20"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <Image
                      src={settings.logo}
                      alt={settings.businessName || 'Logo'}
                      fill
                      className="object-contain"
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <span className="text-white font-bold text-xl">
                      {(settings.businessName || 'C')[0]}
                    </span>
                  </motion.div>
                )}
                <div>
                  <span className="text-xl font-bold text-white block">
                    {settings.businessName || 'Catálogo'}
                  </span>
                  <span className="text-xs text-cyan-400 flex items-center gap-1">
                    <Crown className="w-3 h-3" />
                    Premium Store
                  </span>
                </div>
              </Link>
              <p className="text-white/50 text-sm leading-relaxed mb-6">
                Tu tienda de confianza con los mejores productos y precios del mercado. Calidad garantizada.
              </p>

              {/* Social Links - Super Colorful */}
              <div className="flex items-center gap-3">
                {settings.facebook && (
                  <motion.a
                    href={settings.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white shadow-lg shadow-blue-500/30"
                    whileHover={{ scale: 1.15, rotate: 10 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Facebook className="w-6 h-6" />
                  </motion.a>
                )}
                {settings.instagram && (
                  <motion.a
                    href={settings.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500 flex items-center justify-center text-white shadow-lg shadow-pink-500/30"
                    whileHover={{ scale: 1.15, rotate: -10 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Instagram className="w-6 h-6" />
                  </motion.a>
                )}
                {settings.whatsapp && (
                  <motion.a
                    href={`https://wa.me/${settings.whatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30"
                    whileHover={{ scale: 1.15, y: -5 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <MessageCircle className="w-6 h-6" />
                  </motion.a>
                )}
              </div>
            </motion.div>

            {/* Quick Links - Colorful */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1, ease: v0Ease }}
            >
              <h3 className="text-white font-bold mb-5 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </span>
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
                      className="text-white/60 hover:text-cyan-400 text-sm transition-all duration-300 inline-flex items-center gap-2 group hover:translate-x-1"
                    >
                      <span className="w-2 h-2 rounded-full bg-cyan-500/50 group-hover:bg-cyan-500 transition-colors duration-300" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Categories - Colorful */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2, ease: v0Ease }}
            >
              <h3 className="text-white font-bold mb-5 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                  <Star className="w-4 h-4 text-white" />
                </span>
                Categorías
              </h3>
              <ul className="space-y-3">
                {categories && categories.slice(0, 4).map((category) => (
                  <li key={category.id}>
                    <Link
                      href={`/categorias/${category.slug}`}
                      className="text-white/60 hover:text-purple-400 text-sm transition-all duration-300 inline-flex items-center gap-2 group hover:translate-x-1"
                    >
                      <span className="w-2 h-2 rounded-full bg-purple-500/50 group-hover:bg-purple-500 transition-colors duration-300" />
                      {category.name}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    href="/categorias"
                    className="text-white/60 hover:text-purple-400 text-sm transition-all duration-300 inline-flex items-center gap-2 group hover:translate-x-1"
                  >
                    <span className="w-2 h-2 rounded-full bg-purple-500/50 group-hover:bg-purple-500 transition-colors duration-300" />
                    Ver todas
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </li>
              </ul>
            </motion.div>

            {/* Contact - Colorful */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3, ease: v0Ease }}
            >
              <h3 className="text-white font-bold mb-5 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </span>
                Contacto
              </h3>
              <ul className="space-y-4">
                {settings.whatsapp && (
                  <li>
                    <a
                      href={`https://wa.me/${settings.whatsapp.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-all duration-300">
                        <Phone className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-white/60 text-sm group-hover:text-emerald-400 transition-colors">
                        {settings.whatsapp}
                      </span>
                    </a>
                  </li>
                )}
                {settings.email && (
                  <li>
                    <a
                      href={`mailto:${settings.email}`}
                      className="flex items-center gap-3 group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all duration-300">
                        <Mail className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-white/60 text-sm group-hover:text-blue-400 transition-colors truncate max-w-[180px]">
                        {settings.email}
                      </span>
                    </a>
                  </li>
                )}
                {settings.address && (
                  <li className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-500/20">
                      <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-white/60 text-sm pt-2">
                      {settings.address}
                    </span>
                  </li>
                )}
              </ul>
            </motion.div>
          </div>
        </div>

        {/* Bottom Bar - Desktop */}
        <div className="hidden lg:block py-6 border-t border-white/10">
          <div className="flex items-center justify-between">
            <p className="text-white/40 text-sm">
              © {currentYear} {settings.businessName || 'Catálogo'}. Todos los derechos reservados.
            </p>
            <motion.div
              className="flex items-center gap-2 text-white/40 text-sm"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span>Hecho con</span>
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
              <span>en</span>
              <span className="font-semibold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Perú</span>
            </motion.div>
          </div>
        </div>
      </div>
    </footer>
  );
}
