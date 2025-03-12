import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { botsService, UpdateBotDto } from '@/services/bots';

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
  'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
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

// GET /api/bots/[id] - Get a specific bot
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

    // Get the bot
    const bot = await botsService.getById(params.id);
    
    // Check if the bot exists
    if (!bot) {
      return createErrorResponse('Bot not found', 404);
    }
    
    // Check if the bot belongs to the user
    if (bot.user_id !== userId) {
      return createErrorResponse('Unauthorized access to this bot', 403);
    }

    return NextResponse.json(bot, { headers: responseHeaders });
  } catch (error: any) {
    console.error(`Error in GET /api/bots/${params.id}:`, error);
    return createErrorResponse(error.message || 'An unexpected error occurred');
  }
}

// PUT /api/bots/[id] - Update a bot
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

    // Get user ID from token
    const userId = auth.user?.sub || '123456'; // Default to '123456' for testing

    // Get the bot first to check ownership
    const existingBot = await botsService.getById(params.id);
    
    // Check if the bot exists
    if (!existingBot) {
      return createErrorResponse('Bot not found', 404);
    }
    
    // Check if the bot belongs to the user
    if (existingBot.user_id !== userId) {
      return createErrorResponse('Unauthorized access to this bot', 403);
    }

    // Parse request body
    const data = await request.json();
    
    // Create update DTO
    const updateDto: UpdateBotDto = {};
    if (data.name) updateDto.name = data.name;
    if (data.plan_id) updateDto.plan_id = data.plan_id;

    // Update the bot
    const updatedBot = await botsService.update(params.id, updateDto);
    
    if (!updatedBot) {
      return createErrorResponse('Failed to update bot', 500);
    }

    return NextResponse.json(updatedBot, { headers: responseHeaders });
  } catch (error: any) {
    console.error(`Error in PUT /api/bots/${params.id}:`, error);
    return createErrorResponse(error.message || 'An unexpected error occurred');
  }
}

// DELETE /api/bots/[id] - Delete a bot
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

    // Get the bot first to check ownership
    const bot = await botsService.getById(params.id);
    
    // Check if the bot exists
    if (!bot) {
      return createErrorResponse('Bot not found', 404);
    }
    
    // Check if the bot belongs to the user
    if (bot.user_id !== userId) {
      return createErrorResponse('Unauthorized access to this bot', 403);
    }

    // Delete the bot
    const success = await botsService.delete(params.id);
    
    if (!success) {
      return createErrorResponse('Failed to delete bot', 500);
    }

    return NextResponse.json({ message: 'Bot deleted successfully' }, { headers: responseHeaders });
  } catch (error: any) {
    console.error(`Error in DELETE /api/bots/${params.id}:`, error);
    return createErrorResponse(error.message || 'An unexpected error occurred');
  }
} 