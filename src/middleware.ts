import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJwt } from './lib/utils';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const { pathname } = request.nextUrl;

  const publicPaths = ['/', '/auth/student/login', '/auth/student/signup', '/auth/lecturer/login', '/auth/lecturer/signup'];

  // If the path is public, let them through
  if (publicPaths.includes(pathname)) {
    // If they are logged in and try to access a public auth page, redirect to dashboard
    if (token) {
        const decodedToken = await verifyJwt(token);
        if (decodedToken) {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
    }
    return NextResponse.next();
  }

  // If there's no token and the path is not public, redirect to the main portal page
  if (!token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Verify the token for protected routes
  try {
    const decodedToken = await verifyJwt(token);
    if (!decodedToken || typeof decodedToken.role !== 'string') {
        // Invalid token, redirect to login
        const response = NextResponse.redirect(new URL('/', request.url));
        response.cookies.delete('auth_token');
        return response;
    }
    
    // Role-based access control
    const { role } = decodedToken;
    
    if (pathname.startsWith('/lecturer') && role !== 'lecturer') {
         return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    if (pathname.startsWith('/attendance/submit') && role !== 'student') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    
    if (pathname.startsWith('/students') && role !== 'lecturer') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    
    if (pathname.startsWith('/tools') && role !== 'lecturer') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();

  } catch (error) {
    // Error verifying token, clear it and redirect to login
    console.error("Middleware token verification error:", error);
    const response = NextResponse.redirect(new URL('/', request.url));
    response.cookies.delete('auth_token');
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
