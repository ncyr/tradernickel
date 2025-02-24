import { api } from './api';
import type { Plan, CreatePlanDTO, UpdatePlanDTO } from '@/types/plan';

export const planService = {
  getPlans: async (): Promise<Plan[]> => {
    const response = await api.get('/v1/plans');
    return response.data;
  },

  createPlan: async (plan: CreatePlanDTO): Promise<Plan> => {
    const response = await api.post('/v1/plans', plan);
    return response.data;
  },

  updatePlan: async (id: number, plan: UpdatePlanDTO): Promise<Plan> => {
    const response = await api.put(`/v1/plans/${id}`, plan);
    return response.data;
  },

  deletePlan: async (id: number): Promise<void> => {
    await api.delete(`/v1/plans/${id}`);
  },

  getPlanById: async (id: number): Promise<Plan> => {
    const response = await api.get(`/v1/plans/${id}`);
    return response.data;
  }
}; 