'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import type { CatalogSettings, CatalogCategory } from '@/lib/api/catalog';

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.44a8.16 8.16 0 0 0 4.76 1.52v-3.4a4.85 4.85 0 0 1-1-.13z" />
    </svg>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

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
        <div className="lg:hidden py-4 pb-[88px]">
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
                <a href={settings.facebook} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-[#1877F2]/15 flex items-center justify-center text-[#1877F2]">
                  <FacebookIcon className="w-4 h-4" />
                </a>
              )}
              {settings.instagram && (
                <a href={settings.instagram} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-[#E4405F]/15 flex items-center justify-center text-[#E4405F]">
                  <InstagramIcon className="w-4 h-4" />
                </a>
              )}
              {settings.tiktok && (
                <a href={settings.tiktok} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white">
                  <TikTokIcon className="w-4 h-4" />
                </a>
              )}
              {settings.whatsapp && (
                <a href={`https://wa.me/${settings.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-[#25D366]/15 flex items-center justify-center text-[#25D366]">
                  <WhatsAppIcon className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Copyright - Mobile */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-between">
            <p className="text-white/40 text-[10px]">
              © {currentYear} {settings.businessName || 'Catálogo'}
            </p>
            <p className="text-white/40 text-[10px]">
              Todos los derechos reservados
            </p>
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

          <div className="flex items-center gap-2.5">
            {settings.facebook && (
              <a href={settings.facebook} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-[#1877F2]/15 hover:bg-[#1877F2]/30 flex items-center justify-center text-[#1877F2] transition-all hover:scale-110">
                <FacebookIcon className="w-4 h-4" />
              </a>
            )}
            {settings.instagram && (
              <a href={settings.instagram} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-[#E4405F]/15 hover:bg-[#E4405F]/30 flex items-center justify-center text-[#E4405F] transition-all hover:scale-110">
                <InstagramIcon className="w-4 h-4" />
              </a>
            )}
            {settings.tiktok && (
              <a href={settings.tiktok} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all hover:scale-110">
                <TikTokIcon className="w-4 h-4" />
              </a>
            )}
            {settings.whatsapp && (
              <a href={`https://wa.me/${settings.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-[#25D366]/15 hover:bg-[#25D366]/30 flex items-center justify-center text-[#25D366] transition-all hover:scale-110">
                <WhatsAppIcon className="w-4 h-4" />
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
            <p className="text-white/40 text-xs">
              Catálogo digital potenciado por tecnología
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
