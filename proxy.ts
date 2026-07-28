import { auth } from '@/auth';
import { NextResponse } from 'next/server';
import { PRIVATE_ROUTES } from './lib/routes';

import type { NextRequest } from 'next/server';

export default async function middleware(req: NextRequest) {
  const rawHostname = req.headers.get('host') || '';
  const hostname = rawHostname.split(':')[0]; // Strip port for local testing

  const isMainDomain =
    hostname === 'portfoliofy.me' || hostname === 'www.portfoliofy.me';
  const isVercelDomain = hostname.endsWith('.vercel.app');
  const isLocalhost = hostname === 'localhost';
  const isSubdomain =
    (hostname.endsWith('.portfoliofy.me') || hostname.endsWith('.localhost')) &&
    !isMainDomain &&
    !isLocalhost;

  let res = NextResponse.next();

  if (isSubdomain) {
    // Treat subdomains like username.portfoliofy.me as user profiles
    if (!req.nextUrl.pathname.startsWith('/api/')) {
      const subdomain = hostname
        .replace('.portfoliofy.me', '')
        .replace('.localhost', '');
      const url = req.nextUrl.clone();
      url.pathname = `/${subdomain}${url.pathname === '/' ? '' : url.pathname}`;
      res = NextResponse.rewrite(url);
    }
  } else if (!isMainDomain && !isVercelDomain && !isLocalhost) {
    // If this is a custom domain (e.g. abaan.lol), rewrite to /[domain]
    if (!req.nextUrl.pathname.startsWith('/api/')) {
      const url = req.nextUrl.clone();
      url.pathname = `/${hostname}${url.pathname === '/' ? '' : url.pathname}`;
      res = NextResponse.rewrite(url);
    }
  } else {
    // Run NextAuth middleware for normal requests
    const authMiddleware = auth((req) => {
      // Always allow NextAuth's own API routes and the public explore route
      if (
        req.nextUrl.pathname.startsWith('/api/auth') ||
        req.nextUrl.pathname.startsWith('/api/explore')
      ) {
        return;
      }

      const isPrivateRoute = PRIVATE_ROUTES.some((route) =>
        req.nextUrl.pathname.startsWith(`/${route}`),
      );

      if (isPrivateRoute && !req.auth) {
        // Redirect unauthenticated users to home — auth dialog triggers there
        return NextResponse.redirect(new URL('/', req.nextUrl));
      }
    });

    const authRes = await (authMiddleware as any)(req, undefined);
    if (authRes) res = authRes;
  }

  // ── Static security headers ──────────────────────────────────────────────
  res.headers.set('X-Frame-Options', 'DENY');
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()',
  );

  const csp = [
    `default-src 'self'`,
    `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://*.vercel-insights.com https://vercel.live`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data: blob: https://api.dicebear.com https://lh3.googleusercontent.com https://*.amazonaws.com https://*.s3.amazonaws.com https://cdn.jsdelivr.net https://*.cloudfront.net`,
    `font-src 'self' data:`,
    `connect-src 'self' https://accounts.google.com https://*.vercel-insights.com https://*.amazonaws.com https://*.s3.amazonaws.com`,
    `frame-src https://accounts.google.com`,
    `frame-ancestors 'none'`,
    `base-uri 'self'`,
    `form-action 'self' https://accounts.google.com`,
    `object-src 'none'`,
  ].join('; ');

  res.headers.set('Content-Security-Policy-Report-Only', csp);

  return res;
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
