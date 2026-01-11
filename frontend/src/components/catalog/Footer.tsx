'use client';

import { motion } from 'framer-motion';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Facebook,
  Instagram,
  MessageCircle,
  Heart,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { CatalogSettings, CatalogCategory } from '@/lib/api/catalog';

interface FooterProps {
  settings: CatalogSettings;
  categories?: CatalogCategory[];
}

const socialIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  facebook: Facebook,
  instagram: Instagram,
  whatsapp: MessageCircle,
};

export function Footer({ settings, categories = [] }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-slate-950 text-white overflow-hidden">
      {/* Decorative Top Border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600" />

      {/* Background Decorations */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-violet-600/5 rounded-full blur-[150px]" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-fuchsia-600/5 rounded-full blur-[150px]" />

      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Brand Column */}
          <motion.div
            className="lg:col-span-1"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            {/* Logo */}
            {settings.logo ? (
              <div className="relative w-16 h-16 mb-4">
                <Image
                  src={settings.logo}
                  alt={settings.businessName || 'Logo'}
                  fill
                  className="object-contain"
                />
              </div>
            ) : (
              <h3 className="text-2xl font-bold mb-4">
                {settings.businessName || 'Catálogo'}
              </h3>
            )}

            <p className="text-slate-400 text-sm mb-6 line-clamp-3">
              {settings.description || 'Tu tienda de confianza con los mejores productos y la mejor calidad.'}
            </p>

            {/* Social Links */}
            <div className="flex gap-3">
              {settings.facebook && (
                <SocialLink href={settings.facebook} icon="facebook" />
              )}
              {settings.instagram && (
                <SocialLink href={settings.instagram} icon="instagram" />
              )}
              {settings.whatsapp && (
                <SocialLink href={`https://wa.me/${settings.whatsapp.replace(/\D/g, '')}`} icon="whatsapp" />
              )}
            </div>
          </motion.div>

          {/* Categories Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h4 className="text-lg font-semibold mb-4">Categorías</h4>
            <ul className="space-y-2">
              {categories.slice(0, 6).map((category) => (
                <li key={category.id}>
                  <Link
                    href={`/categorias/${category.slug}`}
                    className="text-slate-400 hover:text-violet-400 transition-colors duration-200 text-sm flex items-center gap-1 group"
                  >
                    <span>{category.name}</span>
                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Quick Links Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h4 className="text-lg font-semibold mb-4">Enlaces Rápidos</h4>
            <ul className="space-y-2">
              {[
                { label: 'Inicio', href: '/' },
                { label: 'Buscar', href: '/buscar' },
                { label: 'Ofertas', href: '/buscar?filter=sale' },
                { label: 'Destacados', href: '/buscar?filter=featured' },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-slate-400 hover:text-violet-400 transition-colors duration-200 text-sm flex items-center gap-1 group"
                  >
                    <span>{link.label}</span>
                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h4 className="text-lg font-semibold mb-4">Contacto</h4>
            <ul className="space-y-3">
              {settings.address && (
                <li className="flex items-start gap-3 text-sm text-slate-400">
                  <MapPin className="w-4 h-4 mt-0.5 text-violet-400 flex-shrink-0" />
                  <span>{settings.address}</span>
                </li>
              )}
              {settings.phone && (
                <li className="flex items-center gap-3 text-sm text-slate-400">
                  <Phone className="w-4 h-4 text-violet-400 flex-shrink-0" />
                  <a
                    href={`tel:${settings.phone}`}
                    className="hover:text-violet-400 transition-colors"
                  >
                    {settings.phone}
                  </a>
                </li>
              )}
              {settings.email && (
                <li className="flex items-center gap-3 text-sm text-slate-400">
                  <Mail className="w-4 h-4 text-violet-400 flex-shrink-0" />
                  <a
                    href={`mailto:${settings.email}`}
                    className="hover:text-violet-400 transition-colors"
                  >
                    {settings.email}
                  </a>
                </li>
              )}
              {settings.businessHours && (
                <li className="flex items-start gap-3 text-sm text-slate-400">
                  <Clock className="w-4 h-4 mt-0.5 text-violet-400 flex-shrink-0" />
                  <span>{settings.businessHours}</span>
                </li>
              )}
            </ul>
          </motion.div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="relative border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-500 text-sm text-center md:text-left">
              © {currentYear} {settings.businessName || 'Catálogo'}. Todos los derechos reservados.
            </p>
            <p className="text-slate-500 text-sm flex items-center gap-1">
              Hecho con <Heart className="w-4 h-4 text-rose-500 inline-block" /> en Perú
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({
  href,
  icon
}: {
  href: string;
  icon: 'facebook' | 'instagram' | 'whatsapp';
}) {
  const Icon = socialIcons[icon];

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'w-10 h-10 rounded-full',
        'bg-white/5 hover:bg-violet-600',
        'flex items-center justify-center',
        'transition-colors duration-300'
      )}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      <Icon className="w-5 h-5" />
    </motion.a>
  );
}
