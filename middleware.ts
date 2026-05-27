import { auth } from '@/auth';
import { NextResponse } from 'next/server';
import { PRIVATE_ROUTES } from './lib/routes';

export default auth(async (req) => {
  const rawHostname = req.headers.get('host') || '';
  const hostname = rawHostname.split(':')[0]; // Strip port for local testing
  
  // Exclude localhost and default Vercel domains
  if (
    hostname &&
    !hostname.includes('localhost') &&
    !hostname.includes('portfoliofy.me') &&
    !hostname.includes('.vercel.app')
  ) {
    // It's a custom domain, rewrite to the user's profile
    try {
      // Direct REST call to Upstash to avoid Edge compatibility issues
      const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
      const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;
      
      if (upstashUrl && upstashToken) {
        // 1. Get userId by domain
        const domainRes = await fetch(`${upstashUrl}/get/domain:to:user:${hostname}`, {
          headers: { Authorization: `Bearer ${upstashToken}` },
        });
        const domainData = await domainRes.json();
        const userId = domainData.result;
        
        if (userId) {
          // 2. Get username by userId
          const userRes = await fetch(`${upstashUrl}/get/user:id:${userId}`, {
            headers: { Authorization: `Bearer ${upstashToken}` },
          });
          const userData = await userRes.json();
          const username = userData.result;
          
          if (username) {
            // Rewrite the request to `/[username]` internally
            const clonedUrl = req.nextUrl.clone();
            clonedUrl.pathname = `/${username}${clonedUrl.pathname === '/' ? '' : clonedUrl.pathname}`;
            return NextResponse.rewrite(clonedUrl);
          }
        }
      }
    } catch (error) {
      console.error('Middleware custom domain error:', error);
    }
  }

  // Always allow NextAuth's own API routes — never block /api/auth/*
  if (req.nextUrl.pathname.startsWith('/api/auth')) {
    return;
  }

  const isPrivateRoute = PRIVATE_ROUTES.some((route) =>
    req.nextUrl.pathname.startsWith(`/${route}`)
  );

  if (isPrivateRoute && !req.auth) {
    // Redirect unauthenticated users to home — auth dialog triggers there
    return NextResponse.redirect(new URL('/', req.nextUrl));
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
