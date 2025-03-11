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
      page: url.searchParams.get('page') ? parseInt(url.searchParams.get('page')!) : 1,
      limit: url.searchParams.get('limit') ? parseInt(url.searchParams.get('limit')!) : 50,
      symbol: url.searchParams.get('symbol') || undefined,
      trade_type: url.searchParams.get('trade_type') || undefined,
      status: url.searchParams.get('status') || undefined,
      start_date: url.searchParams.get('start_date') || undefined,
      end_date: url.searchParams.get('end_date') || undefined,
      bot_name: url.searchParams.get('bot_name') || undefined,
      sort_by: url.searchParams.get('sort_by') || 'created_at',
      sort_order: (url.searchParams.get('sort_order') as 'asc' | 'desc') || 'desc'
    };

    const response = await tradeLogService.getTradeLogsByUser(params);
    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error fetching trade logs:', error);
    const status = error.response?.status || 500;
    const message = error.response?.data?.error || error.message || 'Failed to fetch trade logs';
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(request: Request) {
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

    const data = await request.json();
    const tradeLog = await tradeLogService.createTradeLog(data);
    return NextResponse.json(tradeLog);
  } catch (error: any) {
    console.error('Error creating trade log:', error);
    const status = error.response?.status || 500;
    const message = error.response?.data?.error || error.message || 'Failed to create trade log';
    return NextResponse.json({ error: message }, { status });
  }
} 