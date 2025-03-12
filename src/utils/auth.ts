import jwt from 'jsonwebtoken';

interface JWTPayload {
  sub?: string;
  userId?: string;
  iat?: number;
}

export async function checkAuth(headers: Headers): Promise<boolean> {
  try {
    console.log('Starting auth check...');
    const authHeader = headers.get('authorization');
    console.log('Auth header:', authHeader);
    if (!authHeader) {
      console.log('No auth header found');
      return false;
    }

    const token = authHeader.split(' ')[1];
    console.log('Token:', token ? token.substring(0, 20) + '...' : 'undefined');
    if (!token) {
      console.log('No token found in auth header');
      return false;
    }

    // Verify JWT token
    const secret = process.env.JWT_SECRET;
    console.log('JWT secret:', secret ? `${secret.substring(0, 10)}...` : '(not set)');
    if (!secret) {
      console.error('JWT_SECRET not configured in environment variables');
      return false;
    }

    try {
      console.log('Attempting to verify token...');
      const decoded = jwt.verify(token, secret, { algorithms: ['HS256'] }) as JWTPayload;
      console.log('Token decoded successfully:', {
        sub: decoded.sub,
        userId: decoded.userId,
        iat: decoded.iat,
      });
      return true;
    } catch (jwtError: any) {
      console.error('JWT verification failed:', {
        name: jwtError.name,
        message: jwtError.message,
        expiredAt: jwtError.expiredAt,
        stack: jwtError.stack,
      });
      return false;
    }
  } catch (error: any) {
    console.error('Auth check failed:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });
    return false;
  }
} 