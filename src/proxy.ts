import { NextResponse, type NextRequest } from 'next/server';

export async function proxy(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value;

  // 1. If not logged in and NOT on auth pages, redirect to /login
  if (!token && !req.nextUrl.pathname.startsWith('/login')) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('redirectedFrom', req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. If logged in and on /login, redirect to Dashboard
  if (token && req.nextUrl.pathname === '/login') {
    return NextResponse.redirect(new URL('/', req.url));
  }

  const res = NextResponse.next();

  // Security headers
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('X-Frame-Options', 'DENY');
  res.headers.set('X-XSS-Protection', '1; mode=block');

  return res;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
