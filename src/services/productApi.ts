import apiClient from './apiClient';
import type { ApiResponse, ProductListResponse, ProductQuery } from '@/types';

export const productApi = {
  getProducts: async (query: ProductQuery = {}): Promise<ProductListResponse> => {
    const params = new URLSearchParams();
    if (query.page) params.set('page', String(query.page));
    if (query.limit) params.set('limit', String(query.limit));
    if (query.search) params.set('search', query.search);
    if (query.category && query.category !== 'All') params.set('category', query.category);
    
    const res = await apiClient.get<ApiResponse<ProductListResponse>>(`/product?${params.toString()}`);
    return res.data.data;
  },
};
