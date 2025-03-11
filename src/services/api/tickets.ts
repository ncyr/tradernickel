import axios from 'axios';
import api from './index';

export interface TicketPriority {
  id: number;
  name: string;
  color: string;
  urgency_level: number;
}

export interface TicketStatus {
  id: number;
  name: string;
  color: string;
  is_closed: boolean;
  sort_order: number;
}

export interface TicketDepartment {
  id: number;
  name: string;
  description: string;
  active: boolean;
}

export interface TicketResponse {
  id: number;
  ticket_id: number;
  user_id: number;
  message: string;
  is_internal: boolean;
  created_at: string;
  username: string;
  name: string;
}

export interface TicketAttachment {
  id: number;
  ticket_id: number;
  response_id: number | null;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  uploaded_by: number;
  created_at: string;
}

export interface Ticket {
  id: number;
  ticket_number: string;
  subject: string;
  description: string;
  created_at: string;
  updated_at: string;
  last_response_at: string;
  closed_at: string | null;
  source: string;
  is_overdue: boolean;
  creator_username: string;
  creator_name: string;
  assignee_username: string | null;
  assignee_name: string | null;
  department_name: string;
  status_name: string;
  status_color: string;
  is_closed: boolean;
  priority_name: string;
  priority_color: string;
  urgency_level: number;
}

export interface TicketDetails {
  ticket: Ticket;
  responses: TicketResponse[];
  attachments: TicketAttachment[];
}

export interface CreateTicketDto {
  subject: string;
  description: string;
  department_id: number;
  priority_id?: number;
}

export interface AddResponseDto {
  message: string;
  is_internal?: boolean;
}

export interface UpdateTicketDto {
  status_id?: number;
  priority_id?: number;
  assignee_id?: number;
  department_id?: number;
}

export interface TicketsResponse {
  data: Ticket[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

/**
 * Get all tickets with pagination and filters
 */
export const getTickets = async (
  page = 1,
  limit = 10,
  status?: string,
  priority?: string,
  department?: string
): Promise<TicketsResponse> => {
  const params = { page, limit, status, priority, department };
  const response = await api.get('/tickets', { params });
  return response.data;
};

/**
 * Get ticket by ID with responses and attachments
 */
export const getTicketById = async (id: number): Promise<TicketDetails> => {
  const response = await api.get(`/tickets/${id}`);
  return response.data;
};

/**
 * Create a new ticket
 */
export const createTicket = async (ticketData: CreateTicketDto): Promise<Ticket> => {
  const response = await api.post('/tickets', ticketData);
  return response.data;
};

/**
 * Add a response to a ticket
 */
export const addResponse = async (
  ticketId: number,
  responseData: AddResponseDto
): Promise<TicketResponse> => {
  const response = await api.post(`/tickets/${ticketId}/responses`, responseData);
  return response.data;
};

/**
 * Update a ticket (status, priority, assignee, department)
 */
export const updateTicket = async (
  ticketId: number,
  updateData: UpdateTicketDto
): Promise<Ticket> => {
  const response = await api.patch(`/tickets/${ticketId}`, updateData);
  return response.data;
};

/**
 * Upload an attachment to a ticket
 */
export const uploadAttachment = async (
  ticketId: number,
  file: File,
  responseId?: number
): Promise<TicketAttachment> => {
  const formData = new FormData();
  formData.append('file', file);
  if (responseId) {
    formData.append('response_id', responseId.toString());
  }

  const response = await api.post(`/tickets/${ticketId}/attachments`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * Get all ticket departments
 */
export const getDepartments = async (): Promise<TicketDepartment[]> => {
  const response = await api.get('/tickets/departments/list');
  return response.data;
};

/**
 * Get all ticket priorities
 */
export const getPriorities = async (): Promise<TicketPriority[]> => {
  const response = await api.get('/tickets/priorities/list');
  return response.data;
};

/**
 * Get all ticket statuses
 */
export const getStatuses = async (): Promise<TicketStatus[]> => {
  const response = await api.get('/tickets/statuses/list');
  return response.data;
};

/**
 * Get all staff members for ticket assignment
 */
export const getStaff = async (): Promise<any[]> => {
  const response = await api.get('/tickets/staff/list');
  return response.data;
}; 