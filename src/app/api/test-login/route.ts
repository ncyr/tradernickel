import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    console.log('API URL:', apiUrl);

    const response = await fetch(`${apiUrl}/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'testuser',
        password: 'testpassword',
      }),
    });

    const data = await response.json();
    return NextResponse.json({ 
      success: true, 
      apiUrl,
      status: response.status,
      data,
    });
  } catch (error: any) {
    console.error('Test login error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
} 