import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // If user is authenticated (has a valid token)
  if (token && token.trim() !== '') {
    // Redirect authenticated users away from login page to dashboard
    if (pathname === '/login') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    // Allow access to dashboard and its subpages
    if (pathname.startsWith('/dashboard')) {
      return NextResponse.next();
    }
    // Redirect authenticated users from home to dashboard
    if (pathname === '/') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  } 
  // If user is not authenticated
  else {
    // Allow access to login page
    if (pathname === '/login') {
      return NextResponse.next();
    }
    
    // Redirect unauthenticated users to login
    if (pathname === '/' || pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/login', '/dashboard/:path*'],
};