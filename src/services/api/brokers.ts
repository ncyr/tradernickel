import api from './index';
import { AxiosResponse } from 'axios';

export interface Broker {
  id: number;
  name: string;
  description?: string;
  active: boolean;
  metadata?: Record<string, any>;
  demo_url: string;
  prod_url: string;
  created_at: string;
  updated_at: string;
}

export interface CreateBrokerDTO {
  name: string;
  description?: string;
  metadata?: any;
  demo_url: string;
  prod_url: string;
}

export interface UpdateBrokerDTO extends Partial<CreateBrokerDTO> {}

export const brokerService = {
  setAuthHeader: (authHeader: string) => {
    api.defaults.headers.common.Authorization = authHeader;
  },

  getBrokers: async (): Promise<Broker[]> => {
    try {
      const response = await api.get<Broker[]>('/v1/brokers');
      return response.data;
    } catch (error) {
      console.error('Error fetching brokers:', error);
      throw error;
    }
  },
  
  getBroker: async (id: string | number): Promise<Broker> => {
    try {
      const response = await api.get<Broker>(`/v1/brokers/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching broker ${id}:`, error);
      throw error;
    }
  },
  
  createBroker: async (data: CreateBrokerDTO): Promise<Broker> => {
    try {
      console.log('Creating broker with data:', data);
      const response = await api.post<Broker>('/v1/brokers', data);
      console.log('Create broker response:', response);
      return response.data;
    } catch (error) {
      console.error('Error creating broker:', error);
      throw error;
    }
  },
  
  updateBroker: async (id: string | number, data: UpdateBrokerDTO): Promise<Broker> => {
    try {
      console.log(`Updating broker ${id} with data:`, data);
      const response = await api.put<Broker>(`/v1/brokers/${id}`, data);
      console.log('Update broker response:', response);
      return response.data;
    } catch (error) {
      console.error(`Error updating broker ${id}:`, error);
      throw error;
    }
  },
  
  deleteBroker: async (id: string | number): Promise<void> => {
    try {
      await api.delete(`/v1/brokers/${id}`);
    } catch (error) {
      console.error(`Error deleting broker ${id}:`, error);
      throw error;
    }
  },
}; 