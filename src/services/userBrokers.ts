import { apiClient } from '@/utils/api';

export interface UserBroker {
  id: string;
  user_id: string;
  broker_id: string;
  broker_name: string;
  api_key: string;
  created_at: string;
  updated_at: string;
}

export interface CreateUserBrokerDto {
  broker_id: string;
  api_key: string;
}

export interface UpdateUserBrokerDto {
  api_key: string;
}

export const userBrokersService = {
  getAll: async (): Promise<UserBroker[]> => {
    const response = await apiClient.get('/user-brokers');
    return response.data;
  },

  getById: async (id: string): Promise<UserBroker> => {
    const response = await apiClient.get(`/user-brokers/${id}`);
    return response.data;
  },

  create: async (data: CreateUserBrokerDto): Promise<UserBroker> => {
    const response = await apiClient.post('/user-brokers', data);
    return response.data;
  },

  update: async (id: string, data: UpdateUserBrokerDto): Promise<UserBroker> => {
    const response = await apiClient.put(`/user-brokers/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/user-brokers/${id}`);
  },
}; 