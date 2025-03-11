import api from './index';
import { AxiosResponse } from 'axios';

export interface Schedule {
  id: number;
  weekday: number;
  start_at: string;
  end_at: string;
  bot_plan_id: number;
  created_at: string;
  updated_at: string;
}

export interface CreateScheduleDTO {
  start_at: string;
  end_at: string;
  weekday: number;
  bot_plan_id: number;
}

export interface UpdateScheduleDTO extends Partial<CreateScheduleDTO> {}

export const scheduleService = {
  setAuthHeader: (authHeader: string) => {
    api.defaults.headers.common.Authorization = authHeader;
  },
  
  getSchedules: () => 
    api.get<Schedule[]>('/v1/schedules')
      .then((response: AxiosResponse<Schedule[]>) => response.data),
  
  getSchedule: (id: string | number) => 
    api.get<Schedule>(`/v1/schedules/${id}`)
      .then((response: AxiosResponse<Schedule>) => response.data),
  
  createSchedule: (data: Partial<Schedule>) => 
    api.post<Schedule>('/v1/schedules', data)
      .then((response: AxiosResponse<Schedule>) => response.data),
  
  updateSchedule: (id: string | number, data: Partial<Schedule>) => 
    api.put<Schedule>(`/v1/schedules/${id}`, data)
      .then((response: AxiosResponse<Schedule>) => response.data),
  
  deleteSchedule: (id: string | number) => 
    api.delete(`/v1/schedules/${id}`)
      .then((response: AxiosResponse<void>) => response.data),
}; 