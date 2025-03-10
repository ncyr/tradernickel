import api from './index';

export interface BotPlan {
  id: number;
  bot_id: number;
  plan_id: number;
  metadata: any;
  created_at: string;
  bot_name?: string;
  plan_name?: string;
  owner_id?: number;
  owner_username?: string;
}

export interface CreateBotPlanDTO {
  bot_id: number;
  plan_id: number;
  metadata?: any;
}

export interface UpdateBotPlanDTO extends Partial<CreateBotPlanDTO> {}

export const botPlanService = {
  getBotPlans: async (): Promise<BotPlan[]> => {
    const response = await api.get('/bot_plans');
    return response.data;
  },

  getBotPlan: async (id: number): Promise<BotPlan> => {
    const response = await api.get(`/bot_plans/${id}`);
    return response.data;
  },

  createBotPlan: async (data: CreateBotPlanDTO): Promise<BotPlan> => {
    const response = await api.post('/bot_plans', data);
    return response.data;
  },

  updateBotPlan: async (id: number, data: UpdateBotPlanDTO): Promise<BotPlan> => {
    const response = await api.patch(`/bot_plans/${id}`, data);
    return response.data;
  },

  deleteBotPlan: async (id: number): Promise<void> => {
    await api.delete(`/bot_plans/${id}`);
  },
}; 