'use client';

import { useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth.store';
import { getMe, refreshToken, hasToken, logout as apiLogout } from '@/lib/api/auth';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { setUser, setLoading, logout, isAuthenticated } = useAuthStore();

  // Verificar sesión al cargar
  const checkAuth = useCallback(async () => {
    if (!hasToken()) {
      setLoading(false);
      return;
    }

    try {
      const user = await getMe();
      setUser(user);
    } catch (error) {
      // Intentar refresh token
      try {
        await refreshToken();
        const user = await getMe();
        setUser(user);
      } catch {
        // Si falla el refresh, cerrar sesión
        logout();
      }
    } finally {
      setLoading(false);
    }
  }, [setUser, setLoading, logout]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Configurar refresh automático cada 10 minutos
  useEffect(() => {
    if (!isAuthenticated) return;

    const refreshInterval = setInterval(async () => {
      try {
        await refreshToken();
      } catch {
        logout();
        router.push('/login');
      }
    }, 10 * 60 * 1000); // 10 minutos

    return () => clearInterval(refreshInterval);
  }, [isAuthenticated, logout, router]);

  // Redirect si está autenticado y está en login
  useEffect(() => {
    if (isAuthenticated && pathname === '/login') {
      router.push('/admin');
    }
  }, [isAuthenticated, pathname, router]);

  return <>{children}</>;
}

// Hook para logout con redirect
export function useLogout() {
  const router = useRouter();
  const { logout } = useAuthStore();

  return async () => {
    try {
      await apiLogout();
    } finally {
      logout();
      router.push('/login');
    }
  };
}
