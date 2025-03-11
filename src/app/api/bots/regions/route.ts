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
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api-local.tradernickel.com'}/v1/bots/regions`, {
      headers: {
        'Authorization': authHeader
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch regions: ${response.statusText}`);
    }
    
    const regions = await response.json();
    return NextResponse.json(regions);
  } catch (error: any) {
    console.error('Error fetching regions:', error);
    return NextResponse.json(
      { error: error.response?.data?.error || error.message || 'Failed to fetch regions' },
      { status: error.response?.status || 401 }
    );
  }
} 