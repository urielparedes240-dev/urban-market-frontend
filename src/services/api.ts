import axios, { type AxiosInstance, type InternalAxiosRequestConfig, type AxiosResponse, AxiosError } from 'axios';

// Cliente Axios configurado para ERP Minimarkets Multi-Sede
const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 12000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-System-Client': 'RETAIL-ERP-MINIMARKET-WEB'
  }
});

// Interceptor para inyección del Token JWT en peticiones
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('retail_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Interceptor para capturar expiración o rechazos 401/403
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      console.warn('[Retail API] Token no válido o expirado.');
      localStorage.removeItem('retail_token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    } else if (error.response?.status === 403) {
      console.error('[Retail API] Permiso denegado: El rol actual no tiene acceso.');
    }
    return Promise.reject(error);
  }
);

export default apiClient;
