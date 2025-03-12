import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import jwt from 'jsonwebtoken';
import api from '@/services/api/index';
import { JWT_SECRET } from '@/lib/constants';

// Helper function to check authentication
const checkAuth = (headers: Headers) => {
  try {
    const authHeader = headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { verified: false, error: 'Missing or invalid token' };
    }

    const token = authHeader.split(' ')[1];
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      return { verified: true, user: decoded };
    } catch (jwtError: any) {
      if (jwtError.name === 'TokenExpiredError') {
        return { 
          verified: false, 
          error: 'Token expired', 
          code: 'TOKEN_EXPIRED' 
        };
      }
      return { verified: false, error: jwtError.message };
    }
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

// Mock data for bot plans - keeping as fallback
const MOCK_BOT_PLANS = [
  {
    id: 1,
    bot_id: 1,
    plan_id: 1,
    bot_name: 'ES Futures Bot',
    plan_name: 'ES Scalping Strategy',
    owner_username: 'trader1',
    owner_id: 1,
    metadata: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 2,
    bot_id: 2,
    plan_id: 2,
    bot_name: 'NQ Futures Bot',
    plan_name: 'NQ Trend Following',
    owner_username: 'trader1',
    owner_id: 1,
    metadata: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 3,
    bot_id: 3,
    plan_id: 3,
    bot_name: 'CL Futures Bot',
    plan_name: 'CL Breakout Strategy',
    owner_username: 'trader2',
    owner_id: 2,
    metadata: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Function to fetch and join bot plans data
async function fetchAndJoinBotPlansData() {
  try {
    console.log('Trying to fetch from /v1/bot_plans endpoint...');
    
    // Fetch bot plans
    const botPlansResponse = await api.get('/v1/bot_plans');
    console.log('API Response:', { 
      status: botPlansResponse.status, 
      url: botPlansResponse.config.url,
      method: botPlansResponse.config.method
    });
    
    const botPlans = botPlansResponse.data;
    
    if (!botPlans || !Array.isArray(botPlans) || botPlans.length === 0) {
      console.log('No bot plans found, using mock data');
      return MOCK_BOT_PLANS;
    }
    
    // If bot plans already have names, return them directly
    if (botPlans[0].bot_name && botPlans[0].plan_name) {
      console.log(`Fetched ${botPlans.length} bot plans from dedicated endpoint`);
      return botPlans;
    }
    
    // Otherwise, fetch additional data to join
    // Fetch bots
    const botsResponse = await api.get('/v1/bots');
    const bots = botsResponse.data;
    const botsMap = new Map(bots.map((bot: any) => [bot.id, bot]));
    
    // Fetch plans
    const plansResponse = await api.get('/v1/plans');
    const plans = plansResponse.data;
    const plansMap = new Map(plans.map((plan: any) => [plan.id, plan]));
    
    // Fetch users if available
    let usersMap = new Map();
    try {
      const usersResponse = await api.get('/v1/users');
      const users = usersResponse.data;
      usersMap = new Map(users.map((user: any) => [user.id, user]));
    } catch (error) {
      console.warn('Could not fetch users, owner information will be limited');
    }
    
    // Join the data
    const botPlansWithNames = botPlans.map((botPlan: any) => {
      const bot: { id?: number; name?: string; owner_id?: number } = botsMap.get(parseInt(botPlan.bot_id)) || {};
      const plan: { id?: number; name?: string } = plansMap.get(parseInt(botPlan.plan_id)) || {};
      const owner: { id?: number; username?: string } = usersMap.get(bot.owner_id || 0) || {};
      
      return {
        ...botPlan,
        bot_name: bot.name || 'Unknown Bot',
        plan_name: plan.name || 'Unknown Plan',
        owner_id: bot.owner_id,
        owner_username: owner.username || 'Unknown User'
      };
    });
    
    console.log(`Joined ${botPlansWithNames.length} bot plans with names`);
    return botPlansWithNames;
  } catch (error) {
    console.error('Error joining bot plans data:', error);
    throw error;
  }
}

export async function GET() {
  try {
    const headersList = headers();
    const auth = checkAuth(headersList);
    
    if (!auth.verified) {
      return NextResponse.json(
        { 
          error: auth.error || 'Authentication required',
          code: auth.code
        },
        { status: 401 }
      );
    }

    // Forward the auth header to the API
    forwardAuthHeader(headersList);
    
    try {
      console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);
      const botPlansWithNames = await fetchAndJoinBotPlansData();
      
      console.log(`Fetched ${botPlansWithNames.length} bot plans from backend API`);
      return NextResponse.json(botPlansWithNames);
    } catch (error: any) {
      console.error('Error fetching from backend API:', error);
      console.log('Using mock data for bot plans with names');
      return NextResponse.json(MOCK_BOT_PLANS);
    }
  } catch (error: any) {
    console.error('Error fetching bot plans with names:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch bot plans' },
      { status: 500 }
    );
  }
} 