import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { brokerService } from '@/services/api/brokers';

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
    brokerService.setAuthHeader(authHeader);
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

    // Forward the auth header to the broker service
    forwardAuthHeader(headersList);

    const broker = await brokerService.getBroker(params.id);
    return NextResponse.json(broker);
  } catch (error: any) {
    console.error('Error fetching broker:', error);
    const status = error.response?.status || 500;
    const message = error.response?.data?.error || error.message || 'Failed to fetch broker';
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

    // Forward the auth header to the broker service
    forwardAuthHeader(headersList);

    const data = await request.json();
    
    // Validate required fields if they are present
    if (data.name === '') {
      return NextResponse.json(
        { error: 'Name cannot be empty' },
        { status: 400 }
      );
    }
    if (data.demo_url === '') {
      return NextResponse.json(
        { error: 'Demo URL cannot be empty' },
        { status: 400 }
      );
    }
    if (data.prod_url === '') {
      return NextResponse.json(
        { error: 'Production URL cannot be empty' },
        { status: 400 }
      );
    }

    const broker = await brokerService.updateBroker(params.id, data);
    return NextResponse.json(broker);
  } catch (error: any) {
    console.error('Error updating broker:', error);
    const status = error.response?.status || 500;
    const message = error.response?.data?.error || error.message || 'Failed to update broker';
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

    // Forward the auth header to the broker service
    forwardAuthHeader(headersList);

    await brokerService.deleteBroker(params.id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting broker:', error);
    const status = error.response?.status || 500;
    const message = error.response?.data?.error || error.message || 'Failed to delete broker';
    return NextResponse.json({ error: message }, { status });
  }
} 