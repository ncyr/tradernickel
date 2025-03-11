import { apiClient } from '@/utils/api';

export interface Broker {
  id: string;
  name: string;
  active: boolean;
  metadata: Record<string, any>;
  demo_url?: string;
  created_at: string;
  updated_at: string;
}

export const brokersService = {
  getAll: async (): Promise<Broker[]> => {
    const response = await apiClient.get('/brokers');
    return response.data;
  },

  getById: async (id: string): Promise<Broker> => {
    const response = await apiClient.get(`/brokers/${id}`);
    return response.data;
  },
}; 