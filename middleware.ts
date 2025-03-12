import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Helper function to check if a route is public
const isPublicRoute = (pathname: string) => {
  return (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/public') ||
    pathname === '/' ||
    pathname === '/login' ||
    pathname === '/register' ||
    pathname.startsWith('/api/auth') ||
    pathname === '/favicon.ico' ||
    pathname.includes('.') || // Allow static files
    pathname.startsWith('/charts') // Allow charts page
  );
};

// Helper function to check if a route requires authentication
const requiresAuth = (pathname: string) => {
  return (
    pathname.startsWith('/dashboard') ||
    (pathname.startsWith('/api') && !pathname.startsWith('/api/auth') && !pathname.startsWith('/api/market-data'))
  );
};

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  console.log('Middleware: Processing request for path:', pathname);

  // Allow public routes
  if (isPublicRoute(pathname)) {
    console.log('Middleware: Public route, allowing access');
    return NextResponse.next();
  }

  // Check authentication for protected routes
  if (requiresAuth(pathname)) {
    const authHeader = request.headers.get('Authorization');
    console.log('Middleware: Protected route, checking auth header:', !!authHeader);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Middleware: No valid auth header, redirecting');
      
      // For API routes, return 401
      if (pathname.startsWith('/api')) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }
      
      // For other routes, redirect to login
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('from', pathname);
      return NextResponse.redirect(url);
    }
  }

  // Allow all other routes
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