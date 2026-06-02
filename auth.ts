import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import sql from '@/lib/server/db';

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
      // Persist Google profile to Postgres on every sign-in
      if (account?.provider === 'google' && account.providerAccountId) {
        try {
          // If user exists, update their Google info without touching custom_image
          // If they don't exist yet, we don't insert here because `claim` inserts them.
          // Wait, actually, if they don't exist, they can't be updated.
          // But what if they change their name/image on Google?
          await sql`
            UPDATE users 
            SET name = COALESCE(${user.name ?? null}, name),
                email = COALESCE(${user.email ?? null}, email),
                image = COALESCE(${user.image ?? null}, image)
            WHERE id = ${account.providerAccountId}
          `;
        } catch (err) {
          console.error('Failed to store user profile in Postgres:', err);
        }
      }
      return true;
    },
    async jwt({ token, account }) {
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
      if (url === baseUrl || url === `${baseUrl}/`) {
        return `${baseUrl}/auth/post-login`;
      }
      return url.startsWith(baseUrl) ? url : baseUrl;
    },
  },
  pages: {
    signIn: '/',
  },
});
