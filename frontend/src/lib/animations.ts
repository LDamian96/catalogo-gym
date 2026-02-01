import { Variants, Transition } from 'framer-motion';

// ============================================
// V0 DESIGN SYSTEM - ANIMATION LIBRARY
// Paleta: Cyan/Blue | Transiciones suaves y elegantes
// ============================================

// V0 Easing Functions
export const v0Ease = [0.32, 0.72, 0, 1] as const;
export const v0EaseSpring = [0.34, 1.56, 0.64, 1] as const;
export const v0EaseSmooth = [0.4, 0, 0.2, 1] as const;

// V0 Base Transitions
export const v0Transition: Transition = {
  duration: 0.5,
  ease: v0Ease,
};

export const v0TransitionFast: Transition = {
  duration: 0.3,
  ease: v0Ease,
};

export const v0TransitionSlow: Transition = {
  duration: 0.7,
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
  animate: { opacity: 1, transition: { duration: 0.5, ease: v0Ease } },
  exit: { opacity: 0, transition: { duration: 0.3, ease: v0Ease } },
};

export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: v0Ease } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.3, ease: v0Ease } },
};

export const fadeInDown: Variants = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: v0Ease } },
  exit: { opacity: 0, y: 12, transition: { duration: 0.3, ease: v0Ease } },
};

export const fadeInLeft: Variants = {
  initial: { opacity: 0, x: -24 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.5, ease: v0Ease } },
  exit: { opacity: 0, x: 24, transition: { duration: 0.3, ease: v0Ease } },
};

export const fadeInRight: Variants = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.5, ease: v0Ease } },
  exit: { opacity: 0, x: -24, transition: { duration: 0.3, ease: v0Ease } },
};

// ============================================
// V0 SCALE ANIMATIONS
// ============================================

export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: v0Ease } },
  exit: { opacity: 0, scale: 0.96, transition: { duration: 0.3, ease: v0Ease } },
};

export const scaleUp: Variants = {
  initial: { opacity: 0, scale: 0.85 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: v0EaseSpring } },
  exit: { opacity: 0, scale: 0.85, transition: { duration: 0.3, ease: v0Ease } },
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
  exit: { opacity: 0, scale: 0.5, transition: { duration: 0.25 } },
};

// ============================================
// V0 STAGGER ANIMATIONS
// ============================================

export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.08,
    },
  },
};

export const staggerContainerFast: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.03,
      delayChildren: 0.04,
    },
  },
};

export const staggerContainerSlow: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.12,
    },
  },
};

export const staggerItem: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: v0Ease } },
};

export const staggerItemScale: Variants = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: v0Ease } },
};

// ============================================
// V0 CARD HOVER ANIMATIONS - CYAN/BLUE
// ============================================

export const cardHover = {
  rest: {
    scale: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.08)',
    transition: { duration: 0.4, ease: v0Ease },
  },
  hover: {
    scale: 1,
    borderColor: 'rgba(34, 211, 238, 0.4)',
    boxShadow: '0 0 0 1px rgba(34, 211, 238, 0.4), 0 8px 40px rgba(34, 211, 238, 0.1)',
    transition: { duration: 0.4, ease: v0Ease },
  },
};

export const cardHoverBlue = {
  rest: {
    scale: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.08)',
    transition: { duration: 0.4, ease: v0Ease },
  },
  hover: {
    scale: 1,
    borderColor: 'rgba(59, 130, 246, 0.4)',
    boxShadow: '0 0 0 1px rgba(59, 130, 246, 0.4), 0 8px 40px rgba(59, 130, 246, 0.1)',
    transition: { duration: 0.4, ease: v0Ease },
  },
};

export const cardHoverLift = {
  rest: {
    y: 0,
    boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.08)',
    transition: { duration: 0.4, ease: v0Ease },
  },
  hover: {
    y: -4,
    boxShadow: '0 0 0 1px rgba(34, 211, 238, 0.4), 0 16px 40px rgba(34, 211, 238, 0.12)',
    transition: { duration: 0.4, ease: v0Ease },
  },
};

export const cardImageHover = {
  rest: { scale: 1, transition: { duration: 0.5, ease: v0Ease } },
  hover: { scale: 1.05, transition: { duration: 0.5, ease: v0Ease } },
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
  transition: { duration: 0.25, ease: v0Ease },
};

