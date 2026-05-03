import apiClient from './apiClient';
import type { ApiResponse, AuthTokens, LoginRequest, RegisterRequest } from '@/types';

export const authApi = {
  login: async (data: LoginRequest): Promise<AuthTokens> => {
    const res = await apiClient.post<ApiResponse<AuthTokens>>('/auth/login', data);
    return res.data.data;
  },

  register: async (data: RegisterRequest): Promise<void> => {
    await apiClient.post<ApiResponse>('/auth/register-shopkeeper', data);
  },

  refresh: async (refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> => {
    const res = await apiClient.post<ApiResponse<{ accessToken: string; refreshToken: string }>>('/auth/refresh', { refreshToken });
    return res.data.data;
  },
};
