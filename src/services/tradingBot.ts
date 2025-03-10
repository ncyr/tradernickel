import { getBroker } from './brokers/brokerFactory';
import { BrokerInterface, OrderParams, OrderResponse } from './brokers/brokerInterface';
import { tradeLogService } from './api/tradeLogs';

export class TradingBot {
  private broker: BrokerInterface;
  private botName: string;
  private isConnected: boolean = false;
  private userId: number | null = null;
  
  constructor(brokerName: string, botName: string) {
    this.botName = botName;
    this.broker = getBroker(brokerName, botName);
    
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
  
  public async connect(credentials: any): Promise<boolean> {
    try {
      this.isConnected = await this.broker.connect(credentials);
      return this.isConnected;
    } catch (error) {
      console.error(`Failed to connect ${this.botName} to broker:`, error);
      this.isConnected = false;
      return false;
    }
  }
  
  public async placeOrder(params: OrderParams): Promise<OrderResponse> {
    if (!this.isConnected) {
      throw new Error('Bot is not connected to broker. Please connect first.');
    }
    
    try {
      // Place the order through the broker
      const response = await this.broker.createOrder(params);
      return response;
    } catch (error: any) {
      console.error(`Error placing order with ${this.botName}:`, error);
      
      // Create a standardized error response
      return {
        orderId: null,
        status: 'rejected',
        filledQuantity: 0,
        remainingQuantity: params.quantity,
        message: error.message || 'Order placement failed',
        error: error
      };
    }
  }
  
  public async cancelOrder(orderId: number | string): Promise<boolean> {
    if (!this.isConnected) {
      throw new Error('Bot is not connected to broker. Please connect first.');
    }
    
    try {
      return await this.broker.cancelOrder(orderId);
    } catch (error) {
      console.error(`Error cancelling order with ${this.botName}:`, error);
      return false;
    }
  }
  
  public async getPositions(accountId: number): Promise<any[]> {
    if (!this.isConnected) {
      throw new Error('Bot is not connected to broker. Please connect first.');
    }
    
    try {
      return await this.broker.getPositions(accountId);
    } catch (error) {
      console.error(`Error getting positions with ${this.botName}:`, error);
      return [];
    }
  }
}

export default TradingBot; 