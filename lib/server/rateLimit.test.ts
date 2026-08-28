import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('checkRateLimit', () => {
  const originalUrl = process.env.UPSTASH_REDIS_REST_URL;
  const originalToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  beforeEach(() => {
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    vi.resetModules();
  });

  afterEach(() => {
    if (originalUrl === undefined) delete process.env.UPSTASH_REDIS_REST_URL;
    else process.env.UPSTASH_REDIS_REST_URL = originalUrl;
    if (originalToken === undefined)
      delete process.env.UPSTASH_REDIS_REST_TOKEN;
    else process.env.UPSTASH_REDIS_REST_TOKEN = originalToken;
  });

  it('fails open (allows the request) when Upstash credentials are not configured', async () => {
    const { checkRateLimit } = await import('./rateLimit');
    const result = await checkRateLimit('test-key', 1, 1000);
    expect(result.allowed).toBe(true);
    expect(result.retryAfterMs).toBe(0);
  });

  it('keeps failing open across repeated calls, not just the first', async () => {
    const { checkRateLimit } = await import('./rateLimit');
    for (let i = 0; i < 5; i++) {
      const result = await checkRateLimit('test-key-repeat', 1, 1000);
      expect(result.allowed).toBe(true);
    }
  });
});

describe('getClientIp', () => {
  it('reads the first address from x-forwarded-for', async () => {
    const { getClientIp } = await import('./rateLimit');
    const req = new Request('http://localhost', {
      headers: { 'x-forwarded-for': '203.0.113.5, 70.41.3.18' },
    });
    expect(getClientIp(req)).toBe('203.0.113.5');
  });

  it('falls back to "unknown" when the header is missing', async () => {
    const { getClientIp } = await import('./rateLimit');
    const req = new Request('http://localhost');
    expect(getClientIp(req)).toBe('unknown');
  });
});
