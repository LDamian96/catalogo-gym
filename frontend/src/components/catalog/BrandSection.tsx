'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface Brand {
  id: string;
  name: string;
  logo: string | null;
}

interface BrandSectionProps {
  brands: Brand[];
}

export function BrandSection({ brands }: BrandSectionProps) {
  if (!brands.length) return null;

  // Duplicate brands for infinite scroll effect
  const duplicatedBrands = [...brands, ...brands];

  return (
    <section className="py-20 bg-neutral-50 dark:bg-neutral-900/50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 mb-12">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white mb-4">
            Marcas que <span className="text-red-600">Confían</span> en Nosotros
          </h2>
          <p className="text-neutral-500 dark:text-neutral-400 max-w-xl mx-auto">
            Trabajamos con las mejores marcas para ofrecerte productos de calidad
          </p>
        </motion.div>
      </div>

      {/* Infinite Scroll Container */}
      <div className="relative">
        {/* Gradient Masks */}
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-neutral-50 dark:from-neutral-900 to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-neutral-50 dark:from-neutral-900 to-transparent z-10" />

        {/* Scrolling Brands */}
        <motion.div
          className="flex gap-12 items-center"
          animate={{
            x: ['0%', '-50%'],
          }}
          transition={{
            x: {
              duration: 20,
              repeat: Infinity,
              ease: 'linear',
            },
          }}
        >
          {duplicatedBrands.map((brand, index) => (
            <motion.div
              key={`${brand.id}-${index}`}
              className={cn(
                'flex-shrink-0 w-32 h-16 md:w-40 md:h-20',
                'flex items-center justify-center',
                'grayscale hover:grayscale-0 opacity-60 hover:opacity-100',
                'transition-all duration-300'
              )}
              whileHover={{ scale: 1.1 }}
            >
              {brand.logo ? (
                <Image
                  src={brand.logo}
                  alt={brand.name}
                  width={120}
                  height={60}
                  className="object-contain max-h-full"
                />
              ) : (
                <div className="text-neutral-400 dark:text-neutral-600 font-semibold text-lg">
                  {brand.name}
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
