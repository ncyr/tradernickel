import axios from 'axios';
import { getConfig } from '../config/env';

const api = axios.create({
  baseURL: getConfig().apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const createEntity = async (endpoint: string, data: any) => {
  const response = await api.post(endpoint, data);
  return response.data;
};

export const getEntities = async (endpoint: string) => {
  const response = await api.get(endpoint);
  return response.data;
};

export const getEntityById = async (endpoint: string, id: string) => {
  const response = await api.get(`${endpoint}/${id}`);
  return response.data;
};

export const updateEntity = async (endpoint: string, id: string, data: any) => {
  const response = await api.put(`${endpoint}/${id}`, data);
  return response.data;
};

export const deleteEntity = async (endpoint: string, id: string) => {
  const response = await api.delete(`${endpoint}/${id}`);
  return response.data;
}; 