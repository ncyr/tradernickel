import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

// Helper function to check authentication
const checkAuth = (headers: Headers) => {
  const authHeader = headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  return true;
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

    // For now, return mock data since we don't have a real endpoint
    const mockStats = {
      total_trades: 42,
      profit_today: 1250.75,
      profit_total: 8750.25,
      win_rate: 0.68,
      average_profit: 208.34,
      average_loss: 125.50,
      largest_win: 1500.00,
      largest_loss: 750.00,
      trades_today: 5,
      trades_this_week: 18,
      trades_this_month: 42
    };

    return NextResponse.json(mockStats);
  } catch (error: any) {
    console.error('Error fetching trade stats:', error);
    const status = error.response?.status || 500;
    const message = error.response?.data?.error || error.message || 'Failed to fetch trade stats';
    return NextResponse.json({ error: message }, { status });
  }
} 