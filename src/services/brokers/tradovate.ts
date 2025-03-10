import { tradovateService, TradovateOrder } from '../api/tradovate';
import { tradeLogService } from '../api/tradeLogs';
import { BrokerInterface, OrderParams, OrderResponse } from './brokerInterface';

export class TradovateBroker implements BrokerInterface {
  private brokerName = 'Tradovate';
  private userId: number | null = null;
  private botName: string | null = null;

  constructor(botName?: string) {
    if (botName) {
      this.botName = botName;
    }
    
    // Try to get user ID from localStorage
    const userJson = localStorage.getItem('user');
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        this.userId = user.id;
      } catch (error) {
        console.error('Failed to parse user from localStorage:', error);
      }
    }
  }

  private mapOrderParams(params: OrderParams): TradovateOrder {
    // Convert generic order params to Tradovate-specific format
    const tradovateOrder: TradovateOrder = {
      accountId: params.accountId,
      symbol: params.symbol,
      orderQty: params.quantity,
      orderType: params.orderType as 'Market' | 'Limit' | 'Stop' | 'StopLimit',
      action: params.side as 'Buy' | 'Sell',
    };

    // Add optional parameters if provided
    if (params.price) tradovateOrder.price = params.price;
    if (params.stopPrice) tradovateOrder.stopPrice = params.stopPrice;
    if (params.timeInForce) tradovateOrder.timeInForce = params.timeInForce as 'Day' | 'GTC' | 'IOC' | 'FOK';

    return tradovateOrder;
  }

  private async logTrade(params: OrderParams, response: any, status: 'success' | 'failed' | 'pending', errorMessage?: string) {
    if (!this.userId) {
      console.warn('Cannot log trade: No user ID available');
      return;
    }

    try {
      await tradeLogService.createTradeLog({
        trade_type: params.side.toLowerCase(),
        symbol: params.symbol,
        quantity: params.quantity,
        price: params.price || 0,
        status: status,
        exchange: 'Tradovate',
        order_id: response?.orderId?.toString() || undefined,
        bot_name: this.botName || undefined,
        error_message: errorMessage,
        metadata: {
          orderParams: params,
          response: response
        }
      });
    } catch (error) {
      console.error('Failed to log trade:', error);
    }
  }

  public async connect(credentials: any): Promise<boolean> {
    try {
      await tradovateService.login(credentials);
      return true;
    } catch (error) {
      console.error('Failed to connect to Tradovate:', error);
      return false;
    }
  }

  public async createOrder(params: OrderParams): Promise<OrderResponse> {
    try {
      // First, ensure we have a valid token
      await tradovateService.getAccessToken();
      
      // Log the pending order
      await this.logTrade(params, null, 'pending');
      
      // Map parameters to Tradovate format
      const tradovateOrder = this.mapOrderParams(params);
      
      // Create the order
      const response = await tradovateService.createOrder(tradovateOrder);
      
      // Log the successful order
      await this.logTrade(params, response, 'success');
      
      // Return the response in a standardized format
      return {
        orderId: response.orderId,
        status: 'filled',
        filledQuantity: response.orderQty,
        remainingQuantity: 0,
        avgFillPrice: response.price,
        commission: response.commissionCharged || 0,
        message: 'Order placed successfully',
        rawResponse: response
      };
    } catch (error: any) {
      console.error('Error creating order on Tradovate:', error);
      
      // Log the failed order
      await this.logTrade(
        params, 
        null, 
        'failed', 
        error.message || 'Unknown error occurred while creating order'
      );
      
      // Return error response
      return {
        orderId: null,
        status: 'rejected',
        filledQuantity: 0,
        remainingQuantity: params.quantity,
        avgFillPrice: 0,
        commission: 0,
        message: error.message || 'Order failed',
        error: error
      };
    }
  }

  public async cancelOrder(orderId: number): Promise<boolean> {
    try {
      await tradovateService.cancelOrder(orderId);
      return true;
    } catch (error) {
      console.error('Error cancelling order on Tradovate:', error);
      return false;
    }
  }

  public async getPositions(accountId: number): Promise<any[]> {
    try {
      return await tradovateService.getPositions(accountId);
    } catch (error) {
      console.error('Error getting positions from Tradovate:', error);
      return [];
    }
  }
}

export default TradovateBroker; 