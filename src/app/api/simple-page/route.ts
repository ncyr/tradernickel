/**
 * Simple Page API
 * 
 * This API provides a very simple endpoint for testing the API server.
 * 
 * GET /api/simple-page - Test the API server with a simple response
 * 
 * Response includes:
 * - message: A message indicating the endpoint
 */

export async function GET() {
  return Response.json({ message: 'Simple page route' });
} 