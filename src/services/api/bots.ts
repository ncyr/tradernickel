import api from './index';

export interface Bot {
  id: number;
  name: string;
  description: string;
  active: boolean;
  metadata: any;
  region: string;
  provider: string;
  uuid: string;
  owner_id: number;
  broker_id: number;
  copy_active: boolean;
  created_at: string;
  owner_username?: string;
  broker_name?: string;
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

export const botService = {
  getBots: async (): Promise<Bot[]> => {
    const response = await api.get('/bots');
    return response.data;
  },

  getBot: async (id: number): Promise<Bot> => {
    const response = await api.get(`/bots/${id}`);
    return response.data;
  },

  createBot: async (data: CreateBotDTO): Promise<Bot> => {
    const response = await api.post('/bots', data);
    return response.data;
  },

  updateBot: async (id: number, data: UpdateBotDTO): Promise<Bot> => {
    const response = await api.patch(`/bots/${id}`, data);
    return response.data;
  },

  deleteBot: async (id: number): Promise<void> => {
    await api.delete(`/bots/${id}`);
  },
}; 