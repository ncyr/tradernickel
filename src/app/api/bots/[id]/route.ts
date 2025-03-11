import { NextResponse } from 'next/server';
import { botService } from '@/services/api/bots';
import { headers } from 'next/headers';

// Helper function to check auth header
const checkAuth = () => {
  const headersList = headers();
  const authHeader = headersList.get('Authorization');
  
  if (!authHeader) {
    throw new Error('No authorization header');
  }
  
  return authHeader;
};

// Helper function to forward auth header to service
const forwardAuthHeader = (authHeader: string) => {
  botService.setAuthHeader(authHeader);
};

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = checkAuth();
    forwardAuthHeader(authHeader);
    
    // Directly use the v1 endpoint
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api-local.tradernickel.com'}/v1/bots/${params.id}`, {
      headers: {
        'Authorization': authHeader
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch bot: ${response.statusText}`);
    }
    
    const bot = await response.json();
    return NextResponse.json(bot);
  } catch (error: any) {
    console.error('Error fetching bot:', error);
    return NextResponse.json(
      { error: error.response?.data?.error || error.message || 'Failed to fetch bot' },
      { status: error.response?.status || 401 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = checkAuth();
    forwardAuthHeader(authHeader);
    
    const data = await request.json();
    
    // Directly use the v1 endpoint
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api-local.tradernickel.com'}/v1/bots/${params.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update bot: ${response.statusText}`);
    }
    
    const bot = await response.json();
    return NextResponse.json(bot);
  } catch (error: any) {
    console.error('Error updating bot:', error);
    return NextResponse.json(
      { error: error.response?.data?.error || error.message || 'Failed to update bot' },
      { status: error.response?.status || 401 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = checkAuth();
    forwardAuthHeader(authHeader);
    
    // Directly use the v1 endpoint
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api-local.tradernickel.com'}/v1/bots/${params.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': authHeader
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete bot: ${response.statusText}`);
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting bot:', error);
    return NextResponse.json(
      { error: error.response?.data?.error || error.message || 'Failed to delete bot' },
      { status: error.response?.status || 401 }
    );
  }
} 