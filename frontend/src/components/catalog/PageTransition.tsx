'use client';

import { createContext, useContext, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface TransitionContextType {
  navigateWithTransition: (href: string) => void;
  isTransitioning: boolean;
}

const TransitionContext = createContext<TransitionContextType | null>(null);

export function usePageTransition() {
  const context = useContext(TransitionContext);
  if (!context) {
    throw new Error('usePageTransition must be used within PageTransitionProvider');
  }
  return context;
}

interface PageTransitionProviderProps {
  children: ReactNode;
}

export function PageTransitionProvider({ children }: PageTransitionProviderProps) {
  const router = useRouter();

  const navigateWithTransition = useCallback((href: string) => {
    // Navigate directly - no animation delay
    router.push(href);
  }, [router]);

  return (
    <TransitionContext.Provider value={{ navigateWithTransition, isTransitioning: false }}>
      {children}
    </TransitionContext.Provider>
  );
}

// Link component with transition
interface TransitionLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function TransitionLink({ href, children, className, onClick }: TransitionLinkProps) {
  const { navigateWithTransition } = usePageTransition();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    onClick?.();
    navigateWithTransition(href);
  };

  return (
    <a href={href} onClick={handleClick} className={className}>
      {children}
    </a>
  );
}
