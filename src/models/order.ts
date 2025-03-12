import { OrderType } from './bot';

export type OrderDirection = 'long' | 'short';
export type OrderStatus = 'pending' | 'submitted' | 'filled' | 'cancelled' | 'rejected';

export interface Order {
  id: string;
  user_id: string;
  bot_id?: string;
  broker_id: string;
  symbol: string;
  quantity: number;
  price?: number;
  direction: OrderDirection;
  orderType: OrderType;
  takeProfitTicks?: number;
  stopLossTicks?: number;
  status: OrderStatus;
  metadata?: Record<string, any>;
  error?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateOrderDto {
  symbol: string;
  quantity: number;
  price?: number;
  direction: OrderDirection;
  orderType?: OrderType;
  takeProfitTicks?: number;
  stopLossTicks?: number;
  broker_id?: string;
  metadata?: Record<string, any>;
}

// Mock data for orders
export const mockOrders: Order[] = [
  {
    id: '1',
    user_id: 'user1',
    bot_id: '1',
    broker_id: '1',
    symbol: 'ES',
    quantity: 1,
    price: 5000.50,
    direction: 'long',
    orderType: 'Market',
    takeProfitTicks: 8,
    stopLossTicks: 4,
    status: 'filled',
    metadata: {
      strategy: 'momentum',
      signal_strength: 0.85
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    user_id: 'user1',
    bot_id: '2',
    broker_id: '1',
    symbol: 'NQ',
    quantity: 1,
    price: 17500.25,
    direction: 'short',
    orderType: 'Limit',
    takeProfitTicks: 12,
    stopLossTicks: 6,
    status: 'filled',
    metadata: {
      strategy: 'trend_following',
      signal_strength: 0.92
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]; 