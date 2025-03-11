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

export async function GET() {
  try {
    const authHeader = checkAuth();
    forwardAuthHeader(authHeader);
    
    // Directly use the v1 endpoint
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api-local.tradernickel.com'}/v1/bots`, {
      headers: {
        'Authorization': authHeader
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch bots: ${response.statusText}`);
    }
    
    const bots = await response.json();
    return NextResponse.json(bots);
  } catch (error: any) {
    console.error('Error fetching bots:', error);
    return NextResponse.json(
      { error: error.response?.data?.error || error.message || 'Failed to fetch bots' },
      { status: error.response?.status || 401 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const authHeader = checkAuth();
    forwardAuthHeader(authHeader);
    
    const data = await request.json();
    
    // Directly use the v1 endpoint
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api-local.tradernickel.com'}/v1/bots`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create bot: ${response.statusText}`);
    }
    
    const bot = await response.json();
    return NextResponse.json(bot);
  } catch (error: any) {
    console.error('Error creating bot:', error);
    return NextResponse.json(
      { error: error.response?.data?.error || error.message || 'Failed to create bot' },
      { status: error.response?.status || 401 }
    );
  }
} 