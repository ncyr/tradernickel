import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { tradeLogService } from '@/services/api/tradeLogs';

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
    tradeLogService.setAuthHeader(authHeader);
  }
};

export async function GET(request: Request) {
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

    // Get query parameters
    const url = new URL(request.url);
    const params = {
      start_date: url.searchParams.get('start_date') || undefined,
      end_date: url.searchParams.get('end_date') || undefined,
      bot_name: url.searchParams.get('bot_name') || undefined,
    };

    const stats = await tradeLogService.getTradeLogStats(params);
    return NextResponse.json(stats);
  } catch (error: any) {
    console.error('Error fetching trade log stats:', error);
    const status = error.response?.status || 500;
    const message = error.response?.data?.error || error.message || 'Failed to fetch trade log stats';
    return NextResponse.json({ error: message }, { status });
  }
} 