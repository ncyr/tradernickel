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

// GET /api/user-brokers/[id] - Get a specific user broker
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

    const id = params.id;
    
    // Mock user broker data for the specific ID
    let userBroker;
    
    if (id === '1') {
      userBroker = {
        id: '1',
        user_id: 'user1',
        broker_id: '1',
        broker_name: 'Tradovate',
        api_key: 'api_key_123456789',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    } else if (id === '2') {
      userBroker = {
        id: '2',
        user_id: 'user1',
        broker_id: '2',
        broker_name: 'Interactive Brokers',
        api_key: 'api_key_987654321',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }
    
    if (!userBroker) {
      return createErrorResponse('User broker not found', 404);
    }

    return NextResponse.json(userBroker, { headers: responseHeaders });
  } catch (error: any) {
    console.error(`Error in GET /api/user-brokers/${params.id}:`, error);
    return createErrorResponse(error.message || 'An unexpected error occurred');
  }
}

// PUT /api/user-brokers/[id] - Update a specific user broker
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const auth = verifyAuth(request);
    if (!auth.verified) {
      return createErrorResponse(auth.error || 'Authentication failed', 401);
    }

    const id = params.id;
    
    // Parse request body
    const data = await request.json();
    
    // Validate required fields
    if (!data.api_key) {
      return createErrorResponse('API key is required', 400);
    }

    // Mock user broker data for the specific ID
    let userBroker;
    
    if (id === '1' || id === '2') {
      // Create a mock updated user broker
      userBroker = {
        id,
        user_id: 'user1',
        broker_id: id === '1' ? '1' : '2',
        broker_name: id === '1' ? 'Tradovate' : 'Interactive Brokers',
        api_key: data.api_key,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }
    
    if (!userBroker) {
      return createErrorResponse('User broker not found', 404);
    }

    return NextResponse.json(userBroker, { headers: responseHeaders });
  } catch (error: any) {
    console.error(`Error in PUT /api/user-brokers/${params.id}:`, error);
    return createErrorResponse(error.message || 'An unexpected error occurred');
  }
}

// DELETE /api/user-brokers/[id] - Delete a specific user broker
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

    const id = params.id;
    
    // Check if the user broker exists
    if (id !== '1' && id !== '2') {
      return createErrorResponse('User broker not found', 404);
    }

    return NextResponse.json({ message: 'User broker deleted successfully' }, { headers: responseHeaders });
  } catch (error: any) {
    console.error(`Error in DELETE /api/user-brokers/${params.id}:`, error);
    return createErrorResponse(error.message || 'An unexpected error occurred');
  }
} 