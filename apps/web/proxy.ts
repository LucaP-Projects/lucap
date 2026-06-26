import { NextRequest, NextResponse } from "next/server";
import { auth } from './lib/auth';

const protectedRoutes = [
  '/profile',
  '/dashboard',
  '/admin',
  '/invoices',
  '/customers',
  '/settings'
];
const publicRoutes = ['/auth/login', '/auth/register', '/auth/forgot-password', '/auth/reset-password', '/error'];


export async function proxy(request: NextRequest) {
  const { nextUrl } = request;
  const pathname = nextUrl.pathname;

  // Skip middleware for static files
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('favicon.ico') ||
    pathname.includes('robots.txt') ||
    pathname.includes('manifest.json') ||
    pathname.includes('/icons/') ||
    pathname.includes('/avatars/')
  ) {
    return NextResponse.next();
  }

  // Get session
  const session = await auth.api.getSession({headers: request.headers});
  const isLoggedIn = !!session;

  // Remove language prefix for route checking
  const pathWithoutLang = pathname.replace(/^\/[a-z]{2}/, '') || '/';

  const normalizeToCompanyPath = (companySlug: string) => {
    if (pathWithoutLang === '/') {
      return `/${companySlug}/dashboard`;
    }

    if (pathWithoutLang.startsWith(`/${companySlug}/`) || pathWithoutLang === `/${companySlug}`) {
      return null;
    }

    return `/${companySlug}${pathWithoutLang}`;
  };

  // Check if current route is protected
  const isOnProtectedRoute = protectedRoutes.some((route) =>
    pathWithoutLang.startsWith(route)
  );

  // Check if current route is auth/login related
  const isOnAuthRoute = publicRoutes.some((route) =>
    pathWithoutLang.startsWith(route)
  );

  // Redirect to login if accessing protected route without session
  if (isOnProtectedRoute && !isLoggedIn) {
    const loginUrl = new URL(`/auth/login`, request.url);
    loginUrl.searchParams.set('callbackUrl', encodeURI(pathWithoutLang));
    return NextResponse.redirect(loginUrl);
  }

  // Redirect to dashboard if accessing auth routes while logged in
  if (isOnAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL(`/`, request.url));
  }
  
  if (pathWithoutLang === '/' ) {
    if (isLoggedIn) {
      if (session.user.activeCompanyId) {
        return NextResponse.redirect(new URL(`/${session.user.activeCompany?.slug}/dashboard`, request.url));
      } else {
        return NextResponse.redirect(new URL(`/select-company`, request.url));
      }
    } else {
      return NextResponse.redirect(new URL(`/auth/login`, request.url));
    }
  }

  if (isLoggedIn) {
    if (!session.user.activeCompany?.slug) {
      if (!isOnAuthRoute && pathWithoutLang !== '/select-company' && pathWithoutLang !== '/create-company') {
        return NextResponse.redirect(new URL(`/select-company`, request.url));
      }
    } else if (!isOnAuthRoute) {
      const companyPath = normalizeToCompanyPath(session.user.activeCompany?.slug);

      if (companyPath) {
        return NextResponse.redirect(new URL(companyPath, request.url));
      }
    }
  }

  // Add security headers to response
  const response = NextResponse.next();
  const securityHeaders = {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Content-Security-Policy':
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
  };

  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

export const config = {
  matcher: ['/:path*'],
};