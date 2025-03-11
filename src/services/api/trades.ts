import api from './index';
import { AxiosResponse } from 'axios';

export interface Trade {
  id: number;
  bot_id: number;
  bot_name?: string;
  plan_id: number;
  plan_name?: string;
  symbol: string;
  entry_price: number;
  exit_price: number;
  quantity: number;
  side: 'BUY' | 'SELL';
  status: 'OPEN' | 'CLOSED' | 'CANCELLED';
  profit: number;
  profit_percentage: number;
  metadata?: any;
  created_at: string;
  closed_at?: string;
  owner_id?: number;
  owner_username?: string;
}

export interface TradeStats {
  total_trades: number;
  profit_today: number;
  profit_total: number;
  winning_trades: number;
  losing_trades: number;
}

export const tradeService = {
  setAuthHeader: (authHeader: string) => {
    api.defaults.headers.common.Authorization = authHeader;
  },

  getTrades: () =>
    api.get<Trade[]>('/v1/trades')
      .then((response: AxiosResponse<Trade[]>) => response.data),

  getTrade: (id: string | number) =>
    api.get<Trade>(`/v1/trades/${id}`)
      .then((response: AxiosResponse<Trade>) => response.data),

  getTradeStats: () =>
    api.get<TradeStats>('/v1/trades/stats')
      .then((response: AxiosResponse<TradeStats>) => response.data),
}; 