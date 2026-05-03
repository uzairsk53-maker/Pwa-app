import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - attach auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle 401 auto-logout
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = useAuthStore.getState().refreshToken;
      if (refreshToken) {
        try {
          const res = await axios.post(
            `${import.meta.env.VITE_API_BASE_URL}/auth/refresh`,
            { refreshToken }
          );
          
          if (res.data.success) {
            const { accessToken, refreshToken: newRefresh } = res.data.data;
            useAuthStore.getState().setTokens(accessToken, newRefresh);
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return apiClient(originalRequest);
          }
        } catch {
          useAuthStore.getState().logout();
          window.location.href = '/login';
          return Promise.reject(error);
        }
      }
      
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
