import api from './apiClient';

export const deliveryApi = {
  getProfile: async () => {
    const res = await api.get('/delivery/profile');
    return res.data; // { success: true, data: { profile: { ... } } }
  },

  updateProfile: async (data: { name?: string; email?: string; vehicleNo?: string; city?: string; latitude?: number; longitude?: number }) => {
    const res = await api.put('/delivery/profile', data);
    return res.data;
  },

  updateLocation: async (data: { latitude: number; longitude: number }) => {
    const res = await api.put('/delivery/location', data);
    return res.data;
  },
};
