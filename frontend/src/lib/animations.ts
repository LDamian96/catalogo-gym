import { Variants, Transition } from 'framer-motion';

// ============================================
// VERCEL V0 SOFT STYLE - ANIMATION SYSTEM
// Paleta: Violet/Purple/Pink | Transiciones suaves y elegantes
// ============================================

// V0 Easing Functions
export const v0Ease = [0.32, 0.72, 0, 1] as const;
export const v0EaseSpring = [0.34, 1.56, 0.64, 1] as const;
export const v0EaseSmooth = [0.4, 0, 0.2, 1] as const;

// V0 Base Transitions
export const v0Transition: Transition = {
  duration: 0.6,
  ease: v0Ease,
};

export const v0TransitionFast: Transition = {
  duration: 0.4,
  ease: v0Ease,
};

export const v0TransitionSlow: Transition = {
  duration: 0.8,
  ease: v0Ease,
};

export const v0Spring: Transition = {
  type: 'spring',
  stiffness: 400,
  damping: 30,
};

export const v0SpringSoft: Transition = {
  type: 'spring',
  stiffness: 200,
  damping: 25,
};

// ============================================
// V0 FADE ANIMATIONS
// ============================================

export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.6, ease: v0Ease } },
  exit: { opacity: 0, transition: { duration: 0.4, ease: v0Ease } },
};

export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: v0Ease } },
  exit: { opacity: 0, y: -16, transition: { duration: 0.4, ease: v0Ease } },
};

export const fadeInDown: Variants = {
  initial: { opacity: 0, y: -24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: v0Ease } },
  exit: { opacity: 0, y: 16, transition: { duration: 0.4, ease: v0Ease } },
};

export const fadeInLeft: Variants = {
  initial: { opacity: 0, x: -32 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.6, ease: v0Ease } },
  exit: { opacity: 0, x: 32, transition: { duration: 0.4, ease: v0Ease } },
};

export const fadeInRight: Variants = {
  initial: { opacity: 0, x: 32 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.6, ease: v0Ease } },
  exit: { opacity: 0, x: -32, transition: { duration: 0.4, ease: v0Ease } },
};

// ============================================
// V0 SCALE ANIMATIONS
// ============================================

export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: v0Ease } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.4, ease: v0Ease } },
};

export const scaleUp: Variants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: v0EaseSpring } },
  exit: { opacity: 0, scale: 0.8, transition: { duration: 0.4, ease: v0Ease } },
};

export const scaleInBounce: Variants = {
  initial: { opacity: 0, scale: 0.5 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 20,
    }
  },
  exit: { opacity: 0, scale: 0.5, transition: { duration: 0.3 } },
};

// ============================================
// V0 STAGGER ANIMATIONS
// ============================================

export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

export const staggerContainerFast: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.05,
    },
  },
};

export const staggerContainerSlow: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.15,
    },
  },
};

export const staggerItem: Variants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: v0Ease } },
};

export const staggerItemScale: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: v0Ease } },
};

// ============================================
// V0 CARD HOVER ANIMATIONS
// ============================================

export const cardHover = {
  rest: {
    scale: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.06)',
    transition: { duration: 0.5, ease: v0Ease },
  },
  hover: {
    scale: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    boxShadow: '0 0 0 1px rgba(139, 92, 246, 0.3), 0 8px 40px rgba(139, 92, 246, 0.12)',
    transition: { duration: 0.5, ease: v0Ease },
  },
};

export const cardHoverPink = {
  rest: {
    scale: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.06)',
    transition: { duration: 0.5, ease: v0Ease },
  },
  hover: {
    scale: 1,
    borderColor: 'rgba(236, 72, 153, 0.3)',
    boxShadow: '0 0 0 1px rgba(236, 72, 153, 0.3), 0 8px 40px rgba(236, 72, 153, 0.12)',
    transition: { duration: 0.5, ease: v0Ease },
  },
};

export const cardHoverLift = {
  rest: {
    y: 0,
    boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.06)',
    transition: { duration: 0.5, ease: v0Ease },
  },
  hover: {
    y: -6,
    boxShadow: '0 0 0 1px rgba(139, 92, 246, 0.3), 0 20px 50px rgba(139, 92, 246, 0.15)',
    transition: { duration: 0.5, ease: v0Ease },
  },
};

export const cardImageHover = {
  rest: { scale: 1, transition: { duration: 0.6, ease: v0Ease } },
  hover: { scale: 1.05, transition: { duration: 0.6, ease: v0Ease } },
};

// ============================================
// V0 BUTTON ANIMATIONS
// ============================================

export const buttonTap = {
  scale: 0.98,
  transition: { duration: 0.1, ease: v0EaseSmooth },
};

export const buttonHover = {
  scale: 1.01,
  transition: { duration: 0.3, ease: v0Ease },
};

