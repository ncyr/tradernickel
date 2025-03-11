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
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api-local.tradernickel.com'}/v1/bots/providers`, {
      headers: {
        'Authorization': authHeader
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch providers: ${response.statusText}`);
    }
    
    const providers = await response.json();
    return NextResponse.json(providers);
  } catch (error: any) {
    console.error('Error fetching providers:', error);
    return NextResponse.json(
      { error: error.response?.data?.error || error.message || 'Failed to fetch providers' },
      { status: error.response?.status || 401 }
    );
  }
} 