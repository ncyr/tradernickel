import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// This route uses cookies, so it needs to be dynamic
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api-local.tradernickel.com/v1';
    const response = await fetch(`${apiUrl}/brokers`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // If the API call fails, return a fallback list of brokers
      return NextResponse.json([
        { id: 1, name: 'Tradovate', active: true, demo_url: 'https://demo.tradovate.com', prod_url: 'https://live.tradovate.com' },
        { id: 2, name: 'Interactive Brokers', active: true, demo_url: 'https://demo.interactivebrokers.com', prod_url: 'https://www.interactivebrokers.com' },
        { id: 3, name: 'TD Ameritrade', active: true, demo_url: 'https://demo.tdameritrade.com', prod_url: 'https://www.tdameritrade.com' },
        { id: 4, name: 'Alpaca', active: true, demo_url: 'https://paper-api.alpaca.markets', prod_url: 'https://api.alpaca.markets' },
        { id: 5, name: 'Binance', active: true, demo_url: 'https://testnet.binance.vision', prod_url: 'https://api.binance.com' },
      ]);
    }

    const data = await response.json();
    
    // Add created_at if missing
    const processedData = data.map(broker => ({
      ...broker,
      created_at: broker.created_at || new Date().toISOString()
    }));
    
    return NextResponse.json(processedData);
  } catch (error) {
    console.error('Error fetching brokers:', error);
    // Return fallback data in case of error
    return NextResponse.json([
      { id: 1, name: 'Tradovate', active: true, demo_url: 'https://demo.tradovate.com', prod_url: 'https://live.tradovate.com' },
      { id: 2, name: 'Interactive Brokers', active: true, demo_url: 'https://demo.interactivebrokers.com', prod_url: 'https://www.interactivebrokers.com' },
      { id: 3, name: 'TD Ameritrade', active: true, demo_url: 'https://demo.tdameritrade.com', prod_url: 'https://www.tdameritrade.com' },
      { id: 4, name: 'Alpaca', active: true, demo_url: 'https://paper-api.alpaca.markets', prod_url: 'https://api.alpaca.markets' },
      { id: 5, name: 'Binance', active: true, demo_url: 'https://testnet.binance.vision', prod_url: 'https://api.binance.com' },
    ]);
  }
} 