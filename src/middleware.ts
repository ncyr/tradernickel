import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// List of public routes that don't require authentication
const publicRoutes = [
  '/login',
  '/register',
  '/forgot-password',
  '/api/auth/login',
  '/api/auth/register',
  '/',
  '/_next',
  '/static',
  '/favicon.ico',
  '/public'
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  console.log('Middleware: Processing request for path:', pathname);

  // Check if this is a public route
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  if (isPublicRoute) {
    console.log('Middleware: Public route, allowing access');
    return NextResponse.next();
  }

  // Check for authentication token
  const token = request.cookies.get('token');
  console.log('Middleware: Token present:', !!token);

  // If no token and trying to access protected route, redirect to login
  if (!token) {
    console.log('Middleware: No token found, redirecting to login');
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  console.log('Middleware: Token found, allowing access');
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}; 