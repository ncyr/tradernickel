/**
 * Test API
 * 
 * This API provides a simple endpoint for testing the API server.
 * 
 * GET /api/test - Test the API server
 * 
 * Response includes:
 * - message: A message indicating the endpoint is working
 * - timestamp: The current timestamp
 * - headers: The request headers
 */

import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  console.log('GET request for test endpoint');
  
  try {
    // Return a simple response
    return Response.json({ 
      message: 'Test endpoint is working',
      timestamp: new Date().toISOString(),
      headers: Object.fromEntries(request.headers.entries()),
    });
  } catch (error: any) {
    console.error('Error in test endpoint:', error);
    
    return Response.json({
      error: {
        message: error.message || 'An unexpected error occurred',
        stack: error.stack,
      }
    }, { status: 500 });
  }
} 