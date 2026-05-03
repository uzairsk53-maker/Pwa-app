import apiClient from './apiClient';
import type { ApiResponse, DashboardData, Shopkeeper, UpdateProfileRequest } from '@/types';

export const shopkeeperApi = {
  getDashboard: async (): Promise<DashboardData> => {
    const res = await apiClient.get<ApiResponse<DashboardData>>('/shopkeeper/dashboard');
    return res.data.data;
  },

  updateProfile: async (data: UpdateProfileRequest): Promise<Shopkeeper> => {
    const res = await apiClient.put<ApiResponse<Shopkeeper>>('/shopkeeper/profile', data);
    return res.data.data;
  },
};
