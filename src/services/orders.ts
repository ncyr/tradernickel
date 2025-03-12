import { CreateOrderDto, Order, mockOrders } from '@/models/order';

export const ordersService = {
  /**
   * Get all orders
   */
  getAll: async (): Promise<Order[]> => {
    // In a real implementation, you would query the database
    return mockOrders;
  },

  /**
   * Get an order by ID
   */
  getById: async (id: string): Promise<Order | null> => {
    // In a real implementation, you would query the database
    const order = mockOrders.find(o => o.id === id);
    return order || null;
  },

  /**
   * Get orders by user ID
   */
  getByUserId: async (userId: string): Promise<Order[]> => {
    // In a real implementation, you would query the database
    
    // For testing purposes, if the user ID is '123456', return all mock orders
    if (userId === '123456') {
      return mockOrders;
    }
    
    return mockOrders.filter(o => o.user_id === userId);
  },

  /**
   * Get orders by bot ID
   */
  getByBotId: async (botId: string): Promise<Order[]> => {
    // In a real implementation, you would query the database
    return mockOrders.filter(o => o.bot_id === botId);
  },

  /**
   * Create a new order
   */
  create: async (order: CreateOrderDto, userId: string, botId?: string): Promise<Order> => {
    // In a real implementation, you would insert into the database
    const newOrder: Order = {
      id: Math.random().toString(36).substring(2, 9),
      user_id: userId,
      bot_id: botId,
      broker_id: order.broker_id || '1', // Default broker ID
      symbol: order.symbol,
      quantity: order.quantity,
      price: order.price,
      direction: order.direction,
      orderType: order.orderType || 'Market', // Default to Market if not specified
      takeProfitTicks: order.takeProfitTicks,
      stopLossTicks: order.stopLossTicks,
      status: 'pending',
      metadata: order.metadata || {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Add to mock data
    mockOrders.push(newOrder);

    // In a real implementation, you would submit the order to the broker
    // and update the status based on the broker's response
    
    // For this mock implementation, we'll simulate a successful submission
    setTimeout(() => {
      const index = mockOrders.findIndex(o => o.id === newOrder.id);
      if (index !== -1) {
        mockOrders[index].status = 'submitted';
        mockOrders[index].updated_at = new Date().toISOString();
      }
    }, 1000);

    return newOrder;
  },

  /**
   * Cancel an order
   */
  cancel: async (id: string): Promise<Order | null> => {
    // In a real implementation, you would update the database
    const index = mockOrders.findIndex(o => o.id === id);
    if (index === -1) {
      return null;
    }

    // Check if the order can be cancelled
    if (mockOrders[index].status === 'filled' || mockOrders[index].status === 'cancelled') {
      return mockOrders[index];
    }

    // Update the order status
    mockOrders[index].status = 'cancelled';
    mockOrders[index].updated_at = new Date().toISOString();

    // In a real implementation, you would send a cancel request to the broker
    
    return mockOrders[index];
  }
}; 