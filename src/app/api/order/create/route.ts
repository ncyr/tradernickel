import { NextRequest, NextResponse } from 'next/server';
import { botAuthService } from '@/services/botAuth';
import { ordersService } from '@/services/orders';
import { CreateOrderDto } from '@/models/order';
import { OrderType } from '@/models/bot';

// CORS headers for the API
const responseHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Bot-Token',
};

// Error response headers
const errorHeaders = {
  ...responseHeaders,
  'x-error': '1',
};

// Create error response
const createErrorResponse = (error: string, status = 500) => {
  return NextResponse.json(
    { error },
    { status, headers: errorHeaders }
  );
};

// Handle OPTIONS requests for CORS
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: responseHeaders,
  });
}

// POST /api/order/create - Create a new order from a bot
export async function POST(request: NextRequest) {
  try {
    // Get the bot token from the header
    const botToken = request.headers.get('x-bot-token');
    
    // Authenticate the bot
    const authResult = botAuthService.authenticateBot(botToken || '');
    if (!authResult.authenticated || !authResult.bot) {
      return createErrorResponse(authResult.error || 'Bot authentication failed', 401);
    }

    // Parse request body
    const data = await request.json();
    
    // Validate required fields
    if (!data.symbol) {
      return createErrorResponse('Symbol is required', 400);
    }
    if (!data.quantity || data.quantity <= 0) {
      return createErrorResponse('Quantity must be a positive number', 400);
    }
    if (!data.direction || !['long', 'short'].includes(data.direction)) {
      return createErrorResponse('Direction must be either "long" or "short"', 400);
    }

    // Validate order type if provided
    if (data.orderType && !['Limit', 'MIT', 'Market', 'QTS', 'Stop', 'StopLimit', 'TrailingStop', 'TrailingStopLimit'].includes(data.orderType)) {
      return createErrorResponse('Invalid order type', 400);
    }

    // Create order DTO
    const orderDto: CreateOrderDto = {
      symbol: data.symbol,
      quantity: data.quantity,
      price: data.price,
      direction: data.direction,
      orderType: data.orderType as OrderType,
      takeProfitTicks: data.takeProfitTicks,
      stopLossTicks: data.stopLossTicks,
      metadata: data.metadata || {},
    };

    // Apply default configuration from the bot's plan
    const configuredOrder = botAuthService.applyDefaultConfiguration(orderDto, authResult.bot);

    // Validate the order against the bot's plan
    const validationResult = botAuthService.validateOrder(configuredOrder, authResult.bot);
    if (!validationResult.valid) {
      return createErrorResponse(validationResult.error || 'Order validation failed', 400);
    }

    // Set the broker ID if not provided
    if (!configuredOrder.broker_id) {
      configuredOrder.broker_id = botAuthService.getDefaultBrokerId(authResult.bot.user_id);
    }

    // Create the order
    const order = await ordersService.create(configuredOrder, authResult.bot.user_id, authResult.bot.id);

    // Return the created order
    return NextResponse.json(order, { 
      status: 201, 
      headers: responseHeaders 
    });
  } catch (error: any) {
    console.error('Error in POST /api/order/create:', error);
    return createErrorResponse(error.message || 'An unexpected error occurred');
  }
} 