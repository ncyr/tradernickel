import api from './index';
import { AxiosResponse } from 'axios';

export interface Bot {
  id: number;
  name: string;
  description?: string;
  region: string;
  provider: string;
  broker_id: number;
  active: boolean;
  copy_active: boolean;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Region {
  id: string;
  name: string;
}

export interface Provider {
  id: string;
  name: string;
}

export interface CreateBotDTO {
  name: string;
  description: string;
  metadata?: any;
  region: string;
  provider: string;
  broker_id: number;
  copy_active?: boolean;
  active?: boolean;
}

export interface UpdateBotDTO extends Partial<CreateBotDTO> {}

// Create a function to get the base URL
const getBaseUrl = () => {
  // If running in the browser, use relative URLs
  if (typeof window !== 'undefined') {
    return '';
  }
  // If running on the server, use the full URL from environment
  return process.env.NEXT_PUBLIC_API_URL || 'https://api-local.tradernickel.com';
};

export const botService = {
  setAuthHeader: (authHeader: string) => {
    api.defaults.headers.common.Authorization = authHeader;
  },
  
  getBots: async (): Promise<Bot[]> => {
    try {
      const response = await api.get<Bot[]>('/v1/bots');
      return response.data;
    } catch (error) {
      console.error('Error fetching bots:', error);
      throw error;
    }
  },
  
  getBot: async (id: string | number): Promise<Bot> => {
    try {
      const response = await api.get<Bot>(`/v1/bots/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching bot ${id}:`, error);
      throw error;
    }
  },
  
  createBot: async (data: Partial<Bot>): Promise<Bot> => {
    try {
      const response = await api.post<Bot>('/v1/bots', data);
      return response.data;
    } catch (error) {
      console.error('Error creating bot:', error);
      throw error;
    }
  },
  
  updateBot: async (id: string | number, data: Partial<Bot>): Promise<Bot> => {
    try {
      console.log('Updating bot:', {
        id,
        url: `/v1/bots/${id}`,
        data,
        headers: api.defaults.headers
      });
      
      const response = await api.put<Bot>(`/v1/bots/${id}`, data);
      console.log('Update response:', {
        status: response.status,
        data: response.data,
        headers: response.headers
      });
      
      return response.data;
    } catch (error: any) {
      console.error('Error updating bot:', {
        error,
        response: error.response,
        config: error.config
      });
      throw error;
    }
  },
  
  deleteBot: async (id: string | number): Promise<void> => {
    try {
      await api.delete(`/v1/bots/${id}`);
    } catch (error) {
      console.error(`Error deleting bot ${id}:`, error);
      throw error;
    }
  },

  getRegions: async (): Promise<Region[]> => {
    try {
      const response = await api.get<Region[]>('/v1/bots/regions');
      return response.data;
    } catch (error) {
      console.error('Error fetching regions:', error);
      throw error;
    }
  },

  getProviders: async (): Promise<Provider[]> => {
    try {
      const response = await api.get<Provider[]>('/v1/bots/providers');
      return response.data;
    } catch (error) {
      console.error('Error fetching providers:', error);
      throw error;
    }
  }
}; 