/**
 * User Brokers Query API
 * 
 * This API provides endpoints for managing user brokers using query parameters.
 * 
 * GET /api/user-brokers-query - Get all user brokers
 * GET /api/user-brokers-query?id=1 - Get a specific user broker
 * 
 * All endpoints require JWT authentication via the Authorization header.
 * Example: Authorization: Bearer <token>
 * 
 * Error responses include detailed information about the error.
 */

import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

interface JWTPayload {
  sub?: string;
  name?: string;
  iat?: number;
  exp?: number;
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  
  console.log('GET request for broker ID:', id);
  
  try {
    const authHeader = request.headers.get('authorization');
    console.log('Auth header:', authHeader);
    const token = authHeader?.split(' ')[1];
    console.log('Token:', token ? `${token.substring(0, 20)}...` : 'not found');
    
    // Check if JWT_SECRET is available in environment variables
    const secret = process.env.JWT_SECRET;
    console.log('JWT secret available:', !!secret);
    console.log('JWT secret length:', secret?.length || 0);
    
    if (!token || !secret) {
      return Response.json({
        error: {
          type: 'AuthError',
          message: 'Missing token or secret',
          details: { token: !!token, secret: !!secret }
        }
      }, { status: 401 });
    }
    
    try {
      console.log('Attempting to verify token with secret length:', secret.length);
      const decoded = jwt.verify(token, secret, { algorithms: ['HS256'] }) as JWTPayload;
      console.log('Token decoded successfully:', decoded);
      
      if (!id) {
        // Return all brokers if no ID is provided
        const userBrokers = [
          {
            id: '1',
            name: 'Tradovate',
            api_key: '********',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ];
        
        return Response.json(userBrokers);
      } else {
        // Return a specific broker if ID is provided
        const userBroker = {
          id,
          name: 'Tradovate',
          api_key: '********',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        
        return Response.json(userBroker);
      }
    } catch (jwtError: any) {
      console.error('JWT verification error:', {
        name: jwtError.name,
        message: jwtError.message,
        stack: jwtError.stack
      });
      
      return Response.json({
        error: {
          type: 'JWTVerificationError',
          message: jwtError.message,
          details: {
            name: jwtError.name
          }
        }
      }, { status: 401 });
    }
  } catch (error: any) {
    console.error('Unexpected error in GET function:', error);
    
    return Response.json({
      error: {
        type: 'UnexpectedError',
        message: error.message || 'An unexpected error occurred',
        details: {
          errorMessage: error.message,
          stack: error.stack,
        }
      }
    }, { status: 500 });
  }
} 