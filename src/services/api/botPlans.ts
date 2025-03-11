import api from './index';
import { AxiosResponse } from 'axios';

export interface BotPlan {
  id: number;
  bot_id: number;
  plan_id: number;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
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
  setAuthHeader: (authHeader: string) => {
    api.defaults.headers.common.Authorization = authHeader;
  },
  
  getBotPlans: () => 
    api.get<BotPlan[]>('/v1/bot-plans')
      .then((response: AxiosResponse<BotPlan[]>) => response.data),
  
  getBotPlan: (id: string | number) => 
    api.get<BotPlan>(`/v1/bot-plans/${id}`)
      .then((response: AxiosResponse<BotPlan>) => response.data),
  
  createBotPlan: (data: CreateBotPlanDTO) => 
    api.post<BotPlan>('/v1/bot-plans', data)
      .then((response: AxiosResponse<BotPlan>) => response.data),
  
  updateBotPlan: (id: string | number, data: UpdateBotPlanDTO) => 
    api.patch<BotPlan>(`/v1/bot-plans/${id}`, data)
      .then((response: AxiosResponse<BotPlan>) => response.data),
  
  deleteBotPlan: (id: string | number) => 
    api.delete(`/v1/bot-plans/${id}`)
      .then((response: AxiosResponse<void>) => response.data),

  getBotPlansWithNames: () =>
    api.get<BotPlan[]>('/v1/bot-plans/with-names')
      .then((response: AxiosResponse<BotPlan[]>) => response.data),
}; 