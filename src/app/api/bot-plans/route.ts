import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import api from '@/services/api/index';

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
    api.defaults.headers.common.Authorization = authHeader;
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

    // Forward the auth header to the backend
    forwardAuthHeader(headersList);

    const response = await api.get('/v1/bot-plans');
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error fetching bot plans:', error);
    const status = error.response?.status || 500;
    const message = error.response?.data?.error || error.message || 'Failed to fetch bot plans';
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

    // Forward the auth header to the backend
    forwardAuthHeader(headersList);

    const data = await request.json();
    const response = await api.post('/v1/bot-plans', data);
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error creating bot plan:', error);
    const status = error.response?.status || 500;
    const message = error.response?.data?.error || error.message || 'Failed to create bot plan';
    return NextResponse.json({ error: message }, { status });
  }
} 