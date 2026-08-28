/**
 * A rate limiter for expensive or abuse-prone actions (AI resume parsing,
 * custom-domain connect/disconnect, username claims, uploads, resume
 * saves). Backed by Upstash Redis so counts are shared across every
 * serverless instance — a per-instance in-memory counter doesn't actually
 * cap anything on Vercel, since concurrent requests land on different
 * instances that each keep their own memory.
 *
 * Fails open: if UPSTASH_REDIS_REST_URL/TOKEN aren't set (e.g. local dev
 * before Redis is provisioned) or a Redis call itself errors, requests are
 * allowed through rather than blocking real users on an infra hiccup.
 */

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

let redis: Redis | null | undefined;

function getRedis(): Redis | null {
  if (redis !== undefined) return redis;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  redis = url && token ? new Redis({ url, token }) : null;
  return redis;
}

const limiters = new Map<string, Ratelimit>();

function getLimiter(maxRequests: number, windowMs: number): Ratelimit | null {
  const client = getRedis();
  if (!client) return null;

  const cacheKey = `${maxRequests}:${windowMs}`;
  let limiter = limiters.get(cacheKey);
  if (!limiter) {
    limiter = new Ratelimit({
      redis: client,
      limiter: Ratelimit.slidingWindow(maxRequests, `${windowMs} ms`),
      prefix: 'ratelimit',
    });
    limiters.set(cacheKey, limiter);
  }
  return limiter;
}

export async function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number,
): Promise<{ allowed: boolean; retryAfterMs: number }> {
  const limiter = getLimiter(maxRequests, windowMs);
  if (!limiter) {
    return { allowed: true, retryAfterMs: 0 };
  }

  try {
    const { success, reset } = await limiter.limit(key);
    return { allowed: success, retryAfterMs: Math.max(0, reset - Date.now()) };
  } catch (error) {
    console.warn('Rate limit check failed, allowing request through:', error);
    return { allowed: true, retryAfterMs: 0 };
  }
}

/** Best-effort client IP, for rate-limiting routes with no session to key by. */
export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  return forwardedFor?.split(',')[0]?.trim() || 'unknown';
}
