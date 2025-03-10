// Common order parameters used across different brokers
export interface OrderParams {
  symbol: string;
  quantity: number;
  side: 'Buy' | 'Sell';
  orderType: 'Market' | 'Limit' | 'Stop' | 'StopLimit';
  price?: number;
  stopPrice?: number;
  timeInForce?: string;
  accountId: number;
  [key: string]: any; // Additional broker-specific parameters
}

// Standardized order response
export interface OrderResponse {
  orderId: string | number | null;
  status: 'filled' | 'partially_filled' | 'pending' | 'rejected' | 'cancelled';
  filledQuantity: number;
  remainingQuantity: number;
  avgFillPrice?: number;
  commission?: number;
  message?: string;
  error?: any;
  rawResponse?: any;
}

// Interface that all broker implementations must follow
export interface BrokerInterface {
  // Connect to the broker with credentials
  connect(credentials: any): Promise<boolean>;
  
  // Create an order
  createOrder(params: OrderParams): Promise<OrderResponse>;
  
  // Cancel an existing order
  cancelOrder(orderId: number | string): Promise<boolean>;
  
  // Get current positions
  getPositions(accountId: number): Promise<any[]>;
} 