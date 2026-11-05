import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import sql from '@/lib/server/db';
import { consumeLoginToken, resolveEmailUserId } from '@/lib/server/emailAuth';

// A Google user's id is Google's account id, unless an account with the same
// verified email already exists (e.g. created through an email link). Then
// they are one person and keep the existing id.
async function resolveGoogleUserId(
  googleId: string,
  email?: string | null,
  emailVerified?: boolean,
): Promise<string> {
  const [byId] = await sql`SELECT id FROM users WHERE id = ${googleId}`;
  if (byId || !email || !emailVerified) return googleId;

  const [byEmail] = await sql`
    SELECT id FROM users WHERE lower(email) = ${email.toLowerCase()} LIMIT 1
  `;
  return byEmail ? (byEmail.id as string) : googleId;
}

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      username?: string | null;
    };
  }
}

export const { handlers, auth } = NextAuth({
  trustHost: true, // Required for Netlify / Vercel / reverse proxies
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    // Magic link: /verify-login passes the emailed token, checked here.
    Credentials({
      id: 'email-link',
      credentials: { token: {} },
      async authorize(credentials) {
        const email = await consumeLoginToken(String(credentials?.token ?? ''));
        if (!email) return null;
        return { id: await resolveEmailUserId(email), email };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Refresh Google profile fields for existing users. New users have no row
      // until they claim a username. custom_image is never touched.
      if (account?.provider === 'google' && account.providerAccountId) {
        try {
          const userId = await resolveGoogleUserId(
            account.providerAccountId,
            user.email,
            profile?.email_verified === true,
          );
          await sql`
            UPDATE users 
            SET name = COALESCE(${user.name ?? null}, name),
                email = COALESCE(${user.email ?? null}, email),
                image = COALESCE(${user.image ?? null}, image)
            WHERE id = ${userId}
          `;
        } catch (err) {
          console.error('Failed to store user profile in Postgres:', err);
        }
      }
      return true;
    },
    async jwt({ token, account, user, profile }) {
      // `account` is only present on the sign-in itself.
      if (account) {
        token.userId =
          account.provider === 'google' ? account.providerAccountId : user?.id;
        try {
          if (account.provider === 'google') {
            token.userId = await resolveGoogleUserId(
              account.providerAccountId,
              user?.email,
              profile?.email_verified === true,
            );
          }
          const userRecords =
            await sql`SELECT username FROM users WHERE id = ${token.userId as string}`;
          if (userRecords.length > 0) {
            token.username = userRecords[0].username;
          }
        } catch (e) {
          console.error('Error fetching username for JWT:', e);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token.userId) {
        session.user.id = token.userId as string;
      }
      if (token.username) {
        session.user.username = token.username as string;
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
