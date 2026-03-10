'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Facebook, Instagram, MessageCircle, Heart } from 'lucide-react';
import type { CatalogSettings, CatalogCategory } from '@/lib/api/catalog';

interface FooterProps {
  settings: CatalogSettings;
  categories?: CatalogCategory[];
}

export function Footer({ settings }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-neutral-900 via-neutral-950 to-black dark:from-neutral-950 dark:via-black dark:to-black" />

      {/* Decorative gradient orbs - subtle in dark mode */}
      <motion.div
        className="absolute -top-40 -left-40 w-80 h-80 bg-cyan-500/10 dark:bg-white/5 rounded-full blur-3xl"
        animate={{ scale: [1, 1.2, 1], x: [0, 30, 0] }}
        transition={{ duration: 10, repeat: Infinity }}
      />
      <motion.div
        className="absolute -bottom-40 -right-40 w-80 h-80 bg-blue-500/10 dark:bg-white/5 rounded-full blur-3xl"
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
        {/* MOBILE FOOTER - Compact */}
        <div className="lg:hidden py-4 pb-24">
          {/* Logo and Social */}
          <div className="flex items-center justify-between mb-4">
            <Link href="/" className="flex items-center gap-2">
              {settings.logo ? (
                <div className="relative w-9 h-9 rounded-lg overflow-hidden">
                  <Image
                    src={settings.logo}
                    alt={settings.businessName || 'Logo'}
                    fill
                    className="object-contain"
                  />
                </div>
              ) : (
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 dark:bg-white/10 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {(settings.businessName || 'C')[0]}
                  </span>
                </div>
              )}
              <span className="text-sm font-bold text-white">
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
                  className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white/70"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {settings.instagram && (
                <a
                  href={settings.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white/70"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {settings.whatsapp && (
                <a
                  href={`https://wa.me/${settings.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Copyright - Mobile */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-between">
            <p className="text-white/40 text-[10px]">
              © {currentYear} {settings.businessName || 'Catálogo'}
            </p>
            <div className="flex items-center gap-1 text-white/40 text-[10px]">
              <span>Hecho con</span>
              <Heart className="w-2.5 h-2.5 text-rose-500 fill-rose-500" />
              <span>en Perú</span>
            </div>
          </div>
        </div>

        {/* DESKTOP FOOTER - Single row */}
        <div className="hidden lg:flex items-center justify-between py-5">
          <Link href="/" className="flex items-center gap-2">
            {settings.logo ? (
              <div className="relative w-8 h-8 rounded-lg overflow-hidden">
                <Image src={settings.logo} alt={settings.businessName || 'Logo'} fill className="object-contain" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">{(settings.businessName || 'C')[0]}</span>
              </div>
            )}
            <span className="text-sm font-bold text-white">{settings.businessName || 'Catálogo'}</span>
          </Link>

          <nav className="flex items-center gap-6">
            {[
              { href: '/', label: 'Inicio' },
              { href: '/categorias', label: 'Categorías' },
              { href: '/productos', label: 'Productos' },
              { href: '/combos', label: 'Combos' },
            ].map((link) => (
              <Link key={link.href} href={link.href} className="text-white/50 hover:text-white text-sm transition-colors">
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {settings.facebook && (
              <a href={settings.facebook} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-colors">
                <Facebook className="w-3.5 h-3.5" />
              </a>
            )}
            {settings.instagram && (
              <a href={settings.instagram} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-colors">
                <Instagram className="w-3.5 h-3.5" />
              </a>
            )}
            {settings.whatsapp && (
              <a href={`https://wa.me/${settings.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 flex items-center justify-center text-emerald-400 transition-colors">
                <MessageCircle className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>

        {/* Bottom Bar - Desktop */}
        <div className="hidden lg:block py-3 border-t border-white/10">
          <div className="flex items-center justify-between">
            <p className="text-white/40 text-xs">
              © {currentYear} {settings.businessName || 'Catálogo'}. Todos los derechos reservados.
            </p>
            <div className="flex items-center gap-1.5 text-white/40 text-xs">
              <span>Hecho con</span>
              <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
              <span>en Perú</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
