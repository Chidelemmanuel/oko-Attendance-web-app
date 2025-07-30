import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJwt } from './lib/utils';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const { pathname } = request.nextUrl;

  const publicPaths = ['/', '/auth/student/login', '/auth/student/signup', '/auth/lecturer/login', '/auth/lecturer/signup'];
  const isPublicPath = publicPaths.includes(pathname);

  // If the user is logged in
  if (token) {
    const decodedToken = await verifyJwt(token);
    // If the token is valid and they are trying to access a public page (like login), redirect to dashboard
    if (decodedToken && isPublicPath) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    // If the token is invalid, clear it and redirect to home
    if (!decodedToken && !isPublicPath) {
        const response = NextResponse.redirect(new URL('/', request.url));
        response.cookies.delete('auth_token');
        return response;
    }

     // Role-based access control for logged-in users
    if(decodedToken && typeof decodedToken.role === 'string') {
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
    }


  } else {
    // If there's no token and they are trying to access a protected page, redirect to home
    if (!isPublicPath) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
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
