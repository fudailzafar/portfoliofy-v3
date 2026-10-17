import crypto from 'crypto';
import { headers } from 'next/headers';

// Cookie-free visitor key for page-view dedup: a hash of IP + user-agent.
// Approximate by design; it only stops repeat loads inflating counts.
export async function getVisitorKey(): Promise<string | null> {
  const headersList = await headers();
  const forwardedFor = headersList.get('x-forwarded-for');
  const ip =
    forwardedFor?.split(',')[0]?.trim() || headersList.get('x-real-ip');
  const userAgent = headersList.get('user-agent');

  if (!ip && !userAgent) return null;

  return crypto
    .createHash('sha256')
    .update(`${ip || 'unknown'}:${userAgent || 'unknown'}`)
    .digest('hex')
    .slice(0, 32);
}
