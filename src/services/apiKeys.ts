import { apiClient } from '@/utils/api';

export interface ApiKey {
  id: number;
  user_id: number;
  key_name: string;
  api_key?: string; // Only included when first created
  permissions: string[];
  status: 'active' | 'expired' | 'revoked';
  expires_at: string | null;
  last_used_at: string | null;
  created_at: string;
  updated_at: string;
  created_by: number;
  revoked_at: string | null;
  revoked_by: number | null;
  user_username: string;
  user_email: string;
  created_by_username: string;
  revoked_by_username: string | null;
}

export interface CreateApiKeyDto {
  key_name: string;
  expires_at?: string;
}

export const apiKeysService = {
  getAll: async (): Promise<ApiKey[]> => {
    const response = await apiClient.get('/api-keys');
    return response.data;
  },

  getAllAdmin: async (): Promise<ApiKey[]> => {
    const response = await apiClient.get('/api-keys/all');
    return response.data;
  },

  create: async (data: CreateApiKeyDto): Promise<ApiKey> => {
    const response = await apiClient.post('/api-keys', data);
    return response.data;
  },

  revoke: async (id: number): Promise<ApiKey> => {
    const response = await apiClient.post(`/api-keys/${id}/revoke`);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/api-keys/${id}`);
  },
}; 