'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Loader2, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useTracking } from '@/hooks/useTracking';

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  variant?: 'default' | 'hero' | 'compact';
  onSearch?: (query: string) => void;
}

const popularSearches = [
  'Zapatillas',
  'Ofertas',
  'Nuevo',
  'Destacados',
];

export function SearchBar({
  placeholder = 'Buscar productos...',
  className,
  variant = 'default',
  onSearch,
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { trackSearch } = useTracking();

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);

    // Track search event to GA4, FB Pixel, TikTok Pixel
    trackSearch(query.trim());

    if (onSearch) {
      onSearch(query);
    } else {
      router.push(`/buscar?q=${encodeURIComponent(query.trim())}`);
    }

    setIsSearching(false);
    setIsFocused(false);
  };

  const handleQuickSearch = (term: string) => {
    setQuery(term);
    // Track search event
    trackSearch(term);
    router.push(`/buscar?q=${encodeURIComponent(term)}`);
    setIsFocused(false);
  };

  const clearSearch = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsFocused(false);
        inputRef.current?.blur();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  return (
    <div className={cn('relative w-full max-w-2xl', className)}>
      <form onSubmit={handleSubmit}>
        <motion.div
          className={cn(
            'relative flex items-center overflow-hidden',
            'bg-white/10 backdrop-blur-md',
            'border border-white/20',
            'transition-all duration-300',
            variant === 'hero' && 'rounded-2xl h-16',
            variant === 'default' && 'rounded-xl h-12',
            variant === 'compact' && 'rounded-lg h-10',
            isFocused && 'ring-2 ring-violet-500/50 border-violet-500/50 bg-white/20'
          )}
          animate={isFocused ? { scale: 1.02 } : { scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          {/* Search Icon */}
          <motion.div
            className={cn(
              'flex items-center justify-center',
              variant === 'hero' ? 'w-16' : 'w-12'
            )}
            animate={isSearching ? { rotate: 360 } : { rotate: 0 }}
            transition={{ duration: 1, repeat: isSearching ? Infinity : 0 }}
          >
            {isSearching ? (
              <Loader2 className={cn(
                'text-white/60 animate-spin',
                variant === 'hero' ? 'w-6 h-6' : 'w-5 h-5'
              )} />
            ) : (
              <Search className={cn(
                'text-white/60',
                variant === 'hero' ? 'w-6 h-6' : 'w-5 h-5'
              )} />
            )}
          </motion.div>

          {/* Input */}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            placeholder={placeholder}
            className={cn(
              'flex-1 bg-transparent border-none outline-none',
              'text-white placeholder:text-white/40',
              variant === 'hero' && 'text-lg',
              variant === 'default' && 'text-base',
              variant === 'compact' && 'text-sm'
            )}
          />

          {/* Clear Button */}
          <AnimatePresence>
            {query && (
              <motion.button
                type="button"
                onClick={clearSearch}
                className="p-2 hover:bg-white/10 rounded-full mr-2"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
              >
                <X className="w-4 h-4 text-white/60" />
              </motion.button>
            )}
          </AnimatePresence>

          {/* Search Button */}
          <motion.button
            type="submit"
            className={cn(
              'flex items-center justify-center',
              'bg-gradient-to-r from-violet-600 to-fuchsia-600',
              'text-white font-medium',
              'transition-all duration-300',
              variant === 'hero' && 'h-12 px-6 rounded-xl mr-2',
              variant === 'default' && 'h-9 px-4 rounded-lg mr-1.5',
              variant === 'compact' && 'h-7 px-3 rounded-md mr-1 text-sm'
            )}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={isSearching}
          >
            Buscar
          </motion.button>
        </motion.div>
      </form>

      {/* Quick Searches Dropdown */}
      <AnimatePresence>
        {isFocused && !query && (
          <motion.div
            className="absolute top-full left-0 right-0 mt-2 z-50"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="bg-slate-900/95 backdrop-blur-md rounded-xl border border-white/10 p-4 shadow-2xl">
              <div className="flex items-center gap-2 text-white/50 text-sm mb-3">
                <TrendingUp className="w-4 h-4" />
                <span>Búsquedas populares</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {popularSearches.map((term) => (
                  <motion.button
                    key={term}
                    type="button"
                    onClick={() => handleQuickSearch(term)}
                    className={cn(
                      'px-4 py-2 rounded-full',
                      'bg-white/10 hover:bg-violet-600/50',
                      'text-white/80 hover:text-white',
                      'text-sm font-medium',
                      'transition-all duration-200'
                    )}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {term}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