export const buttonGlow = {
  rest: {
    boxShadow: '0 0 0 0 rgba(139, 92, 246, 0)',
    transition: { duration: 0.5, ease: v0Ease },
  },
  hover: {
    boxShadow: '0 0 25px rgba(139, 92, 246, 0.35)',
    transition: { duration: 0.5, ease: v0Ease },
  },
};

export const buttonGlowPink = {
  rest: {
    boxShadow: '0 0 0 0 rgba(236, 72, 153, 0)',
    transition: { duration: 0.5, ease: v0Ease },
  },
  hover: {
    boxShadow: '0 0 25px rgba(236, 72, 153, 0.35)',
    transition: { duration: 0.5, ease: v0Ease },
  },
};

// ============================================
// V0 SLIDE ANIMATIONS (for carousels)
// ============================================

export const slideVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    transition: { duration: 0.6, ease: v0Ease },
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 300 : -300,
    opacity: 0,
    transition: { duration: 0.6, ease: v0Ease },
  }),
};

export const slideUpVariants: Variants = {
  enter: {
    y: 40,
    opacity: 0,
  },
  center: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.6, ease: v0Ease },
  },
  exit: {
    y: -40,
    opacity: 0,
    transition: { duration: 0.4, ease: v0Ease },
  },
};

// ============================================
// V0 SCROLL REVEAL VARIANTS
// ============================================

export const scrollReveal: Variants = {
  initial: { opacity: 0, y: 40 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: v0Ease },
  },
};

export const scrollRevealLeft: Variants = {
  initial: { opacity: 0, x: -60 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.8, ease: v0Ease },
  },
};

export const scrollRevealRight: Variants = {
  initial: { opacity: 0, x: 60 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.8, ease: v0Ease },
  },
};

export const scrollRevealScale: Variants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.8, ease: v0Ease },
  },
};

// ============================================
// V0 HERO ANIMATIONS
// ============================================

export const heroTitle: Variants = {
  initial: { opacity: 0, y: 32 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, delay: 0.1, ease: v0Ease },
  },
};

export const heroSubtitle: Variants = {
  initial: { opacity: 0, y: 24 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, delay: 0.3, ease: v0Ease },
  },
};

export const heroCTA: Variants = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: 0.5, ease: v0Ease },
  },
};

export const heroImage: Variants = {
  initial: { opacity: 0, scale: 0.95, y: 20 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 1, delay: 0.2, ease: v0Ease },
  },
};

// ============================================
// V0 FLOATING ANIMATION
// ============================================

export const floatingAnimation = {
  y: [-8, 8, -8],
  transition: {
    duration: 5,
    repeat: Infinity,
    ease: 'easeInOut',
  },
};

export const floatingAnimationSlow = {
  y: [-12, 12, -12],
  transition: {
    duration: 8,
    repeat: Infinity,
    ease: 'easeInOut',
  },
};

// ============================================
// V0 PULSE ANIMATION
// ============================================

export const pulseAnimation = {
  scale: [1, 1.03, 1],
  opacity: [1, 0.85, 1],
  transition: {
    duration: 2.5,
    repeat: Infinity,
    ease: 'easeInOut',
  },
};

export const pulseSoft = {
  opacity: [1, 0.7, 1],
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: 'easeInOut',
  },
};

// ============================================
// V0 SOFT GLOW EFFECTS - VIOLET/PURPLE/PINK
// ============================================

export const glowAnimation = {
  boxShadow: [
    '0 0 20px rgba(139, 92, 246, 0.2)',
    '0 0 40px rgba(139, 92, 246, 0.35)',
    '0 0 20px rgba(139, 92, 246, 0.2)',
  ],
  transition: {
    duration: 3,
    repeat: Infinity,
    ease: 'easeInOut',
  },
};

export const glowAnimationPink = {
  boxShadow: [
    '0 0 20px rgba(236, 72, 153, 0.2)',
    '0 0 40px rgba(236, 72, 153, 0.35)',
    '0 0 20px rgba(236, 72, 153, 0.2)',
  ],
  transition: {
    duration: 3,
    repeat: Infinity,
    ease: 'easeInOut',
  },
};

export const glowAnimationIntense = {
  boxShadow: [
    '0 0 30px rgba(139, 92, 246, 0.25)',
    '0 0 60px rgba(139, 92, 246, 0.45)',
    '0 0 30px rgba(139, 92, 246, 0.25)',
  ],
  transition: {
    duration: 2.5,
    repeat: Infinity,
    ease: 'easeInOut',
  },
};

export const borderGlowAnimation = {
  borderColor: [
    'rgba(139, 92, 246, 0.2)',
    'rgba(139, 92, 246, 0.5)',
    'rgba(139, 92, 246, 0.2)',
  ],
  transition: {
    duration: 2.5,
    repeat: Infinity,
    ease: 'easeInOut',
  },
};

export const borderGlowAnimationPink = {
  borderColor: [
    'rgba(236, 72, 153, 0.2)',
    'rgba(236, 72, 153, 0.5)',
    'rgba(236, 72, 153, 0.2)',
  ],
  transition: {
    duration: 2.5,
    repeat: Infinity,
    ease: 'easeInOut',
  },
};

