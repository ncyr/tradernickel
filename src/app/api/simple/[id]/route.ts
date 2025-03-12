/**
 * Simple API with Dynamic Route
 * 
 * This API provides a very simple endpoint for testing dynamic routes.
 * 
 * GET /api/simple/:id - Test dynamic routes with a simple response
 * 
 * Response includes:
 * - id: The ID from the URL
 */

export async function GET(request: Request, { params }: { params: { id: string } }) {
  return Response.json({ id: params.id });
} 