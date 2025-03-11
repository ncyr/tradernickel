import api from './index';

export interface Plan {
  id: number;
  name: string;
  description?: string;
  symbol: string;
  active: boolean;
  owner_id: number;
  owner_username?: string;
  broker_id: number;
  reverse_position_threshold: number;
  cancel_trade_in_progress: boolean;
  only_action: string;
  trailing_threshold_percentage: number;
  trade_same_direction: boolean;
  metadata?: any;
  created_at: string;
  updated_at?: string;
  expiration?: string;
}

export interface CreatePlanDTO {
  name: string;
  description?: string;
  symbol: string;
  active?: boolean;
  broker_id: number;
  reverse_position_threshold: number;
  cancel_trade_in_progress: boolean;
  only_action: string;
  trailing_threshold_percentage: number;
  trade_same_direction?: boolean;
  metadata?: any;
  expiration?: string;
}

export interface UpdatePlanDTO extends Partial<CreatePlanDTO> {}

export const planService = {
  setAuthHeader: (authHeader: string) => {
    api.defaults.headers.common.Authorization = authHeader;
  },

  getPlans: async (): Promise<Plan[]> => {
    try {
      const response = await api.get('/v1/plans');
      return response.data;
    } catch (error) {
      console.error('Error fetching plans:', error);
      throw error;
    }
  },

  getPlan: async (id: number): Promise<Plan> => {
    try {
      const response = await api.get(`/v1/plans/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching plan ${id}:`, error);
      throw error;
    }
  },

  createPlan: async (data: CreatePlanDTO): Promise<Plan> => {
    try {
      console.log('Creating plan with data:', data);
      const response = await api.post('/v1/plans', data);
      console.log('Create plan response:', response);
      return response.data;
    } catch (error) {
      console.error('Error creating plan:', error);
      throw error;
    }
  },

  updatePlan: async (id: number, data: UpdatePlanDTO): Promise<Plan> => {
    try {
      console.log(`Updating plan ${id} with data:`, data);
      const response = await api.patch(`/v1/plans/${id}`, data);
      console.log('Update plan response:', response);
      return response.data;
    } catch (error) {
      console.error(`Error updating plan ${id}:`, error);
      throw error;
    }
  },

  deletePlan: async (id: number): Promise<void> => {
    try {
      await api.delete(`/v1/plans/${id}`);
    } catch (error) {
      console.error(`Error deleting plan ${id}:`, error);
      throw error;
    }
  },
}; 