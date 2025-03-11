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

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    const tradeLog = await tradeLogService.getTradeLogById(parseInt(params.id));
    return NextResponse.json(tradeLog);
  } catch (error: any) {
    console.error('Error fetching trade log:', error);
    const status = error.response?.status || 500;
    const message = error.response?.data?.error || error.message || 'Failed to fetch trade log';
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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
    const tradeLog = await tradeLogService.updateTradeLog(parseInt(params.id), data);
    return NextResponse.json(tradeLog);
  } catch (error: any) {
    console.error('Error updating trade log:', error);
    const status = error.response?.status || 500;
    const message = error.response?.data?.error || error.message || 'Failed to update trade log';
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    await tradeLogService.deleteTradeLog(parseInt(params.id));
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting trade log:', error);
    const status = error.response?.status || 500;
    const message = error.response?.data?.error || error.message || 'Failed to delete trade log';
    return NextResponse.json({ error: message }, { status });
  }
} 