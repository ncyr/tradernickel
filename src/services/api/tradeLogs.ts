import api from './index';

export interface TradeLog {
  id: number;
  user_id: number;
  api_key_id: number | null;
  trade_type: 'buy' | 'sell' | 'limit_buy' | 'limit_sell' | 'market_buy' | 'market_sell' | string;
  symbol: string;
  quantity: number;
  price: number;
  total_value: number;
  status: 'success' | 'failed' | 'pending' | string;
  exchange: string | null;
  order_id: string | null;
  bot_name: string | null;
  error_message: string | null;
  metadata: any | null;
  created_at: string;
  updated_at: string | null;
}

export interface CreateTradeLogDTO {
  trade_type: TradeLog['trade_type'];
  symbol: string;
  quantity: number;
  price: number;
  total_value?: number;
  status: TradeLog['status'];
  exchange?: string;
  order_id?: string;
  bot_name?: string;
  error_message?: string;
  metadata?: any;
}

export interface UpdateTradeLogDTO {
  status?: TradeLog['status'];
  error_message?: string;
  metadata?: any;
}

export interface TradeLogFilters {
  page?: number;
  limit?: number;
  symbol?: string;
  trade_type?: string;
  status?: string;
  start_date?: string;
  end_date?: string;
  bot_name?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface PaginatedTradeLogResponse {
  tradeLogs: TradeLog[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface TradeLogStats {
  status_counts: Array<{status: string, count: string}>;
  type_counts: Array<{trade_type: string, count: string}>;
  total_values: {
    total_buy_value: string | null;
    total_sell_value: string | null;
  };
  popular_symbols: Array<{symbol: string, count: string}>;
  bot_counts: Array<{bot_name: string, count: string}>;
}

export const tradeLogService = {
  setAuthHeader: (authHeader: string) => {
    api.defaults.headers.common.Authorization = authHeader;
  },

  createTradeLog: async (data: CreateTradeLogDTO): Promise<TradeLog> => {
    const response = await api.post('/v1/trade-logs', data);
    return response.data;
  },

  getTradeLogsByUser: async (filters: TradeLogFilters = {}): Promise<PaginatedTradeLogResponse> => {
    const response = await api.get('/v1/trade-logs', { params: filters });
    return response.data;
  },

  getTradeLogById: async (id: number): Promise<TradeLog> => {
    const response = await api.get(`/v1/trade-logs/${id}`);
    return response.data;
  },

  updateTradeLog: async (id: number, data: UpdateTradeLogDTO): Promise<TradeLog> => {
    const response = await api.patch(`/v1/trade-logs/${id}`, data);
    return response.data;
  },

  deleteTradeLog: async (id: number): Promise<void> => {
    await api.delete(`/v1/trade-logs/${id}`);
  },

  getTradeLogStats: async (filters: {
    start_date?: string;
    end_date?: string;
    bot_name?: string;
  } = {}): Promise<TradeLogStats> => {
    const response = await api.get('/v1/trade-logs/stats/summary', { params: filters });
    return response.data;
  }
};

export default tradeLogService; 