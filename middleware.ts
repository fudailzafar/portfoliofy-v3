import { auth } from '@/auth';
import { NextResponse } from 'next/server';
import { PRIVATE_ROUTES } from './lib/routes';
import { upstashRedis } from '@/lib/server/redis';

import type { NextRequest } from 'next/server';

export default async function middleware(req: NextRequest) {
  const rawHostname = req.headers.get('host') || '';
  const hostname = rawHostname.split(':')[0]; // Strip port for local testing

  const isMainDomain =
    hostname === 'portfoliofy.me' || hostname === 'www.portfoliofy.me';
  const isVercelDomain = hostname.endsWith('.vercel.app');
  const isLocalhost = hostname.includes('localhost');

  // Exclude localhost, main domain, and default Vercel domains
  if (hostname && !isLocalhost && !isMainDomain && !isVercelDomain) {
    // It's a custom domain, rewrite to the user's profile
    try {
      // 1. Get userId by domain
      const userId = await upstashRedis.get<string>(
        `domain:to:user:${hostname}`,
      );

      if (userId) {
        // 2. Get username by userId
        const username = await upstashRedis.get<string>(`user:id:${userId}`);

        if (username) {
          // Rewrite the request to `/[username]` internally
          const clonedUrl = req.nextUrl.clone();
          clonedUrl.pathname = `/${username}${clonedUrl.pathname === '/' ? '' : clonedUrl.pathname}`;
          return NextResponse.rewrite(clonedUrl);
        }
      }
    } catch (error) {
      console.error('Middleware custom domain error:', error);
    }
  }

  // Run NextAuth middleware for normal requests
  const authMiddleware = auth((req) => {
    // Always allow NextAuth's own API routes — never block /api/auth/*
    if (req.nextUrl.pathname.startsWith('/api/auth')) {
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

  return (authMiddleware as any)(req, undefined);
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
