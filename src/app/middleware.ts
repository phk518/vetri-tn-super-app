// middleware.ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  let res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            req.cookies.set(name, value);
            res.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: { session }, error } = await supabase.auth.getSession();

  // 1. If not logged in and NOT on auth pages, redirect to /login
  if (!session && !req.nextUrl.pathname.startsWith('/login')) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('redirectedFrom', req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. If logged in and on /login, redirect to Dashboard
  if (session && req.nextUrl.pathname === '/login') {
    return NextResponse.redirect(new URL('/', req.url));
  }

  // 3. Refresh session if close to expiry
  if (session && !error) {
    const expiresAt = new Date(session.expires_at * 1000);
    const now = new Date();
    const fiveMinutes = 5 * 60 * 1000;

    if (expiresAt.getTime() - now.getTime() < fiveMinutes) {
      try {
        await supabase.auth.getSession();
        res = NextResponse.next({
          request: {
            headers: req.headers,
          },
        });
      } catch (error) {
        console.error('Session refresh failed:', error);
      }
    }
  }

  // Add security headers
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