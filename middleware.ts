import { auth } from '@/auth';
import { NextResponse } from 'next/server';
import { PRIVATE_ROUTES } from './lib/routes';

export default auth((req) => {
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
