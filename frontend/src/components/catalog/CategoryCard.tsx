'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Layers } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { CatalogCategory } from '@/lib/api/catalog';

interface CategoryCardProps {
  category: CatalogCategory;
  index?: number;
  variant?: 'default' | 'large' | 'compact';
}

export function CategoryCard({ category, index = 0, variant = 'default' }: CategoryCardProps) {
  const productCount = category._count?.products || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link href={`/categorias/${category.slug}`}>
        <motion.div
          className={cn(
            'group relative overflow-hidden rounded-3xl cursor-pointer',
            variant === 'large' && 'aspect-[4/3]',
            variant === 'compact' && 'aspect-[3/2]',
            variant === 'default' && 'aspect-square'
          )}
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          {/* Background Image or Gradient */}
          {category.image ? (
            <motion.div
              className="absolute inset-0"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <Image
                src={category.image}
                alt={category.name}
                fill
                quality={90}
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            </motion.div>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 via-sky-600 to-blue-600" />
          )}

          {/* Overlay Gradient */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"
            initial={{ opacity: 0.7 }}
            whileHover={{ opacity: 0.9 }}
            transition={{ duration: 0.3 }}
          />

          {/* Animated Border Glow */}
          <motion.div
            className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.3), rgba(59, 130, 246, 0.3))',
              filter: 'blur(20px)',
            }}
          />

          {/* Content */}
          <div className="absolute inset-0 p-6 flex flex-col justify-end">
            {/* Product Count Badge */}
            <motion.div
              className="absolute top-4 right-4"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 backdrop-blur-md rounded-full">
                <Layers className="w-3.5 h-3.5 text-white/80" />
                <span className="text-xs font-medium text-white/90">
                  {productCount} {productCount === 1 ? 'producto' : 'productos'}
                </span>
              </div>
            </motion.div>

            {/* Category Name */}
            <motion.h3
              className="text-2xl md:text-3xl font-bold text-white mb-2"
              initial={{ y: 20 }}
              whileHover={{ y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {category.name}
            </motion.h3>

            {/* Description */}
            {category.description && (
              <motion.p
                className="text-white/70 text-sm line-clamp-2 mb-4 max-w-[80%]"
                initial={{ opacity: 0, y: 10 }}
                whileHover={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                {category.description}
              </motion.p>
            )}

            {/* CTA Button */}
            <motion.div
              className="flex items-center gap-2 text-white font-medium"
              initial={{ x: 0 }}
              whileHover={{ x: 5 }}
              transition={{ duration: 0.3 }}
            >
              <span className="text-sm">Explorar</span>
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <ArrowRight className="w-4 h-4" />
              </motion.div>
            </motion.div>
          </div>

          {/* Corner Decoration */}
          <motion.div
            className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-2xl"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          />
        </motion.div>
      </Link>
    </motion.div>
  );
}
