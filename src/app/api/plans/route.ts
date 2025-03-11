import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { planService } from '@/services/api/plans';

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
    planService.setAuthHeader(authHeader);
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

    const plans = await planService.getPlans();
    return NextResponse.json(plans);
  } catch (error: any) {
    console.error('Error fetching plans:', error);
    const status = error.response?.status || 500;
    const message = error.response?.data?.error || error.message || 'Failed to fetch plans';
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
    const plan = await planService.createPlan(data);
    return NextResponse.json(plan);
  } catch (error: any) {
    console.error('Error creating plan:', error);
    const status = error.response?.status || 500;
    const message = error.response?.data?.error || error.message || 'Failed to create plan';
    return NextResponse.json({ error: message }, { status });
  }
} 