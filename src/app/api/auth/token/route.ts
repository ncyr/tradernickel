import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// CORS headers for the API
const responseHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Handle OPTIONS requests for CORS
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: responseHeaders,
  });
}

// POST /api/auth/token - Generate a JWT token
export async function POST(request: NextRequest) {
  try {
    // Get the JWT secret from environment variables
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return NextResponse.json(
        { error: 'JWT secret not configured' },
        { status: 500, headers: responseHeaders }
      );
    }

    // Parse request body
    const body = await request.json();
    const { username, password } = body;

    // Simple validation - in a real app, you would validate against a database
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400, headers: responseHeaders }
      );
    }

    // In a real app, you would validate credentials against a database
    // For testing, we'll accept any username/password
    
    // Create a JWT token
    const token = jwt.sign(
      {
        id: 1,
        username: username,
        role: 'admin',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hour expiration
      },
      secret
    );

    return NextResponse.json(
      { token },
      { status: 200, headers: responseHeaders }
    );
  } catch (error: any) {
    console.error('Error generating token:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred' },
      { status: 500, headers: responseHeaders }
    );
  }
}

// GET /api/auth/token/verify - Verify a JWT token
export async function GET(request: NextRequest) {
  try {
    // Get the JWT secret from environment variables
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return NextResponse.json(
        { error: 'JWT secret not configured' },
        { status: 500, headers: responseHeaders }
      );
    }

    // Get the token from the Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid token format' },
        { status: 401, headers: responseHeaders }
      );
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return NextResponse.json(
        { error: 'Missing token' },
        { status: 401, headers: responseHeaders }
      );
    }

    try {
      // Verify the token
      const decoded = jwt.verify(token, secret);

      return NextResponse.json(
        { 
          verified: true, 
          user: decoded 
        },
        { status: 200, headers: responseHeaders }
      );
    } catch (jwtError: any) {
      console.error('JWT verification error:', jwtError);
      
      if (jwtError.name === 'TokenExpiredError') {
        return NextResponse.json(
          { 
            verified: false, 
            error: 'Token expired',
            code: 'TOKEN_EXPIRED'
          },
          { status: 401, headers: responseHeaders }
        );
      }
      
      return NextResponse.json(
        { 
          verified: false, 
          error: jwtError.message || 'Invalid token'
        },
        { status: 401, headers: responseHeaders }
      );
    }
  } catch (error: any) {
    console.error('Error verifying token:', error);
    return NextResponse.json(
      { 
        verified: false, 
        error: error.message || 'An unexpected error occurred' 
      },
      { status: 500, headers: responseHeaders }
    );
  }
} 