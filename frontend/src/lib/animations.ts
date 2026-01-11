import { Variants } from 'framer-motion';

// ============================================
// FADE ANIMATIONS
// ============================================

export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.5 } },
  exit: { opacity: 0, transition: { duration: 0.3 } },
};

export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
};

export const fadeInDown: Variants = {
  initial: { opacity: 0, y: -30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: 20, transition: { duration: 0.3 } },
};

export const fadeInLeft: Variants = {
  initial: { opacity: 0, x: -50 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, x: 50, transition: { duration: 0.3 } },
};

export const fadeInRight: Variants = {
  initial: { opacity: 0, x: 50 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, x: -50, transition: { duration: 0.3 } },
};

// ============================================
// SCALE ANIMATIONS
// ============================================

export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.3 } },
};

export const scaleUp: Variants = {
  initial: { opacity: 0, scale: 0.5 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: [0.34, 1.56, 0.64, 1] } },
  exit: { opacity: 0, scale: 0.5, transition: { duration: 0.3 } },
};

// ============================================
// STAGGER ANIMATIONS
// ============================================

export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

export const staggerContainerFast: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05,
    },
  },
};

export const staggerContainerSlow: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

export const staggerItem: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

// ============================================
// CARD HOVER ANIMATIONS
// ============================================

export const cardHover = {
  rest: {
    scale: 1,
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    transition: { duration: 0.3, ease: 'easeOut' },
  },
  hover: {
    scale: 1.02,
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    transition: { duration: 0.3, ease: 'easeOut' },
  },
};

export const cardImageHover = {
  rest: { scale: 1, transition: { duration: 0.4, ease: 'easeOut' } },
  hover: { scale: 1.1, transition: { duration: 0.4, ease: 'easeOut' } },
};

// ============================================
// BUTTON ANIMATIONS
// ============================================

export const buttonTap = {
  scale: 0.97,
  transition: { duration: 0.1 },
};

export const buttonHover = {
  scale: 1.02,
  transition: { duration: 0.2 },
};

// ============================================
// SLIDE ANIMATIONS (for carousels)
// ============================================

export const slideVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 1000 : -1000,
    opacity: 0,
  }),
};

// ============================================
// SCROLL REVEAL VARIANTS
// ============================================

export const scrollReveal: Variants = {
  initial: { opacity: 0, y: 60 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  },
};

export const scrollRevealLeft: Variants = {
  initial: { opacity: 0, x: -80 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  },
};

export const scrollRevealRight: Variants = {
  initial: { opacity: 0, x: 80 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  },
};

// ============================================
// HERO ANIMATIONS
// ============================================

export const heroTitle: Variants = {
  initial: { opacity: 0, y: 40 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] },
  },
};

export const heroSubtitle: Variants = {
  initial: { opacity: 0, y: 30 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
};

export const heroCTA: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

// ============================================
// FLOATING ANIMATION
// ============================================

export const floatingAnimation = {
  y: [-10, 10, -10],
  transition: {
    duration: 4,
    repeat: Infinity,
    ease: 'easeInOut',
  },
};

// ============================================
// PULSE ANIMATION
// ============================================

export const pulseAnimation = {
  scale: [1, 1.05, 1],
  opacity: [1, 0.8, 1],
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: 'easeInOut',
  },
};

// ============================================
// GLOW EFFECT
// ============================================

export const glowAnimation = {
  boxShadow: [
    '0 0 20px rgba(139, 92, 246, 0.3)',
    '0 0 40px rgba(139, 92, 246, 0.5)',
    '0 0 20px rgba(139, 92, 246, 0.3)',
  ],
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: 'easeInOut',
  },
};
