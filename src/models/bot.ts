export type OrderType = 'Limit' | 'MIT' | 'Market' | 'QTS' | 'Stop' | 'StopLimit' | 'TrailingStop' | 'TrailingStopLimit';

export interface BotPlan {
  id: string;
  name: string;
  maxOrdersPerDay: number;
  maxPositionSize: number;
  allowedDirections: ('long' | 'short')[];
  allowedSymbols: string[];
  allowedOrderTypes: OrderType[];
  defaultOrderType: OrderType;
  defaultQuantity: number;
  takeProfitTicks?: number;
  stopLossTicks?: number;
  active: boolean;
}

export interface Bot {
  id: string;
  name: string;
  token: string;
  user_id: string;
  plan_id: string;
  plan: BotPlan;
  created_at: string;
  updated_at: string;
}

// Mock data for bots
export const mockBots: Bot[] = [
  {
    id: '1',
    name: 'Momentum Bot',
    token: 'bot_token_momentum_123',
    user_id: 'user1',
    plan_id: '1',
    plan: {
      id: '1',
      name: 'Standard Plan',
      maxOrdersPerDay: 10,
      maxPositionSize: 5000,
      allowedDirections: ['long', 'short'],
      allowedSymbols: ['ES', 'NQ', 'CL'],
      allowedOrderTypes: ['Market', 'Limit', 'Stop', 'StopLimit'],
      defaultOrderType: 'Market',
      defaultQuantity: 1,
      takeProfitTicks: 8,
      stopLossTicks: 4,
      active: true
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Trend Following Bot',
    token: 'bot_token_trend_456',
    user_id: 'user1',
    plan_id: '2',
    plan: {
      id: '2',
      name: 'Premium Plan',
      maxOrdersPerDay: 20,
      maxPositionSize: 10000,
      allowedDirections: ['long', 'short'],
      allowedSymbols: ['ES', 'NQ', 'CL', 'GC', 'SI'],
      allowedOrderTypes: ['Market', 'Limit', 'Stop', 'StopLimit', 'TrailingStop', 'TrailingStopLimit'],
      defaultOrderType: 'Limit',
      defaultQuantity: 2,
      takeProfitTicks: 12,
      stopLossTicks: 6,
      active: true
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Long-Only Bot',
    token: 'bot_token_long_789',
    user_id: 'user1',
    plan_id: '3',
    plan: {
      id: '3',
      name: 'Basic Plan',
      maxOrdersPerDay: 5,
      maxPositionSize: 2000,
      allowedDirections: ['long'],
      allowedSymbols: ['ES', 'NQ'],
      allowedOrderTypes: ['Market', 'Limit'],
      defaultOrderType: 'Market',
      defaultQuantity: 1,
      takeProfitTicks: 6,
      stopLossTicks: 3,
      active: true
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]; 