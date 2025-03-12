/**
 * Test ID API with Dynamic Route
 * 
 * This API provides an endpoint for testing dynamic routes with an ID parameter.
 * 
 * GET /api/test-id/:id - Test dynamic routes with an ID parameter
 * 
 * Response includes:
 * - message: A message indicating the endpoint
 * - id: The ID from the URL
 * - timestamp: The current timestamp
 * - authHeaderPresent: Whether the Authorization header is present
 * - tokenPresent: Whether the token is present
 */

import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

interface JWTPayload {
  sub?: string;
  name?: string;
  iat?: number;
  exp?: number;
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  console.log('GET request for test-id endpoint with ID:', params.id);
  
  try {
    const authHeader = request.headers.get('authorization');
    console.log('Auth header:', authHeader);
    const token = authHeader?.split(' ')[1];
    console.log('Token:', token ? `${token.substring(0, 20)}...` : 'not found');
    
    // Basic info without verifying token
    const info = {
      message: 'Test ID endpoint',
      id: params.id,
      timestamp: new Date().toISOString(),
      authHeaderPresent: !!authHeader,
      tokenPresent: !!token,
    };
    
    // Return the basic info
    return Response.json(info);
  } catch (error: any) {
    console.error('Error in test-id endpoint:', error);
    
    return Response.json({
      error: {
        message: error.message || 'An unexpected error occurred',
        stack: error.stack,
      }
    }, { status: 500 });
  }
} 