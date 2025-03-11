import { NextResponse } from 'next/server';
import { botPlanService } from '@/services/api/botPlans';

export async function GET() {
  try {
    const botPlans = await botPlanService.getBotPlansWithNames();
    return NextResponse.json(botPlans);
  } catch (error: any) {
    console.error('Error fetching bot plans:', error);
    return NextResponse.json(
      { error: error.response?.data?.error || 'Failed to fetch bot plans' },
      { status: error.response?.status || 500 }
    );
  }
} 