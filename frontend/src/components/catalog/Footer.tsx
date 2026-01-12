'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Facebook, Instagram, MessageCircle, Mail, Phone, MapPin, Sparkles } from 'lucide-react';
import type { CatalogSettings } from '@/lib/api/catalog';

interface FooterProps {
  settings: CatalogSettings;
}

export function Footer({ settings }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-gradient-to-b from-slate-900 to-slate-950 overflow-hidden">
      {/* Decorative gradient blur - hidden on mobile */}
      <div className="hidden lg:block absolute top-0 left-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-[120px] -translate-y-1/2" />
      <div className="hidden lg:block absolute bottom-0 right-1/4 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-[120px] translate-y-1/2" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* MOBILE FOOTER - Compact version */}
        <div className="lg:hidden py-6">
          {/* Brand + Social in one row */}
          <div className="flex items-center justify-between mb-4">
            <Link href="/" className="flex items-center gap-2">
              {settings.logo ? (
                <div className="relative w-8 h-8 rounded-lg overflow-hidden ring-1 ring-white/10">
                  <Image
                    src={settings.logo}
                    alt={settings.businessName || 'Logo'}
                    fill
                    className="object-contain"
                  />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              )}
              <span className="text-lg font-bold text-white">
                {settings.businessName || 'Catálogo'}
              </span>
            </Link>

            {/* Social Links - Compact */}
            <div className="flex items-center gap-1.5">
              {settings.facebook && (
                <a
                  href={settings.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-slate-800/50 flex items-center justify-center text-slate-400"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {settings.instagram && (
                <a
                  href={settings.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-slate-800/50 flex items-center justify-center text-slate-400"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {settings.whatsapp && (
                <a
                  href={`https://wa.me/${settings.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-green-600 flex items-center justify-center text-white"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Contact info - Horizontal on mobile */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mb-4">
            {settings.whatsapp && (
              <a
                href={`https://wa.me/${settings.whatsapp.replace(/\D/g, '')}`}
                className="flex items-center gap-1.5"
              >
                <Phone className="w-3 h-3 text-green-500" />
                <span>{settings.whatsapp}</span>
              </a>
            )}
            {settings.email && (
              <a href={`mailto:${settings.email}`} className="flex items-center gap-1.5">
                <Mail className="w-3 h-3 text-violet-500" />
                <span className="truncate max-w-[140px]">{settings.email}</span>
              </a>
            )}
          </div>

          {/* Copyright - Mobile */}
          <div className="pt-4 border-t border-slate-800/50 flex items-center justify-between">
            <p className="text-slate-500 text-xs">
              © {currentYear} {settings.businessName || 'Catálogo'}
            </p>
            <div className="flex items-center gap-1 text-slate-500 text-[10px]">
              <span>Hecho con</span>
              <span className="text-rose-500">❤️</span>
              <span>en Perú</span>
            </div>
          </div>
        </div>

        {/* DESKTOP FOOTER - Full version */}
        <div className="hidden lg:block py-12 lg:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
            {/* Brand Column */}
            <div className="lg:col-span-1">
              <Link href="/" className="flex items-center gap-3 mb-4">
                {settings.logo ? (
                  <div className="relative w-10 h-10 rounded-xl overflow-hidden ring-2 ring-white/10">
                    <Image
                      src={settings.logo}
                      alt={settings.businessName || 'Logo'}
                      fill
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                )}
                <span className="text-xl font-bold text-white">
                  {settings.businessName || 'Catálogo'}
                </span>
              </Link>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Tu tienda de confianza con los mejores productos y precios del mercado.
              </p>

              {/* Social Links */}
              <div className="flex items-center gap-2">
                {settings.facebook && (
                  <motion.a
                    href={settings.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-xl bg-slate-800/50 hover:bg-blue-600 flex items-center justify-center text-slate-400 hover:text-white transition-all"
                    whileHover={{ scale: 1.1 }}
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
                    className="w-10 h-10 rounded-xl bg-slate-800/50 hover:bg-gradient-to-br hover:from-purple-600 hover:to-pink-500 flex items-center justify-center text-slate-400 hover:text-white transition-all"
                    whileHover={{ scale: 1.1 }}
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
                    className="w-10 h-10 rounded-xl bg-slate-800/50 hover:bg-green-600 flex items-center justify-center text-slate-400 hover:text-white transition-all"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <MessageCircle className="w-5 h-5" />
                  </motion.a>
                )}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-white font-semibold mb-4">Navegación</h3>
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
                      className="text-slate-400 hover:text-white text-sm transition-colors inline-flex items-center gap-2 group"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-violet-500/50 group-hover:bg-violet-500 transition-colors" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Categories */}
            <div>
              <h3 className="text-white font-semibold mb-4">Categorías</h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/categorias"
                    className="text-slate-400 hover:text-white text-sm transition-colors inline-flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-500/50 group-hover:bg-fuchsia-500 transition-colors" />
                    Ver todas
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-white font-semibold mb-4">Contacto</h3>
              <ul className="space-y-3">
                {settings.whatsapp && (
                  <li>
                    <a
                      href={`https://wa.me/${settings.whatsapp.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-white text-sm transition-colors inline-flex items-center gap-3"
                    >
                      <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                        <Phone className="w-4 h-4 text-green-500" />
                      </div>
                      {settings.whatsapp}
                    </a>
                  </li>
                )}
                {settings.email && (
                  <li>
                    <a
                      href={`mailto:${settings.email}`}
                      className="text-slate-400 hover:text-white text-sm transition-colors inline-flex items-center gap-3"
                    >
                      <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                        <Mail className="w-4 h-4 text-violet-500" />
                      </div>
                      {settings.email}
                    </a>
                  </li>
                )}
                {settings.address && (
                  <li className="text-slate-400 text-sm inline-flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-fuchsia-500/10 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-4 h-4 text-fuchsia-500" />
                    </div>
                    <span>{settings.address}</span>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar - Desktop only */}
        <div className="hidden lg:block py-6 border-t border-slate-800/50">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-slate-500 text-sm">
              © {currentYear} {settings.businessName || 'Catálogo'}. Todos los derechos reservados.
            </p>
            <div className="flex items-center gap-1 text-slate-500 text-xs">
              <span>Hecho con</span>
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="text-rose-500"
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
