'use client';

import { motion, Variants } from 'framer-motion';
import { ReactNode } from 'react';

interface MotionWrapperProps {
  children: ReactNode;
  variants?: Variants;
  className?: string;
  delay?: number;
}

export function MotionDiv({ children, variants, className, delay = 0 }: MotionWrapperProps) {
  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function MotionSection({ children, variants, className, delay = 0 }: MotionWrapperProps) {
  return (
    <motion.section
      variants={variants}
      initial="initial"
      whileInView="animate"
      viewport={{ once: true, margin: '-50px' }}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

export { motion } from 'framer-motion';
