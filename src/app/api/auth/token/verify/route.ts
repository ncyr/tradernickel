import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '@/lib/constants';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      return NextResponse.json({ 
        valid: true, 
        user: decoded,
        expiresAt: (decoded as any).exp * 1000 // Convert to milliseconds
      });
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        return NextResponse.json(
          { error: 'Token expired', code: 'TOKEN_EXPIRED', valid: false },
          { status: 401 }
        );
      }
      
      return NextResponse.json(
        { error: 'Invalid token', code: 'INVALID_TOKEN', valid: false },
        { status: 403 }
      );
    }
  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 