import { auth } from '@/auth';
import { NextResponse } from 'next/server';
import { PRIVATE_ROUTES } from './lib/routes';
import { classifyHost } from './lib/site';

import type { NextRequest } from 'next/server';

export default async function middleware(req: NextRequest) {
  const host = classifyHost(req.headers.get('host'));

  let res = NextResponse.next();

  const isMetadataRoute =
    req.nextUrl.pathname === '/robots.txt' ||
    req.nextUrl.pathname === '/sitemap.xml' ||
    req.nextUrl.pathname === '/llms.txt';

  if (host.kind !== 'main') {
    // A user's subdomain or custom domain serves that user's profile:
    // rewrite to /[username] or /[domain] (the [username] route resolves both).
    if (!req.nextUrl.pathname.startsWith('/api/') && !isMetadataRoute) {
      const profileKey =
        host.kind === 'subdomain' ? host.username : host.hostname;
      const url = req.nextUrl.clone();
      url.pathname = `/${profileKey}${url.pathname === '/' ? '' : url.pathname}`;
      res = NextResponse.rewrite(url);
    }
  } else {
    // Run NextAuth middleware for normal requests
    const authMiddleware = auth((req) => {
      if (
        req.nextUrl.pathname.startsWith('/api/auth') ||
        req.nextUrl.pathname.startsWith('/api/explore') ||
        req.nextUrl.pathname.startsWith('/api/collaborators/info') ||
        // Has no session; the route checks CRON_SECRET itself.
        req.nextUrl.pathname.startsWith('/api/cron')
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

  const scriptSrc = [
    `'self'`,
    `'unsafe-inline'`,
    ...(process.env.NODE_ENV === 'development' ? [`'unsafe-eval'`] : []),
    'https://accounts.google.com',
    'https://*.vercel-insights.com',
    'https://va.vercel-scripts.com',
    'https://vercel.live',
    'https://www.googletagmanager.com',
  ].join(' ');

  const csp = [
    `default-src 'self'`,
    `script-src ${scriptSrc}`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data: blob: https://api.dicebear.com https://lh3.googleusercontent.com https://*.amazonaws.com https://*.s3.amazonaws.com https://cdn.jsdelivr.net https://*.cloudfront.net`,
    `media-src 'self' https://*.amazonaws.com https://*.s3.amazonaws.com https://*.cloudfront.net`,
    `font-src 'self' data:`,
    `connect-src 'self' https://accounts.google.com https://*.vercel-insights.com https://*.amazonaws.com https://*.s3.amazonaws.com https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com`,
    `frame-src https://accounts.google.com https://www.youtube.com https://player.vimeo.com https://www.figma.com`,
    `frame-ancestors 'none'`,
    `base-uri 'self'`,
    `form-action 'self' https://accounts.google.com`,
    `object-src 'none'`,
  ].join('; ');

  res.headers.set('Content-Security-Policy', csp);

  return res;
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
