'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { v0Ease, gradientOrbAnimation } from '@/lib/animations';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/button';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-[#0a0a0f] relative overflow-hidden">
      {/* Theme Toggle - Top Right */}
      <div className="absolute top-4 right-4 z-20">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="text-neutral-600 dark:text-white/70 hover:text-neutral-900 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.04]"
        >
          <AnimatePresence mode="wait" initial={false}>
            {isDark ? (
              <motion.div
                key="sun"
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 90 }}
                transition={{ duration: 0.2 }}
              >
                <Sun className="w-5 h-5" />
              </motion.div>
            ) : (
              <motion.div
                key="moon"
                initial={{ scale: 0, rotate: 90 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: -90 }}
                transition={{ duration: 0.2 }}
              >
                <Moon className="w-5 h-5" />
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </div>

      {/* V0 Soft Background */}
      <div className="absolute inset-0">
        {/* Light mode background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(139,92,246,0.08),transparent)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(139,92,246,0.15),transparent)]" />

        {/* Subtle mesh gradient - Multi-color */}
        <div className="absolute inset-0 bg-[radial-gradient(at_27%_37%,hsla(263,70%,50%,0.05)_0px,transparent_50%),radial-gradient(at_97%_21%,hsla(330,70%,50%,0.04)_0px,transparent_50%)] dark:bg-[radial-gradient(at_27%_37%,hsla(263,70%,50%,0.1)_0px,transparent_50%),radial-gradient(at_97%_21%,hsla(330,70%,50%,0.08)_0px,transparent_50%)]" />

        {/* Animated Gradient Orbs - V0 Soft Style */}
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-violet-500/5 dark:bg-violet-500/10 rounded-full blur-[120px]"
          animate={gradientOrbAnimation}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500/5 dark:bg-pink-500/8 rounded-full blur-[100px]"
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [0.15, 0.3, 0.15],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/3 dark:bg-purple-500/6 rounded-full blur-[150px]"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* V0 Dot Pattern - Violet */}
        <div
          className="absolute inset-0 opacity-20 dark:opacity-40"
          style={{
            backgroundImage: 'radial-gradient(rgba(167, 139, 250, 0.15) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
      </div>

      {/* Content */}
      <motion.div
        className="relative z-10 w-full max-w-md px-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: v0Ease }}
      >
        {children}
      </motion.div>
    </div>
  );
}
