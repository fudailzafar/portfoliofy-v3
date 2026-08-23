/**
 * A minimal in-memory rate limiter for expensive per-user actions (e.g. the
 * AI resume-parse endpoint, which pays for a Gemini API call per request).
 *
 * This is a best-effort, first-line mitigation, not a durable one: the
 * counters live in the serverless function's memory, so they reset on a cold
 * start and aren't shared across concurrent instances. That's an acceptable
 * tradeoff for "stop a single script from looping unbounded calls" without
 * adding new infrastructure (Redis, a DB table/migration) — if this endpoint
 * needs a hard, cross-instance guarantee later, move the counters to
 * Postgres or a durable store like Upstash.
 */

interface Bucket {
  count: number;
  windowStart: number;
}

const buckets = new Map<string, Bucket>();

export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number,
): { allowed: boolean; retryAfterMs: number } {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now - bucket.windowStart >= windowMs) {
    buckets.set(key, { count: 1, windowStart: now });
    return { allowed: true, retryAfterMs: 0 };
  }

  if (bucket.count >= maxRequests) {
    return {
      allowed: false,
      retryAfterMs: windowMs - (now - bucket.windowStart),
    };
  }

  bucket.count += 1;
  return { allowed: true, retryAfterMs: 0 };
}