// ============================================
// V0 GRADIENT ORB ANIMATIONS
// ============================================

export const gradientOrbAnimation = {
  scale: [1, 1.15, 1],
  opacity: [0.3, 0.5, 0.3],
  transition: {
    duration: 10,
    repeat: Infinity,
    ease: 'easeInOut',
  },
};

export const gradientOrbMove = {
  x: [0, 30, 0],
  y: [0, -20, 0],
  scale: [1, 1.1, 1],
  transition: {
    duration: 12,
    repeat: Infinity,
    ease: 'easeInOut',
  },
};

// ============================================
// V0 PAGE TRANSITIONS
// ============================================

export const pageTransition: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: v0Ease }
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.3, ease: v0Ease }
  },
};

export const pageTransitionSlide: Variants = {
  initial: { opacity: 0, x: 20 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: v0Ease }
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: { duration: 0.3, ease: v0Ease }
  },
};

// ============================================
// V0 MENU/DROPDOWN ANIMATIONS
// ============================================

export const dropdownVariants: Variants = {
  initial: { opacity: 0, y: -8, scale: 0.96 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.2, ease: v0Ease }
  },
  exit: {
    opacity: 0,
    y: -8,
    scale: 0.96,
    transition: { duration: 0.15, ease: v0Ease }
  },
};

export const menuItemVariants: Variants = {
  initial: { opacity: 0, x: -8 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.2, ease: v0Ease }
  },
};

// ============================================
// V0 MODAL ANIMATIONS
// ============================================

export const modalBackdrop: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

export const modalContent: Variants = {
  initial: { opacity: 0, scale: 0.95, y: 10 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.3, ease: v0Ease }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: { duration: 0.2, ease: v0Ease }
  },
};

// ============================================
// V0 SIDEBAR ANIMATIONS
// ============================================

export const sidebarVariants = {
  expanded: {
    width: 256,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
  },
  collapsed: {
    width: 80,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
  },
};

export const sidebarContentVariants: Variants = {
  expanded: {
    opacity: 1,
    x: 0,
    transition: {
      delay: 0.1,
      duration: 0.2,
      ease: v0Ease,
    },
  },
  collapsed: {
    opacity: 0,
    x: -10,
    transition: {
      duration: 0.1,
      ease: v0Ease,
    },
  },
};

// ============================================
// V0 PARTICLE/DOT ANIMATIONS
// ============================================

export const particleAnimation = (delay: number = 0) => ({
  y: [0, -20, 0],
  opacity: [0.3, 0.7, 0.3],
  transition: {
    duration: 4 + Math.random() * 2,
    repeat: Infinity,
    ease: 'easeInOut',
    delay: delay + Math.random() * 2,
  },
});

// ============================================
// V0 TEXT REVEAL ANIMATIONS
// ============================================

export const textRevealVariants: Variants = {
  initial: { opacity: 0, y: 20, rotateX: -40 },
  animate: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: { duration: 0.6, ease: v0Ease }
  },
};

export const letterAnimation = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
};

// ============================================
// V0 SHIMMER EFFECT
// ============================================

export const shimmerAnimation = {
  x: ['-100%', '100%'],
  transition: {
    duration: 1.5,
    repeat: Infinity,
    ease: 'linear',
  },
};

// ============================================
// V0 NOTIFICATION/TOAST ANIMATIONS
// ============================================

export const toastVariants: Variants = {
  initial: { opacity: 0, y: 50, scale: 0.95 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 25,
    }
  },
  exit: {
    opacity: 0,
    y: 20,
    scale: 0.95,
    transition: { duration: 0.2, ease: v0Ease }
  },
};

// ============================================
// V0 COUNTER ANIMATION (for stats)
// ============================================

export const counterSpring = {
  type: 'spring',
  stiffness: 50,
  damping: 10,
};

// ============================================
// V0 LOADING ANIMATIONS
// ============================================

export const spinnerAnimation = {
  rotate: 360,
  transition: {
    duration: 1,
    repeat: Infinity,
    ease: 'linear',
  },
};

export const dotsLoadingAnimation = {
  scale: [1, 1.2, 1],
  opacity: [0.5, 1, 0.5],
  transition: {
    duration: 0.8,
    repeat: Infinity,
    ease: 'easeInOut',
  },
};

// ============================================
// V0 SCROLL INDICATOR
// ============================================

export const scrollIndicatorAnimation = {
  y: [0, 8, 0],
  opacity: [1, 0.5, 1],
  transition: {
    duration: 1.5,
    repeat: Infinity,
    ease: 'easeInOut',
  },
};

export const scrollDotAnimation = {
  y: [0, 12, 0],
  opacity: [1, 0.3, 1],
  transition: {
    duration: 1.5,
    repeat: Infinity,
    ease: 'easeInOut',
  },
};
