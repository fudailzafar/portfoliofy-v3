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
  const isLocalhost = hostname.includes('localhost');

  // If this is a custom domain, we check Supabase to find the username
  if (!isMainDomain && !isVercelDomain && !isLocalhost) {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

      if (supabaseUrl && supabaseKey) {
        // Query the Supabase REST API (Edge compatible)
        const res = await fetch(
          `${supabaseUrl}/rest/v1/users?custom_domain=eq.${hostname}&select=username`,
          {
            headers: {
              apikey: supabaseKey,
              Authorization: `Bearer ${supabaseKey}`,
            },
          },
        );

        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0 && data[0].username) {
            // Rewrite the request to the dynamic /[username] route
            return NextResponse.rewrite(
              new URL(`/${data[0].username}`, req.url),
            );
          }
        }
      }
    } catch (error) {
      console.error('Failed to lookup custom domain:', error);
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
