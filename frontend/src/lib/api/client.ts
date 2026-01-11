import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export const api = axios.create({
  baseURL: API_URL,
});

// Interceptor para agregar token y Content-Type
api.interceptors.request.use((config) => {
  // Agregar token si existe
  const token = Cookies.get('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Solo establecer Content-Type JSON si NO es FormData
  // Axios maneja automáticamente el Content-Type para FormData
  if (!(config.data instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json';
  }

  return config;
});

// Interceptor para extraer data y manejar errores
api.interceptors.response.use(
  (response) => {
    // El backend envuelve respuestas en { success: true, data: {...} }
    // Extraemos data automáticamente
    if (response.data && response.data.success && response.data.data !== undefined) {
      response.data = response.data.data;
    }
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      Cookies.remove('accessToken');
      Cookies.remove('refreshToken');
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
