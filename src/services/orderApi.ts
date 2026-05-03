import apiClient from './apiClient';
import type { ApiResponse, Order, OrderListResponse, OrderQuery, CreateOrderRequest } from '@/types';

export const orderApi = {
  getOrders: async (query: OrderQuery = {}): Promise<OrderListResponse> => {
    const params = new URLSearchParams();
    if (query.page) params.set('page', String(query.page));
    if (query.limit) params.set('limit', String(query.limit));
    if (query.status) params.set('status', query.status);
    if (query.date) params.set('date', query.date);
    
    const res = await apiClient.get<ApiResponse<OrderListResponse>>(`/order?${params.toString()}`);
    return res.data.data;
  },

  getOrderById: async (id: string): Promise<Order> => {
    const res = await apiClient.get<ApiResponse<Order>>(`/order/${id}`);
    return res.data.data;
  },

  createOrder: async (data: CreateOrderRequest): Promise<Order> => {
    const res = await apiClient.post<ApiResponse<Order>>('/order', data);
    return res.data.data;
  },
};
