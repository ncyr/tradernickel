/**
 * Test Token API
 * 
 * This API provides an endpoint for generating a valid JWT token for testing purposes.
 * 
 * GET /api/test-token - Generate a valid JWT token
 * 
 * The token is signed with the JWT_SECRET from the environment variables.
 * The token has a 1-hour expiration time.
 * 
 * Response includes:
 * - message: A message indicating the token was generated
 * - token: The generated JWT token
 * - payload: The payload of the token
 */

import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  console.log('GET request for test-token endpoint');
  
  try {
    // Check if JWT_SECRET is available in environment variables
    const secret = process.env.JWT_SECRET;
    console.log('JWT secret available:', !!secret);
    console.log('JWT secret length:', secret?.length || 0);
    
    if (!secret) {
      return Response.json({
        error: 'JWT_SECRET is not available in environment variables'
      }, { status: 500 });
    }
    
    // Create a payload for the token
    const payload = {
      sub: '123456',
      name: 'Test User',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour expiration
    };
    
    // Sign the token with the secret
    const token = jwt.sign(payload, secret, { algorithm: 'HS256' });
    
    // Return the token
    return Response.json({
      message: 'Generated JWT token',
      token,
      payload
    });
  } catch (error: any) {
    console.error('Error in test-token endpoint:', error);
    
    return Response.json({
      error: {
        message: error.message || 'An unexpected error occurred',
        stack: error.stack,
      }
    }, { status: 500 });
  }
} 