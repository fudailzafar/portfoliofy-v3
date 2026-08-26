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

  // Exclude Vercel's own deployment preview URLs (e.g. portfoliofy-v3-fudail.portfoliofy.me,
  // portfoliofy-v3-git-main-fudail.portfoliofy.me). These contain hyphens and the project
  // name — they are NOT user subdomains. We detect them by checking for the project name
  // prefix or by matching the VERCEL_URL env var that Vercel injects automatically.
  const vercelUrl = process.env.VERCEL_URL || ''; // e.g. portfoliofy-v3-fudail.vercel.app
  const vercelBranchUrl = process.env.VERCEL_BRANCH_URL || '';
  const vercelProjectName = process.env.VERCEL_PROJECT_PRODUCTION_URL || '';
  const isVercelDeploymentDomain =
    (vercelUrl && hostname === vercelUrl.split(':')[0]) ||
    (vercelBranchUrl && hostname === vercelBranchUrl.split(':')[0]) ||
    (vercelProjectName && hostname === vercelProjectName.split(':')[0]);

  const isSubdomain =
    (hostname.endsWith('.portfoliofy.me') || hostname.endsWith('.localhost')) &&
    !isMainDomain &&
    !isLocalhost &&
    !isVercelDeploymentDomain;

  let res = NextResponse.next();

  // sitemap.ts/robots.ts live at the root and read the Host header themselves
  // to scope their output per-domain — rewriting them into /{subdomain}/... or
  // /{domain}/... below would send them through the [username]/[slug] route
  // instead (404, since no such slug exists), so every hostname must reach
  // these two routes unrewritten.
  const isMetadataRoute =
    req.nextUrl.pathname === '/robots.txt' ||
    req.nextUrl.pathname === '/sitemap.xml';

  if (isSubdomain) {
    // Treat subdomains like username.portfoliofy.me as user profiles
    if (!req.nextUrl.pathname.startsWith('/api/') && !isMetadataRoute) {
      const subdomain = hostname
        .replace('.portfoliofy.me', '')
        .replace('.localhost', '');
      const url = req.nextUrl.clone();
      url.pathname = `/${subdomain}${url.pathname === '/' ? '' : url.pathname}`;
      res = NextResponse.rewrite(url);
    }
  } else if (!isMainDomain && !isVercelDomain && !isLocalhost) {
    // If this is a custom domain (e.g. abaan.lol), rewrite to /[domain]
    if (!req.nextUrl.pathname.startsWith('/api/') && !isMetadataRoute) {
      const url = req.nextUrl.clone();
      url.pathname = `/${hostname}${url.pathname === '/' ? '' : url.pathname}`;
      res = NextResponse.rewrite(url);
    }
  } else {
    // Run NextAuth middleware for normal requests
    const authMiddleware = auth((req) => {
      // Always allow NextAuth's own API routes and routes the public,
      // logged-out profile view depends on: /api/explore (the explore feed)
      // and /api/collaborators/info (collaborator avatars rendered on any
      // public profile via AvatarStack/useLiveCollaborators — blocking this
      // silently breaks that feature for every anonymous visitor).
      if (
        req.nextUrl.pathname.startsWith('/api/auth') ||
        req.nextUrl.pathname.startsWith('/api/explore') ||
        req.nextUrl.pathname.startsWith('/api/collaborators/info')
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

  // Next.js injects inline hydration scripts, and framer-motion writes inline
  // styles, so 'unsafe-inline' is still required for both. 'unsafe-eval' is
  // only needed by dev-mode HMR/React Refresh and is dropped in production.
  // Removing 'unsafe-inline' from script-src requires nonce plumbing through
  // the NextAuth middleware branch below — tracked as follow-up work.
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
    `font-src 'self' data:`,
    `connect-src 'self' https://accounts.google.com https://*.vercel-insights.com https://*.amazonaws.com https://*.s3.amazonaws.com https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com`,
    `frame-src https://accounts.google.com`,
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
