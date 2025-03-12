import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { botsService, CreateBotDto } from '@/services/bots';

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
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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

// GET /api/bots - Get all bots for the authenticated user
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const auth = verifyAuth(request);
    if (!auth.verified) {
      return createErrorResponse(auth.error || 'Authentication failed', 401);
    }

    // Get user ID from token
    const userId = auth.user?.sub || '123456'; // Default to '123456' for testing

    // Get all bots for the user
    const bots = await botsService.getByUserId(userId);

    return NextResponse.json(bots, { headers: responseHeaders });
  } catch (error: any) {
    console.error('Error in GET /api/bots:', error);
    return createErrorResponse(error.message || 'An unexpected error occurred');
  }
}

// POST /api/bots - Create a new bot
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const auth = verifyAuth(request);
    if (!auth.verified) {
      return createErrorResponse(auth.error || 'Authentication failed', 401);
    }

    // Get user ID from token
    const userId = auth.user?.sub || '123456'; // Default to '123456' for testing

    // Parse request body
    const data = await request.json();
    
    // Validate required fields
    if (!data.name) {
      return createErrorResponse('Name is required', 400);
    }
    if (!data.plan_id) {
      return createErrorResponse('Plan ID is required', 400);
    }

    // Create bot DTO
    const botDto: CreateBotDto = {
      name: data.name,
      plan_id: data.plan_id,
    };

    try {
      // Create the bot
      const bot = await botsService.create(botDto, userId);
      
      // Return the created bot
      return NextResponse.json(bot, { 
        status: 201, 
        headers: responseHeaders 
      });
    } catch (error: any) {
      return createErrorResponse(error.message || 'Failed to create bot', 400);
    }
  } catch (error: any) {
    console.error('Error in POST /api/bots:', error);
    return createErrorResponse(error.message || 'An unexpected error occurred');
  }
} 