export const buttonGlow = {
  rest: {
    boxShadow: '0 0 0 0 rgba(34, 211, 238, 0)',
    transition: { duration: 0.4, ease: v0Ease },
  },
  hover: {
    boxShadow: '0 0 25px rgba(34, 211, 238, 0.3)',
    transition: { duration: 0.4, ease: v0Ease },
  },
};

export const buttonGlowBlue = {
  rest: {
    boxShadow: '0 0 0 0 rgba(59, 130, 246, 0)',
    transition: { duration: 0.4, ease: v0Ease },
  },
  hover: {
    boxShadow: '0 0 25px rgba(59, 130, 246, 0.3)',
    transition: { duration: 0.4, ease: v0Ease },
  },
};

// ============================================
// V0 SLIDE ANIMATIONS
// ============================================

export const slideVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 250 : -250,
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    transition: { duration: 0.5, ease: v0Ease },
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 250 : -250,
    opacity: 0,
    transition: { duration: 0.5, ease: v0Ease },
  }),
};

export const slideUpVariants: Variants = {
  enter: {
    y: 30,
    opacity: 0,
  },
  center: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5, ease: v0Ease },
  },
  exit: {
    y: -30,
    opacity: 0,
    transition: { duration: 0.35, ease: v0Ease },
  },
};

// ============================================
// V0 SCROLL REVEAL VARIANTS
// ============================================

export const scrollReveal: Variants = {
  initial: { opacity: 0, y: 32 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: v0Ease },
  },
};

export const scrollRevealLeft: Variants = {
  initial: { opacity: 0, x: -48 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: v0Ease },
  },
};

export const scrollRevealRight: Variants = {
  initial: { opacity: 0, x: 48 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: v0Ease },
  },
};

export const scrollRevealScale: Variants = {
  initial: { opacity: 0, scale: 0.92 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: v0Ease },
  },
};

// ============================================
// V0 HERO ANIMATIONS
// ============================================

export const heroTitle: Variants = {
  initial: { opacity: 0, y: 24 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: 0.1, ease: v0Ease },
  },
};

export const heroSubtitle: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: 0.25, ease: v0Ease },
  },
};

export const heroCTA: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: 0.4, ease: v0Ease },
  },
};

export const heroImage: Variants = {
  initial: { opacity: 0, scale: 0.96, y: 16 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.8, delay: 0.15, ease: v0Ease },
  },
};

// ============================================
// V0 FLOATING ANIMATION
// ============================================

export const floatingAnimation = {
  y: [-6, 6, -6],
  transition: {
    duration: 4,
    repeat: Infinity,
    ease: 'easeInOut',
  },
};

export const floatingAnimationSlow = {
  y: [-10, 10, -10],
  transition: {
    duration: 6,
    repeat: Infinity,
    ease: 'easeInOut',
  },
};

// ============================================
// V0 PULSE ANIMATION
// ============================================

export const pulseAnimation = {
  scale: [1, 1.02, 1],
  opacity: [1, 0.85, 1],
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: 'easeInOut',
  },
};

export const pulseSoft = {
  opacity: [1, 0.7, 1],
  transition: {
    duration: 1.8,
    repeat: Infinity,
    ease: 'easeInOut',
  },
};

// ============================================
// V0 GLOW EFFECTS - CYAN/BLUE
// ============================================

export const glowAnimation = {
  boxShadow: [
    '0 0 20px rgba(34, 211, 238, 0.15)',
    '0 0 35px rgba(34, 211, 238, 0.3)',
    '0 0 20px rgba(34, 211, 238, 0.15)',
  ],
  transition: {
    duration: 2.5,
    repeat: Infinity,
    ease: 'easeInOut',
  },
};

export const glowAnimationBlue = {
  boxShadow: [
    '0 0 20px rgba(59, 130, 246, 0.15)',
    '0 0 35px rgba(59, 130, 246, 0.3)',
    '0 0 20px rgba(59, 130, 246, 0.15)',
  ],
  transition: {
    duration: 2.5,
    repeat: Infinity,
    ease: 'easeInOut',
  },
};

export const glowAnimationIntense = {
  boxShadow: [
    '0 0 25px rgba(34, 211, 238, 0.2)',
    '0 0 50px rgba(34, 211, 238, 0.4)',
    '0 0 25px rgba(34, 211, 238, 0.2)',
  ],
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: 'easeInOut',
  },
};

