import api from './index';

export interface Broker {
  id: number;
  name: string;
  active: boolean;
  metadata: any;
  demo_url: string;
  prod_url: string;
  created_at: string;
}

export interface CreateBrokerDTO {
  name: string;
  active?: boolean;
  metadata?: any;
  demo_url: string;
  prod_url: string;
}

export interface UpdateBrokerDTO extends Partial<CreateBrokerDTO> {}

export const brokerService = {
  getBrokers: async (): Promise<Broker[]> => {
    const response = await api.get('/brokers');
    return response.data;
  },

  getBroker: async (id: number): Promise<Broker> => {
    const response = await api.get(`/brokers/${id}`);
    return response.data;
  },

  createBroker: async (data: CreateBrokerDTO): Promise<Broker> => {
    const response = await api.post('/brokers', data);
    return response.data;
  },

  updateBroker: async (id: number, data: UpdateBrokerDTO): Promise<Broker> => {
    const response = await api.patch(`/brokers/${id}`, data);
    return response.data;
  },

  deleteBroker: async (id: number): Promise<void> => {
    await api.delete(`/brokers/${id}`);
  },
}; 