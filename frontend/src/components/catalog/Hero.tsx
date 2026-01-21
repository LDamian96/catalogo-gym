'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Phone, MapPin, Clock, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { useRef } from 'react';
import { cn } from '@/lib/utils';
import { v0Ease, gradientOrbAnimation } from '@/lib/animations';
import type { CatalogSettings } from '@/lib/api/catalog';

interface HeroProps {
  settings: CatalogSettings;
}

export function Hero({ settings }: HeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);

  const hasContactInfo = settings.phone || settings.address || settings.businessHours;

  return (
    <section
      ref={containerRef}
      className="relative min-h-[100vh] flex items-center justify-center overflow-hidden bg-[#0a0a0f] pt-20 md:pt-24"
    >
      {/* V0 Soft Background */}
      <div className="absolute inset-0">
        {/* Radial gradient from top - Soft Violet */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(139,92,246,0.15),transparent)]" />

        {/* Subtle mesh gradient - Multi-color */}
        <div className="absolute inset-0 bg-[radial-gradient(at_27%_37%,hsla(263,70%,50%,0.1)_0px,transparent_50%),radial-gradient(at_97%_21%,hsla(330,70%,50%,0.08)_0px,transparent_50%),radial-gradient(at_52%_99%,hsla(289,70%,50%,0.06)_0px,transparent_50%)]" />

        {/* Animated Gradient Orbs - Soft Violet/Pink */}
        <motion.div
          className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-violet-500/10 rounded-full blur-[120px]"
          animate={gradientOrbAnimation}
        />
        <motion.div
          className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-pink-500/8 rounded-full blur-[100px]"
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [0.15, 0.3, 0.15],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />
        <motion.div
          className="absolute top-1/2 right-1/3 w-[300px] h-[300px] bg-purple-500/6 rounded-full blur-[80px]"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.25, 0.1],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
        />

        {/* V0 Dot Pattern - Soft Violet */}
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: 'radial-gradient(rgba(167, 139, 250, 0.1) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Floating Particles - Soft colors */}
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className={cn(
              "absolute w-1.5 h-1.5 rounded-full",
              i % 3 === 0 ? "bg-violet-400/40" : i % 3 === 1 ? "bg-pink-400/40" : "bg-purple-400/40"
            )}
            style={{
              left: `${10 + Math.random() * 80}%`,
              top: `${20 + Math.random() * 60}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.7, 0.2],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 5 + Math.random() * 4,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: Math.random() * 3,
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <motion.div
        className="relative z-10 max-w-4xl mx-auto px-6 text-center py-8 md:py-0"
        style={{ y, opacity, scale }}
      >
        {/* Decorative Badge */}
        <motion.div
          className="flex justify-center mb-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: v0Ease }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-500/10 border border-violet-500/20 rounded-full">
            <Sparkles className="w-4 h-4 text-violet-400" />
            <span className="text-sm font-medium text-violet-300">Catálogo Digital</span>
          </div>
        </motion.div>

        {/* Logo */}
        {settings.logo && (
          <motion.div
            className="flex justify-center mb-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: v0Ease }}
          >
            <div className="relative w-20 h-20 md:w-24 md:h-24 p-3 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 shadow-[0_0_30px_rgba(139,92,246,0.15)]">
              <Image
                src={settings.logo}
                alt={settings.businessName || 'Logo'}
                fill
                className="object-contain p-2"
              />
            </div>
          </motion.div>
        )}

        {/* Business Name */}
        <motion.h1
          className="text-4xl md:text-6xl lg:text-7xl font-semibold tracking-tight mb-6"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: v0Ease }}
        >
          <span className="bg-gradient-to-r from-white via-violet-100 to-pink-100 bg-clip-text text-transparent">
            {settings.businessName || 'Bienvenido'}
          </span>
        </motion.h1>

        {/* Description */}
        {settings.description && (
          <motion.p
            className="text-base md:text-lg text-white/50 max-w-xl mx-auto mb-8 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: v0Ease }}
          >
            {settings.description}
          </motion.p>
        )}

        {/* Contact Info Pills - V0 Soft Style */}
        {hasContactInfo && (
          <motion.div
            className="flex flex-wrap justify-center gap-3 mb-10"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5, ease: v0Ease }}
          >
            {settings.phone && (
              <a
                href={`tel:${settings.phone}`}
                className="group inline-flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-violet-500/10 border border-white/10 hover:border-violet-500/30 rounded-full text-white/70 hover:text-white transition-all duration-500 text-sm"
              >
                <Phone className="w-4 h-4 text-violet-400" />
                {settings.phone}
              </a>
            )}
            {settings.address && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-white/70 text-sm">
                <MapPin className="w-4 h-4 text-pink-400" />
                <span className="max-w-[200px] truncate">{settings.address}</span>
              </div>
            )}
            {settings.businessHours && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-white/70 text-sm">
                <Clock className="w-4 h-4 text-purple-400" />
                {settings.businessHours}
              </div>
            )}
          </motion.div>
        )}

        {/* CTA Button - V0 Soft Style with Gradient */}
        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7, ease: v0Ease }}
        >
          <motion.a
            href="#productos"
            className={cn(
              'group relative inline-flex items-center gap-3 px-8 py-4',
              'bg-gradient-to-r from-violet-500 to-pink-500',
              'rounded-full font-medium text-white',
              'transition-all duration-500',
              'hover:shadow-[0_0_40px_rgba(139,92,246,0.4)]',
              'overflow-hidden'
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Shine Effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent"
              initial={{ x: '-100%' }}
              whileHover={{ x: '100%' }}
              transition={{ duration: 0.6 }}
            />
            <span className="relative">Ver Catálogo</span>
            <ArrowRight className="w-5 h-5 relative group-hover:translate-x-1 transition-transform duration-300" />
          </motion.a>
        </motion.div>

        {/* Secondary CTA */}
        <motion.div
          className="flex justify-center mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.9, ease: v0Ease }}
        >
          <a
            href="/categorias"
            className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-violet-400 transition-colors duration-300"
          >
            <span>Explorar categorías</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </motion.div>
      </motion.div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#0a0a0f] to-transparent" />

      {/* V0 Style Scroll Indicator */}
      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 hidden md:block"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6, ease: v0Ease }}
      >
        <motion.div
          className="flex flex-col items-center gap-2"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="w-5 h-8 rounded-full border border-white/20 flex items-start justify-center p-1.5">
            <motion.div
              className="w-1 h-1.5 rounded-full bg-gradient-to-b from-violet-400 to-pink-400"
              animate={{ y: [0, 10, 0], opacity: [1, 0.3, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
