// Magic-link sign-in: single-use, short-lived tokens stored hashed in Postgres.

import { createHash, randomBytes } from 'node:crypto';
import sql from '@/lib/server/db';

export { isValidEmail, normalizeEmail } from '@/lib/validation/email';

export const LOGIN_TOKEN_TTL_MS = 15 * 60 * 1000;

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/** Creates a token for an already-normalized email and returns the raw value. */
export async function createLoginToken(email: string): Promise<string> {
  const token = randomBytes(32).toString('base64url');
  const expiresAt = new Date(Date.now() + LOGIN_TOKEN_TTL_MS);

  await sql`
    INSERT INTO login_tokens (token_hash, email, expires_at)
    VALUES (${hashToken(token)}, ${email}, ${expiresAt})
  `;
  // Expired rows are useless; sweep them here instead of needing a cron.
  await sql`DELETE FROM login_tokens WHERE expires_at < now() - interval '1 day'`;

  return token;
}

/**
 * Marks the token used and returns its email, or null if it is unknown,
 * expired or already used. The single UPDATE makes it safe against two
 * requests racing with the same link.
 */
export async function consumeLoginToken(token: string): Promise<string | null> {
  if (!token) return null;

  const rows = await sql`
    UPDATE login_tokens
    SET used_at = now()
    WHERE token_hash = ${hashToken(token)}
      AND used_at IS NULL
      AND expires_at > now()
    RETURNING email
  `;
  return rows.length > 0 ? (rows[0].email as string) : null;
}

/**
 * The user id for an email: the existing account's id (so a Google user and
 * an email user with the same address are one person), otherwise a stable id
 * derived from the email so repeat sign-ins before claiming a username agree.
 */
export async function resolveEmailUserId(email: string): Promise<string> {
  const rows =
    await sql`SELECT id FROM users WHERE lower(email) = ${email} LIMIT 1`;
  if (rows.length > 0) return rows[0].id as string;

  return `email_${createHash('sha256').update(email).digest('hex').slice(0, 32)}`;
}

/** `next` is a path from safeNextPath, for sign-ins that began in an AI app. */
export function buildLoginLink(
  origin: string,
  token: string,
  next?: string | null,
): string {
  const link = `${origin}/verify-login?token=${encodeURIComponent(token)}`;
  return next ? `${link}&next=${encodeURIComponent(next)}` : link;
}

/**
 * Sends the link through Resend when RESEND_API_KEY is set. Without a key it
 * is logged to the terminal in development, so the flow works with no domain.
 */
export async function sendLoginEmail(
  email: string,
  link: string,
  mode: 'login' | 'signup',
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`\n[email-auth] Sign-in link for ${email}:\n${link}\n`);
      return;
    }
    throw new Error('RESEND_API_KEY is not configured');
  }

  const action = mode === 'signup' ? 'create your profile' : 'log in';
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Your Portfoliofy login link',
      text: `Open this link to ${action} on Portfoliofy:\n\n${link}\n\nIt expires in 15 minutes and only works once. If you didn't ask for it, you can ignore this email.`,
    }),
  });

  if (!res.ok) {
    throw new Error(`Resend responded with ${res.status}`);
  }
}
