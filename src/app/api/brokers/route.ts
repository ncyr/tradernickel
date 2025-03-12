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

// Mock brokers data
const MOCK_BROKERS = [
  {
    id: 1,
    name: 'Tradovate',
    description: 'Tradovate broker integration',
    active: true,
    demo_url: 'https://demo.tradovate.com',
    prod_url: 'https://live.tradovate.com',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 2,
    name: 'Interactive Brokers',
    description: 'Interactive Brokers integration',
    active: true,
    demo_url: 'https://demo.interactivebrokers.com',
    prod_url: 'https://live.interactivebrokers.com',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 3,
    name: 'TD Ameritrade',
    description: 'TD Ameritrade integration',
    active: false,
    demo_url: 'https://demo.tdameritrade.com',
    prod_url: 'https://live.tdameritrade.com',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Handle OPTIONS requests for CORS
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: responseHeaders,
  });
}

// GET /api/brokers - Get all brokers
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const auth = verifyAuth(request);
    if (!auth.verified) {
      return createErrorResponse(auth.error || 'Authentication failed', 401);
    }

    // Return mock data
    return NextResponse.json(MOCK_BROKERS, { headers: responseHeaders });
  } catch (error: any) {
    console.error('Error in GET /api/brokers:', error);
    return createErrorResponse(error.message || 'An unexpected error occurred');
  }
}

// POST /api/brokers - Create a new broker
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const auth = verifyAuth(request);
    if (!auth.verified) {
      return createErrorResponse(auth.error || 'Authentication failed', 401);
    }

    // Check if user is admin
    const user = auth.user as any;
    if (user.role !== 'admin') {
      return createErrorResponse('Only administrators can create brokers', 403);
    }

    // Parse request body
    const data = await request.json();
    
    // Validate required fields
    if (!data.name) {
      return createErrorResponse('Name is required', 400);
    }

    // Create mock broker
    const newBroker = {
      id: Math.floor(Math.random() * 1000) + 4,
      name: data.name,
      description: data.description || '',
      active: data.active !== undefined ? data.active : true,
      demo_url: data.demo_url || '',
      prod_url: data.prod_url || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return NextResponse.json(newBroker, { 
      status: 201,
      headers: responseHeaders 
    });
  } catch (error: any) {
    console.error('Error in POST /api/brokers:', error);
    return createErrorResponse(error.message || 'An unexpected error occurred');
  }
}

// PUT /api/brokers/:id - Update a broker
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verify authentication
    const auth = verifyAuth(request);
    if (!auth.verified) {
      return createErrorResponse(auth.error || 'Authentication failed', 401);
    }

    // Check if user is admin
    const user = auth.user as any;
    if (user.role !== 'admin') {
      return createErrorResponse('Only administrators can update brokers', 403);
    }

    // Get broker ID from URL
    const id = request.url.split('/').pop();
    if (!id) {
      return createErrorResponse('Broker ID is required', 400);
    }

    // Parse request body
    const data = await request.json();

    // Mock update response
    const updatedBroker = {
      id: parseInt(id),
      name: data.name || 'Updated Broker',
      description: data.description || '',
      active: data.active !== undefined ? data.active : true,
      demo_url: data.demo_url || '',
      prod_url: data.prod_url || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return NextResponse.json(updatedBroker, { headers: responseHeaders });
  } catch (error: any) {
    console.error('Error in PUT /api/brokers/:id:', error);
    return createErrorResponse(error.message || 'An unexpected error occurred');
  }
}

// DELETE /api/brokers/:id - Delete a broker
export async function DELETE(request: NextRequest) {
  try {
    // Verify authentication
    const auth = verifyAuth(request);
    if (!auth.verified) {
      return createErrorResponse(auth.error || 'Authentication failed', 401);
    }

    // Check if user is admin
    const user = auth.user as any;
    if (user.role !== 'admin') {
      return createErrorResponse('Only administrators can delete brokers', 403);
    }

    // Get broker ID from URL
    const id = request.url.split('/').pop();
    if (!id) {
      return createErrorResponse('Broker ID is required', 400);
    }

    // Mock successful deletion
    return new Response(null, { 
      status: 204,
      headers: responseHeaders 
    });
  } catch (error: any) {
    console.error('Error in DELETE /api/brokers/:id:', error);
    return createErrorResponse(error.message || 'An unexpected error occurred');
  }
} 