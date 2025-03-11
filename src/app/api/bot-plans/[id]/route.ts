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

    forwardAuthHeader(headersList);

    const response = await api.get(`/v1/bot-plans/${params.id}`);
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error fetching bot plan:', error);
    const status = error.response?.status || 500;
    const message = error.response?.data?.error || error.message || 'Failed to fetch bot plan';
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PATCH(
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

    forwardAuthHeader(headersList);

    const data = await request.json();
    const response = await api.patch(`/v1/bot-plans/${params.id}`, data);
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error updating bot plan:', error);
    const status = error.response?.status || 500;
    const message = error.response?.data?.error || error.message || 'Failed to update bot plan';
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

    forwardAuthHeader(headersList);

    await api.delete(`/v1/bot-plans/${params.id}`);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting bot plan:', error);
    const status = error.response?.status || 500;
    const message = error.response?.data?.error || error.message || 'Failed to delete bot plan';
    return NextResponse.json({ error: message }, { status });
  }
} 