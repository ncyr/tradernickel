import api from './index';

export interface Schedule {
  id: number;
  start_at: string;
  end_at: string;
  weekday: number;
  bot_plan_id: number;
  created_at: string;
}

export interface CreateScheduleDTO {
  start_at: string;
  end_at: string;
  weekday: number;
  bot_plan_id: number;
}

export interface UpdateScheduleDTO extends Partial<CreateScheduleDTO> {}

export const scheduleService = {
  getSchedules: async (): Promise<Schedule[]> => {
    const response = await api.get('/schedules');
    return response.data;
  },

  getSchedule: async (id: number): Promise<Schedule> => {
    const response = await api.get(`/schedules/${id}`);
    return response.data;
  },

  createSchedule: async (schedule: CreateScheduleDTO): Promise<Schedule> => {
    const response = await api.post('/schedules', schedule);
    return response.data;
  },

  updateSchedule: async (id: number, data: UpdateScheduleDTO): Promise<Schedule> => {
    const response = await api.patch(`/schedules/${id}`, data);
    return response.data;
  },

  deleteSchedule: async (id: number): Promise<void> => {
    await api.delete(`/schedules/${id}`);
  },
}; 