import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { ordersService } from '@/services/orders';

// Define JWT payload interface
interface JWTPayload {
  sub?: string;
  name?: string;
  iat?: number;
  exp?: number;
}

// CORS headers for the API
const responseHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Error response headers
const errorHeaders = {
  ...responseHeaders,
  'x-error': '1',
};

// JWT verification function
const verifyAuth = (request: NextRequest) => {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return { verified: false, error: 'Missing token' };
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return { verified: false, error: 'Missing JWT secret' };
    }

    const decoded = jwt.verify(token, secret) as JWTPayload;
    return { verified: true, user: decoded };
  } catch (error: any) {
    return { verified: false, error: error.message };
  }
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

// GET /api/orders/[id] - Get a specific order
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const auth = verifyAuth(request);
    if (!auth.verified) {
      return createErrorResponse(auth.error || 'Authentication failed', 401);
    }

    // Get user ID from token
    const userId = auth.user?.sub || '123456'; // Default to '123456' for testing

    // Get the order
    const order = await ordersService.getById(params.id);
    
    // Check if the order exists
    if (!order) {
      return createErrorResponse('Order not found', 404);
    }
    
    // Check if the order belongs to the user
    if (order.user_id !== userId) {
      return createErrorResponse('Unauthorized access to this order', 403);
    }

    return NextResponse.json(order, { headers: responseHeaders });
  } catch (error: any) {
    console.error(`Error in GET /api/orders/${params.id}:`, error);
    return createErrorResponse(error.message || 'An unexpected error occurred');
  }
}

// DELETE /api/orders/[id] - Cancel an order
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const auth = verifyAuth(request);
    if (!auth.verified) {
      return createErrorResponse(auth.error || 'Authentication failed', 401);
    }

    // Get user ID from token
    const userId = auth.user?.sub || '123456'; // Default to '123456' for testing

    // Get the order first to check ownership
    const order = await ordersService.getById(params.id);
    
    // Check if the order exists
    if (!order) {
      return createErrorResponse('Order not found', 404);
    }
    
    // Check if the order belongs to the user
    if (order.user_id !== userId) {
      return createErrorResponse('Unauthorized access to this order', 403);
    }

    // Cancel the order
    const cancelledOrder = await ordersService.cancel(params.id);
    
    if (!cancelledOrder) {
      return createErrorResponse('Failed to cancel order', 500);
    }

    return NextResponse.json(cancelledOrder, { headers: responseHeaders });
  } catch (error: any) {
    console.error(`Error in DELETE /api/orders/${params.id}:`, error);
    return createErrorResponse(error.message || 'An unexpected error occurred');
  }
} 