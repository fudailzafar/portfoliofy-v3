import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { upstashRedis } from '@/lib/server/redis';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true, // Required for Netlify / Vercel / reverse proxies
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async signIn({ user, account }) {
      // Persist Google profile to Redis on every sign-in (keeps it fresh)
      // IMPORTANT: we MERGE into the existing key so that a user-uploaded
      // customImage is never wiped when they sign back in.
      if (account?.provider === 'google' && account.providerAccountId) {
        try {
          const existing = await upstashRedis.get<Record<string, any>>(
            `user:profile:${account.providerAccountId}`,
          );
          await upstashRedis.set(`user:profile:${account.providerAccountId}`, {
            ...existing,              // preserve customImage and any other fields
            name: user.name ?? null,
            email: user.email ?? null,
            image: user.image ?? null, // Google OAuth photo (fallback)
          });
        } catch (err) {
          console.error('Failed to store user profile in Redis:', err);
          // Don't block sign-in if Redis write fails
        }
      }
      return true;
    },
    async jwt({ token, account }) {
      // On first sign-in, embed Google's stable `sub` as our userId
      if (account?.provider === 'google') {
        token.userId = account.providerAccountId;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.userId) {
        session.user.id = token.userId as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // After Google sign-in, route through our post-login handler
      if (url === baseUrl || url === `${baseUrl}/`) {
        return `${baseUrl}/auth/post-login`;
      }
      return url.startsWith(baseUrl) ? url : baseUrl;
    },
  },
  pages: {
    signIn: '/', // Keep users on the home page; auth is triggered via dialog
  },
});
