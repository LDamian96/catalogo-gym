'use client';

import { useState, useEffect, useCallback } from 'react';

type Theme = 'light' | 'dark' | 'system';

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  // Get system preference
  const getSystemTheme = useCallback((): 'light' | 'dark' => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  }, []);

  // Apply theme to document
  const applyTheme = useCallback((newTheme: 'light' | 'dark') => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(newTheme);
      setResolvedTheme(newTheme);
    }
  }, []);

  // Initialize theme from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('theme') as Theme | null;
    if (stored) {
      setThemeState(stored);
      const resolved = stored === 'system' ? getSystemTheme() : stored;
      applyTheme(resolved);
    } else {
      const systemTheme = getSystemTheme();
      applyTheme(systemTheme);
    }
  }, [getSystemTheme, applyTheme]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        applyTheme(getSystemTheme());
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, getSystemTheme, applyTheme]);

  // Set theme function
  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
    const resolved = newTheme === 'system' ? getSystemTheme() : newTheme;
    applyTheme(resolved);
  }, [getSystemTheme, applyTheme]);

  // Toggle between light and dark
  const toggleTheme = useCallback(() => {
    const newTheme = resolvedTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  }, [resolvedTheme, setTheme]);

  return {
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme,
    isDark: resolvedTheme === 'dark',
  };
}
