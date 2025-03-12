import { Bot, mockBots } from '@/models/bot';
import { CreateOrderDto } from '@/models/order';

export interface BotAuthResult {
  authenticated: boolean;
  bot?: Bot;
  error?: string;
}

export interface OrderValidationResult {
  valid: boolean;
  error?: string;
}

export const botAuthService = {
  /**
   * Authenticate a bot using its token
   */
  authenticateBot: (token: string): BotAuthResult => {
    if (!token) {
      return { authenticated: false, error: 'Missing bot token' };
    }

    // Find the bot with the matching token
    const bot = mockBots.find(b => b.token === token);
    
    if (!bot) {
      return { authenticated: false, error: 'Invalid bot token' };
    }

    // Check if the bot's plan is active
    if (!bot.plan.active) {
      return { authenticated: false, error: 'Bot plan is inactive' };
    }

    return { authenticated: true, bot };
  },

  /**
   * Validate an order against the bot's plan rules
   */
  validateOrder: (order: CreateOrderDto, bot: Bot): OrderValidationResult => {
    // Check if the symbol is allowed
    if (!bot.plan.allowedSymbols.includes(order.symbol)) {
      return { 
        valid: false, 
        error: `Symbol ${order.symbol} is not allowed for this bot's plan` 
      };
    }

    // Check if the direction is allowed
    if (!bot.plan.allowedDirections.includes(order.direction)) {
      return { 
        valid: false, 
        error: `Direction ${order.direction} is not allowed for this bot's plan` 
      };
    }

    // Check if the position size is within limits
    const positionSize = order.quantity * (order.price || 0);
    if (positionSize > bot.plan.maxPositionSize) {
      return { 
        valid: false, 
        error: `Position size ${positionSize} exceeds the maximum allowed (${bot.plan.maxPositionSize})` 
      };
    }

    // Check if the order type is allowed
    const orderType = order.orderType || bot.plan.defaultOrderType;
    if (!bot.plan.allowedOrderTypes.includes(orderType)) {
      return { 
        valid: false, 
        error: `Order type ${orderType} is not allowed for this bot's plan` 
      };
    }

    // Check if the bot has reached its daily order limit
    // In a real implementation, you would query the database for today's orders
    // For this mock implementation, we'll assume the limit hasn't been reached
    
    return { valid: true };
  },

  /**
   * Apply default configuration from the bot's plan to the order
   */
  applyDefaultConfiguration: (order: CreateOrderDto, bot: Bot): CreateOrderDto => {
    const configuredOrder = { ...order };
    
    // Apply default quantity if not specified
    if (!configuredOrder.quantity) {
      configuredOrder.quantity = bot.plan.defaultQuantity;
    }
    
    // Apply default order type if not specified
    if (!configuredOrder.orderType) {
      configuredOrder.orderType = bot.plan.defaultOrderType;
    }
    
    // Apply default take profit ticks if not specified
    if (!configuredOrder.takeProfitTicks && bot.plan.takeProfitTicks) {
      configuredOrder.takeProfitTicks = bot.plan.takeProfitTicks;
    }
    
    // Apply default stop loss ticks if not specified
    if (!configuredOrder.stopLossTicks && bot.plan.stopLossTicks) {
      configuredOrder.stopLossTicks = bot.plan.stopLossTicks;
    }
    
    return configuredOrder;
  },

  /**
   * Get the default broker ID for a user
   * In a real implementation, you would query the database for the user's default broker
   */
  getDefaultBrokerId: (userId: string): string => {
    // For this mock implementation, we'll return a fixed broker ID
    return '1';
  }
}; 