export const borderGlowAnimation = {
  borderColor: [
    'rgba(34, 211, 238, 0.2)',
    'rgba(34, 211, 238, 0.5)',
    'rgba(34, 211, 238, 0.2)',
  ],
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: 'easeInOut',
  },
};

export const borderGlowAnimationBlue = {
  borderColor: [
    'rgba(59, 130, 246, 0.2)',
    'rgba(59, 130, 246, 0.5)',
    'rgba(59, 130, 246, 0.2)',
  ],
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: 'easeInOut',
  },
};

// ============================================
// V0 GRADIENT ORB ANIMATIONS
// ============================================

export const gradientOrbAnimation = {
  scale: [1, 1.1, 1],
  opacity: [0.25, 0.45, 0.25],
  transition: {
    duration: 8,
    repeat: Infinity,
    ease: 'easeInOut',
  },
};

export const gradientOrbMove = {
  x: [0, 25, 0],
  y: [0, -15, 0],
  scale: [1, 1.08, 1],
  transition: {
    duration: 10,
    repeat: Infinity,
    ease: 'easeInOut',
  },
};

// ============================================
// V0 PAGE TRANSITIONS
// ============================================

export const pageTransition: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: v0Ease }
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.25, ease: v0Ease }
  },
};

export const pageTransitionSlide: Variants = {
  initial: { opacity: 0, x: 16 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: v0Ease }
  },
  exit: {
    opacity: 0,
    x: -16,
    transition: { duration: 0.25, ease: v0Ease }
  },
};

// ============================================
// V0 MENU/DROPDOWN ANIMATIONS
// ============================================

export const dropdownVariants: Variants = {
  initial: { opacity: 0, y: -6, scale: 0.97 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.2, ease: v0Ease }
  },
  exit: {
    opacity: 0,
    y: -6,
    scale: 0.97,
    transition: { duration: 0.15, ease: v0Ease }
  },
};

export const menuItemVariants: Variants = {
  initial: { opacity: 0, x: -6 },
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
  animate: { opacity: 1, transition: { duration: 0.25 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

export const modalContent: Variants = {
  initial: { opacity: 0, scale: 0.96, y: 8 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.25, ease: v0Ease }
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 8,
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
      delay: 0.08,
      duration: 0.2,
      ease: v0Ease,
    },
  },
  collapsed: {
    opacity: 0,
    x: -8,
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
  y: [0, -16, 0],
  opacity: [0.25, 0.6, 0.25],
  transition: {
    duration: 3.5 + Math.random() * 1.5,
    repeat: Infinity,
    ease: 'easeInOut',
    delay: delay + Math.random() * 1.5,
  },
});

// ============================================
// V0 TEXT REVEAL ANIMATIONS
// ============================================

export const textRevealVariants: Variants = {
  initial: { opacity: 0, y: 16, rotateX: -30 },
  animate: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: { duration: 0.5, ease: v0Ease }
  },
};

export const letterAnimation = {
  initial: { opacity: 0, y: 32 },
  animate: { opacity: 1, y: 0 },
};

// ============================================
// V0 SHIMMER EFFECT
// ============================================

export const shimmerAnimation = {
  x: ['-100%', '100%'],
  transition: {
    duration: 1.2,
    repeat: Infinity,
    ease: 'linear',
  },
};

// ============================================
// V0 NOTIFICATION/TOAST ANIMATIONS
// ============================================

export const toastVariants: Variants = {
  initial: { opacity: 0, y: 40, scale: 0.96 },
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
    y: 16,
    scale: 0.96,
    transition: { duration: 0.2, ease: v0Ease }
  },
};

// ============================================
// V0 COUNTER ANIMATION
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
    duration: 0.9,
    repeat: Infinity,
    ease: 'linear',
  },
};

export const dotsLoadingAnimation = {
  scale: [1, 1.15, 1],
  opacity: [0.5, 1, 0.5],
  transition: {
    duration: 0.7,
    repeat: Infinity,
    ease: 'easeInOut',
  },
};

// ============================================
// V0 SCROLL INDICATOR
// ============================================

export const scrollIndicatorAnimation = {
  y: [0, 6, 0],
  opacity: [1, 0.5, 1],
  transition: {
    duration: 1.3,
    repeat: Infinity,
    ease: 'easeInOut',
  },
};

export const scrollDotAnimation = {
  y: [0, 10, 0],
  opacity: [1, 0.3, 1],
  transition: {
    duration: 1.3,
    repeat: Infinity,
    ease: 'easeInOut',
  },
};
