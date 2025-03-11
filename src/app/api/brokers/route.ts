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

export async function GET() {
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

    const brokers = await brokerService.getBrokers();
    return NextResponse.json(brokers);
  } catch (error: any) {
    console.error('Error fetching brokers:', error);
    const status = error.response?.status || 500;
    const message = error.response?.data?.error || error.message || 'Failed to fetch brokers';
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

    // Forward the auth header to the broker service
    forwardAuthHeader(headersList);

    const data = await request.json();
    
    // Validate required fields
    if (!data.name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }
    if (!data.demo_url) {
      return NextResponse.json(
        { error: 'Demo URL is required' },
        { status: 400 }
      );
    }
    if (!data.prod_url) {
      return NextResponse.json(
        { error: 'Production URL is required' },
        { status: 400 }
      );
    }

    const broker = await brokerService.createBroker(data);
    return NextResponse.json(broker);
  } catch (error: any) {
    console.error('Error creating broker:', error);
    const status = error.response?.status || 500;
    const message = error.response?.data?.error || error.message || 'Failed to create broker';
    return NextResponse.json({ error: message }, { status });
  }
} 