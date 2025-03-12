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

// Mock data for bot plans
const MOCK_BOT_PLANS = [
  {
    id: 1,
    bot_id: 1,
    plan_id: 1,
    bot_name: 'ES Futures Bot',
    plan_name: 'ES Scalping Strategy',
    owner_username: 'trader1',
    owner_id: 1,
    metadata: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 2,
    bot_id: 2,
    plan_id: 2,
    bot_name: 'NQ Futures Bot',
    plan_name: 'NQ Trend Following',
    owner_username: 'trader1',
    owner_id: 1,
    metadata: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 3,
    bot_id: 3,
    plan_id: 3,
    bot_name: 'CL Futures Bot',
    plan_name: 'CL Breakout Strategy',
    owner_username: 'trader2',
    owner_id: 2,
    metadata: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const botPlanService = {
  setAuthHeader: (authHeader: string) => {
    api.defaults.headers.common.Authorization = authHeader;
  },
  
  // Mock implementations that return the mock data
  getBotPlans: () => {
    console.log('Using mock data for getBotPlans');
    return Promise.resolve(MOCK_BOT_PLANS);
  },
  
  getBotPlan: (id: string | number) => {
    console.log(`Using mock data for getBotPlan(${id})`);
    const plan = MOCK_BOT_PLANS.find(p => p.id === Number(id));
    return Promise.resolve(plan || null);
  },
  
  createBotPlan: (data: CreateBotPlanDTO) => {
    console.log('Using mock data for createBotPlan', data);
    const newPlan = {
      id: Math.max(...MOCK_BOT_PLANS.map(p => p.id)) + 1,
      ...data,
      bot_name: `Bot ${data.bot_id}`,
      plan_name: `Plan ${data.plan_id}`,
      owner_username: 'test',
      owner_id: 1,
      metadata: data.metadata || {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    MOCK_BOT_PLANS.push(newPlan);
    return Promise.resolve(newPlan);
  },
  
  updateBotPlan: (id: string | number, data: UpdateBotPlanDTO) => {
    console.log(`Using mock data for updateBotPlan(${id})`, data);
    const index = MOCK_BOT_PLANS.findIndex(p => p.id === Number(id));
    if (index === -1) {
      return Promise.reject(new Error('Bot plan not found'));
    }
    const updatedPlan = {
      ...MOCK_BOT_PLANS[index],
      ...data,
      updated_at: new Date().toISOString(),
    };
    MOCK_BOT_PLANS[index] = updatedPlan;
    return Promise.resolve(updatedPlan);
  },
  
  deleteBotPlan: (id: string | number) => {
    console.log(`Using mock data for deleteBotPlan(${id})`);
    const index = MOCK_BOT_PLANS.findIndex(p => p.id === Number(id));
    if (index === -1) {
      return Promise.reject(new Error('Bot plan not found'));
    }
    MOCK_BOT_PLANS.splice(index, 1);
    return Promise.resolve();
  },

  getBotPlansWithNames: async () => {
    try {
      console.log('Using mock data for getBotPlansWithNames');
      return MOCK_BOT_PLANS;
    } catch (error: any) {
      console.error('Error loading bot plans with names:', error);
      return MOCK_BOT_PLANS;
    }
  },
}; 