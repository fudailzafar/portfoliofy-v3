import crypto from 'crypto';
import { headers } from 'next/headers';

// A lightweight, cookie-free visitor fingerprint for page-view dedup — a
// one-way hash of IP + user-agent, never the raw values. Not identity-grade
// (network switches or shared IPs can shift it), just enough to stop the
// same visitor's repeat loads within a day from inflating Insights counts.
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
