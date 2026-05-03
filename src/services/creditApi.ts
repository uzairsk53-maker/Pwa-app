import apiClient from './apiClient';
import type { ApiResponse } from '@/types';

export const creditApi = {
  repayment: async (data: { shopkeeperId: string; amount: number; isLate?: boolean }): Promise<{ creditScore: number; creditPoints: number }> => {
    const res = await apiClient.post<ApiResponse<{ creditScore: number; creditPoints: number }>>('/credit/repayment', data);
    return res.data.data;
  },
};
