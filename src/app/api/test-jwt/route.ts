/**
 * Test JWT API
 * 
 * This API provides an endpoint for testing JWT verification.
 * 
 * GET /api/test-jwt - Test JWT verification
 * 
 * This endpoint requires JWT authentication via the Authorization header.
 * Example: Authorization: Bearer <token>
 * 
 * Response includes:
 * - message: A message indicating the endpoint
 * - timestamp: The current timestamp
 * - authHeaderPresent: Whether the Authorization header is present
 * - tokenPresent: Whether the token is present
 * - secretPresent: Whether the JWT_SECRET is present
 * - secretLength: The length of the JWT_SECRET
 * - nodeEnv: The NODE_ENV environment variable
 * - tokenVerified: Whether the token was successfully verified
 * - decoded: The decoded token payload (if verification was successful)
 * - error: The error details (if verification failed)
 */

import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

interface JWTPayload {
  sub?: string;
  userId?: string;
  iat?: number;
}

export async function GET(request: NextRequest) {
  console.log('GET request for test-jwt endpoint');
  
  try {
    const authHeader = request.headers.get('authorization');
    console.log('Auth header:', authHeader);
    const token = authHeader?.split(' ')[1];
    console.log('Token:', token ? `${token.substring(0, 20)}...` : 'not found');
    
    // Check if JWT_SECRET is available in environment variables
    const secret = process.env.JWT_SECRET;
    console.log('JWT secret available:', !!secret);
    console.log('JWT secret length:', secret?.length || 0);
    console.log('NODE_ENV:', process.env.NODE_ENV);
    
    // List all environment variables (for debugging)
    console.log('Environment variables:', Object.keys(process.env).join(', '));

    // Basic info without verifying token
    const info = {
      message: 'Test JWT endpoint',
      timestamp: new Date().toISOString(),
      authHeaderPresent: !!authHeader,
      tokenPresent: !!token,
      secretPresent: !!secret,
      secretLength: secret?.length || 0,
      nodeEnv: process.env.NODE_ENV,
    };
    
    // Attempt to verify the token if both token and secret are present
    if (token && secret) {
      try {
        console.log('Attempting to verify token with secret length:', secret.length);
        const decoded = jwt.verify(token, secret, { algorithms: ['HS256'] }) as JWTPayload;
        console.log('Token decoded successfully:', decoded);
        
        // Return the info with the decoded token
        return Response.json({
          ...info,
          tokenVerified: true,
          decoded
        });
      } catch (jwtError: any) {
        console.error('JWT verification error:', {
          name: jwtError.name,
          message: jwtError.message,
          stack: jwtError.stack
        });
        
        // Return the info with the verification error
        return Response.json({
          ...info,
          tokenVerified: false,
          error: {
            name: jwtError.name,
            message: jwtError.message
          }
        });
      }
    }
    
    // Return the basic info if token or secret is missing
    return Response.json(info);
  } catch (error: any) {
    console.error('Error in test-jwt endpoint:', error);
    
    return Response.json({
      error: {
        message: error.message || 'An unexpected error occurred',
        stack: error.stack,
      }
    }, { status: 500 });
  }
} 