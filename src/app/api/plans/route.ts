import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import jwt from 'jsonwebtoken';
import api from '@/services/api/index';

// Helper function to check authentication
const checkAuth = (headers: Headers) => {
  try {
    const authHeader = headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { verified: false, error: 'Missing or invalid token' };
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return { verified: false, error: 'Missing JWT secret' };
    }

    const decoded = jwt.verify(token, secret);
    return { verified: true, user: decoded };
  } catch (error: any) {
    return { verified: false, error: error.message };
  }
};

// Helper function to forward auth header
const forwardAuthHeader = (headers: Headers) => {
  const authHeader = headers.get('Authorization');
  if (authHeader) {
    api.defaults.headers.common.Authorization = authHeader;
  }
};

// Mock data for plans
const MOCK_PLANS = [
  {
    id: 1,
    name: 'ES Scalping Strategy',
    description: 'Short-term scalping strategy for ES futures',
    symbol: 'ESH4',
    active: true,
    owner_id: 1,
    owner_username: 'trader1',
    broker_id: 1,
    reverse_position_threshold: 0.5,
    cancel_trade_in_progress: true,
    only_action: 'both',
    trailing_threshold_percentage: 0.1,
    trade_same_direction: true,
    metadata: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 2,
    name: 'NQ Trend Following',
    description: 'Medium-term trend following strategy for NQ futures',
    symbol: 'NQH4',
    active: true,
    owner_id: 1,
    owner_username: 'trader1',
    broker_id: 2,
    reverse_position_threshold: 1.0,
    cancel_trade_in_progress: false,
    only_action: 'both',
    trailing_threshold_percentage: 0.2,
    trade_same_direction: false,
    metadata: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 3,
    name: 'CL Breakout Strategy',
    description: 'Breakout strategy for Crude Oil futures',
    symbol: 'CLJ4',
    active: false,
    owner_id: 2,
    owner_username: 'trader2',
    broker_id: 1,
    reverse_position_threshold: 0.75,
    cancel_trade_in_progress: true,
    only_action: 'buy',
    trailing_threshold_percentage: 0.15,
    trade_same_direction: true,
    metadata: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export async function GET() {
  try {
    const headersList = headers();
    const auth = checkAuth(headersList);
    
    if (!auth.verified) {
      return NextResponse.json(
        { error: auth.error || 'Authentication required' },
        { status: 401 }
      );
    }

    // Forward the auth header to the API
    forwardAuthHeader(headersList);
    
    try {
      console.log('Fetching data from backend API...');
      const response = await api.get('/v1/plans');
      const plans = response.data;
      
      if (plans.length === 0) {
        console.log('No plans found in backend, using mock data');
        return NextResponse.json(MOCK_PLANS);
      }
      
      console.log(`Fetched ${plans.length} plans from backend API`);
      return NextResponse.json(plans);
    } catch (error: any) {
      console.error('Error fetching from backend API:', error);
      console.log('Falling back to mock data for plans');
      return NextResponse.json(MOCK_PLANS);
    }
  } catch (error: any) {
    console.error('Error fetching plans:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch plans' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const headersList = headers();
    const auth = checkAuth(headersList);
    
    if (!auth.verified) {
      return NextResponse.json(
        { error: auth.error || 'Authentication required' },
        { status: 401 }
      );
    }

    const data = await request.json();
    
    // Validate required fields
    if (!data.name || !data.symbol) {
      return NextResponse.json(
        { error: 'Name and symbol are required' },
        { status: 400 }
      );
    }

    // Create a mock response with the submitted data
    const newPlan = {
      id: MOCK_PLANS.length + 1,
      ...data,
      owner_id: 1,
      owner_username: 'trader1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return NextResponse.json(newPlan);
  } catch (error: any) {
    console.error('Error creating plan:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create plan' },
      { status: 500 }
    );
  }
} 