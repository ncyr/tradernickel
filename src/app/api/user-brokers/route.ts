/**
 * User Brokers API
 * 
 * This API provides endpoints for managing user brokers.
 * 
 * GET /api/user-brokers - Get all user brokers
 * GET /api/user-brokers?id=1 - Get a specific user broker
 * POST /api/user-brokers - Create a new user broker
 * PUT /api/user-brokers?id=1 - Update a specific user broker
 * DELETE /api/user-brokers?id=1 - Delete a specific user broker
 * 
 * All endpoints require JWT authentication via the Authorization header.
 * Example: Authorization: Bearer <token>
 * 
 * Error responses include detailed information about the error.
 */

import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// CORS headers for the API
const responseHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
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

    const decoded = jwt.verify(token, secret);
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

// Mock user brokers data
const mockUserBrokers = [
  {
    id: '1',
    user_id: 'user1',
    broker_id: '1',
    broker_name: 'Tradovate',
    api_key: 'api_key_123456789',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    user_id: 'user1',
    broker_id: '2',
    broker_name: 'Interactive Brokers',
    api_key: 'api_key_987654321',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// GET /api/user-brokers - Get all user brokers
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const auth = verifyAuth(request);
    if (!auth.verified) {
      return createErrorResponse(auth.error || 'Authentication failed', 401);
    }

    // Check if an ID is provided in the query parameters
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (id) {
      // Return a specific user broker
      const userBroker = mockUserBrokers.find(broker => broker.id === id);
      if (!userBroker) {
        return createErrorResponse('User broker not found', 404);
      }
      return NextResponse.json(userBroker, { headers: responseHeaders });
    }

    // Return all user brokers
    return NextResponse.json(mockUserBrokers, { headers: responseHeaders });
  } catch (error: any) {
    console.error('Error in GET /api/user-brokers:', error);
    return createErrorResponse(error.message || 'An unexpected error occurred');
  }
}

// POST /api/user-brokers - Create a new user broker
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const auth = verifyAuth(request);
    if (!auth.verified) {
      return createErrorResponse(auth.error || 'Authentication failed', 401);
    }

    // Parse request body
    const data = await request.json();
    
    // Validate required fields
    if (!data.broker_id) {
      return createErrorResponse('Broker ID is required', 400);
    }
    if (!data.api_key) {
      return createErrorResponse('API key is required', 400);
    }

    // Mock broker names
    const brokerNames: Record<string, string> = {
      '1': 'Tradovate',
      '2': 'Interactive Brokers',
      '3': 'TD Ameritrade',
    };

    // Create a new user broker
    const newUserBroker = {
      id: Math.random().toString(36).substring(2, 9),
      user_id: 'user1', // Mock user ID
      broker_id: data.broker_id,
      broker_name: brokerNames[data.broker_id] || 'Unknown Broker',
      api_key: data.api_key,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Add to mock data
    mockUserBrokers.push(newUserBroker);

    return NextResponse.json(newUserBroker, { headers: responseHeaders });
  } catch (error: any) {
    console.error('Error in POST /api/user-brokers:', error);
    return createErrorResponse(error.message || 'An unexpected error occurred');
  }
}

// PUT /api/user-brokers - Update a user broker
export async function PUT(request: NextRequest) {
  try {
    // Verify authentication
    const auth = verifyAuth(request);
    if (!auth.verified) {
      return createErrorResponse(auth.error || 'Authentication failed', 401);
    }

    // Check if an ID is provided in the query parameters
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    if (!id) {
      return createErrorResponse('ID is required', 400);
    }

    // Parse request body
    const data = await request.json();
    
    // Validate required fields
    if (!data.api_key) {
      return createErrorResponse('API key is required', 400);
    }

    // Find the user broker to update
    const userBrokerIndex = mockUserBrokers.findIndex(broker => broker.id === id);
    if (userBrokerIndex === -1) {
      return createErrorResponse('User broker not found', 404);
    }

    // Update the user broker
    mockUserBrokers[userBrokerIndex] = {
      ...mockUserBrokers[userBrokerIndex],
      api_key: data.api_key,
      updated_at: new Date().toISOString(),
    };

    return NextResponse.json(mockUserBrokers[userBrokerIndex], { headers: responseHeaders });
  } catch (error: any) {
    console.error('Error in PUT /api/user-brokers:', error);
    return createErrorResponse(error.message || 'An unexpected error occurred');
  }
}

// DELETE /api/user-brokers - Delete a user broker
export async function DELETE(request: NextRequest) {
  try {
    // Verify authentication
    const auth = verifyAuth(request);
    if (!auth.verified) {
      return createErrorResponse(auth.error || 'Authentication failed', 401);
    }

    // Check if an ID is provided in the query parameters
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    if (!id) {
      return createErrorResponse('ID is required', 400);
    }

    // Find the user broker to delete
    const userBrokerIndex = mockUserBrokers.findIndex(broker => broker.id === id);
    if (userBrokerIndex === -1) {
      return createErrorResponse('User broker not found', 404);
    }

    // Delete the user broker
    mockUserBrokers.splice(userBrokerIndex, 1);

    return NextResponse.json({ message: 'User broker deleted successfully' }, { headers: responseHeaders });
  } catch (error: any) {
    console.error('Error in DELETE /api/user-brokers:', error);
    return createErrorResponse(error.message || 'An unexpected error occurred');
  }
} 