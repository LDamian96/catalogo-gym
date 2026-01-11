import { api } from './client';
import Cookies from 'js-cookie';
import type { User } from '@/types';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

// Respuesta real del backend
export interface BackendAuthResponse {
  user: User;
  tokens: AuthTokens;
}

// Respuesta normalizada para el frontend
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

// Login con email y password
export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  const { data } = await api.post<BackendAuthResponse>('/auth/login', credentials);

  // Guardar tokens en cookies
  Cookies.set('accessToken', data.tokens.accessToken, { expires: 1 }); // 1 día
  Cookies.set('refreshToken', data.tokens.refreshToken, { expires: 7 }); // 7 días

  // Retornar estructura normalizada
  return {
    accessToken: data.tokens.accessToken,
    refreshToken: data.tokens.refreshToken,
    user: data.user,
  };
}

// Obtener usuario actual
export async function getMe(): Promise<User> {
  const { data } = await api.get<{ user: User }>('/auth/me');
  return data.user;
}

// Refresh token
export async function refreshToken(): Promise<RefreshResponse> {
  const currentRefreshToken = Cookies.get('refreshToken');

  if (!currentRefreshToken) {
    throw new Error('No refresh token available');
  }

  const { data } = await api.post<{ accessToken: string; refreshToken: string; expiresIn: string }>('/auth/refresh', {
    refreshToken: currentRefreshToken,
  });

  // Actualizar tokens
  Cookies.set('accessToken', data.accessToken, { expires: 1 });
  Cookies.set('refreshToken', data.refreshToken, { expires: 7 });

  return {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
  };
}

// Logout
export async function logout(): Promise<void> {
  try {
    await api.post('/auth/logout');
  } finally {
    // Siempre limpiar cookies, incluso si falla el request
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
  }
}

// Verificar si hay token
export function hasToken(): boolean {
  return !!Cookies.get('accessToken');
}

// Obtener access token actual
export function getAccessToken(): string | undefined {
  return Cookies.get('accessToken');
}
