import { Variants } from 'framer-motion';

// Fade animations
export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.5 } },
  exit: { opacity: 0, transition: { duration: 0.3 } },
};

export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }
  },
  exit: { opacity: 0, y: 20, transition: { duration: 0.3 } },
};

export const fadeInDown: Variants = {
  initial: { opacity: 0, y: -20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }
  },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
};

// Scale animations
export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }
  },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.3 } },
};

export const scaleInBounce: Variants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: [0.175, 0.885, 0.32, 1.275] }
  },
  exit: { opacity: 0, scale: 0.8, transition: { duration: 0.3 } },
};

// Stagger container for lists
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

export const staggerContainerFast: Variants = {
  initial: {},
  animate: {
    transition: { staggerChildren: 0.05, delayChildren: 0.05 },
  },
};

// Stagger item
export const staggerItem: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }
  },
};

// Slide animations
export const slideInLeft: Variants = {
  initial: { x: '-100%', opacity: 0 },
  animate: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }
  },
  exit: { x: '-100%', opacity: 0, transition: { duration: 0.3 } },
};

export const slideInRight: Variants = {
  initial: { x: '100%', opacity: 0 },
  animate: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }
  },
  exit: { x: '100%', opacity: 0, transition: { duration: 0.3 } },
};

// Card hover animation
export const cardHover = {
  rest: { scale: 1, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' },
  hover: {
    scale: 1.02,
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    transition: { duration: 0.3, ease: 'easeOut' }
  },
  tap: { scale: 0.98 },
};

// Button press animation
export const buttonPress = {
  tap: { scale: 0.95 },
  hover: { scale: 1.02 },
};

// Page transition
export const pageTransition: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94], staggerChildren: 0.1 }
  },
  exit: { opacity: 0, y: -20, transition: { duration: 0.4 } },
};

// Floating animation
export const floating: Variants = {
  initial: { y: 0 },
  animate: {
    y: [-10, 10, -10],
    transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
  },
};

// Pulse animation
export const pulse: Variants = {
  initial: { scale: 1 },
  animate: {
    scale: [1, 1.05, 1],
    transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
  },
};

// Spring configurations
export const springConfig = {
  gentle: { type: 'spring', stiffness: 120, damping: 14 },
  bouncy: { type: 'spring', stiffness: 300, damping: 10 },
  stiff: { type: 'spring', stiffness: 400, damping: 30 },
};

// Transition presets
export const transitions = {
  smooth: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  snappy: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] },
  bounce: { type: 'spring', stiffness: 300, damping: 15 },
};
