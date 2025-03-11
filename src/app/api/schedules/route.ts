import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { scheduleService } from '@/services/api/schedules';

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
    scheduleService.setAuthHeader(authHeader);
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

    const schedules = await scheduleService.getSchedules();
    return NextResponse.json(schedules);
  } catch (error: any) {
    console.error('Error fetching schedules:', error);
    const status = error.response?.status || 500;
    const message = error.response?.data?.error || error.message || 'Failed to fetch schedules';
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
    const schedule = await scheduleService.createSchedule(data);
    return NextResponse.json(schedule);
  } catch (error: any) {
    console.error('Error creating schedule:', error);
    const status = error.response?.status || 500;
    const message = error.response?.data?.error || error.message || 'Failed to create schedule';
    return NextResponse.json({ error: message }, { status });
  }
} 