import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { tradeService } from '@/services/api/trades';

// Helper function to check authentication
const checkAuth = (headers: Headers) => {
  const authHeader = headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  return true;
};

// Helper function to forward auth header
const forwardAuthHeader = (headers: Headers) => {
  const authHeader = headers.get('Authorization');
  if (authHeader) {
    tradeService.setAuthHeader(authHeader);
  }
};

export async function GET() {
  try {
    const headersList = headers();
    if (!checkAuth(headersList)) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Forward the auth header to the service
    forwardAuthHeader(headersList);

    const trades = await tradeService.getTrades();
    return NextResponse.json(trades);
  } catch (error: any) {
    console.error('Error fetching trades:', error);
    const status = error.response?.status || 500;
    const message = error.response?.data?.error || error.message || 'Failed to fetch trades';
    return NextResponse.json({ error: message }, { status });
  }
} 