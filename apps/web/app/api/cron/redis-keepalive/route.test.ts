import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const { pingRedisMock } = vi.hoisted(() => ({ pingRedisMock: vi.fn() }));
vi.mock('@/lib/server/rateLimit', () => ({ pingRedis: pingRedisMock }));

import { GET } from './route';

function makeRequest(authorization?: string) {
  return new Request('http://localhost/api/cron/redis-keepalive', {
    headers: authorization ? { authorization } : {},
  });
}

describe('GET /api/cron/redis-keepalive', () => {
  const originalSecret = process.env.CRON_SECRET;

  beforeEach(() => {
    pingRedisMock.mockReset();
    process.env.CRON_SECRET = 'test-secret';
  });

  afterEach(() => {
    if (originalSecret === undefined) delete process.env.CRON_SECRET;
    else process.env.CRON_SECRET = originalSecret;
  });

  it('rejects requests without the secret and never pings Redis', async () => {
    const res = await GET(makeRequest());

    expect(res.status).toBe(401);
    expect(pingRedisMock).not.toHaveBeenCalled();
  });

  it('rejects a wrong secret', async () => {
    const res = await GET(makeRequest('Bearer wrong'));

    expect(res.status).toBe(401);
    expect(pingRedisMock).not.toHaveBeenCalled();
  });

  it('rejects everything when CRON_SECRET is not configured', async () => {
    delete process.env.CRON_SECRET;

    const res = await GET(makeRequest('Bearer undefined'));

    expect(res.status).toBe(401);
    expect(pingRedisMock).not.toHaveBeenCalled();
  });

  it('pings Redis and reports ok with the right secret', async () => {
    pingRedisMock.mockResolvedValueOnce('ok');

    const res = await GET(makeRequest('Bearer test-secret'));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: 'ok' });
  });

  it('returns 502 when the ping fails, so the failure shows in cron logs', async () => {
    pingRedisMock.mockResolvedValueOnce('error');

    const res = await GET(makeRequest('Bearer test-secret'));

    expect(res.status).toBe(502);
  });
});
