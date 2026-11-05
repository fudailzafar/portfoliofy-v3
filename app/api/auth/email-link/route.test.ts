import { describe, it, expect, beforeEach, vi } from 'vitest';

const { checkRateLimitMock, createLoginTokenMock, sendLoginEmailMock } =
  vi.hoisted(() => ({
    checkRateLimitMock: vi.fn(),
    createLoginTokenMock: vi.fn(),
    sendLoginEmailMock: vi.fn(),
  }));

vi.mock('@/lib/server/rateLimit', () => ({
  checkRateLimit: checkRateLimitMock,
  getClientIp: () => '203.0.113.9',
}));
vi.mock('@/lib/server/emailAuth', async () => {
  const actual = await vi.importActual<typeof import('@/lib/server/emailAuth')>(
    '@/lib/server/emailAuth',
  );
  return {
    ...actual,
    createLoginToken: createLoginTokenMock,
    sendLoginEmail: sendLoginEmailMock,
  };
});

import { POST } from './route';

function makeRequest(body: unknown) {
  return new Request('http://localhost:3000/api/auth/email-link', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/auth/email-link', () => {
  beforeEach(() => {
    checkRateLimitMock.mockReset().mockResolvedValue({ allowed: true });
    createLoginTokenMock.mockReset().mockResolvedValue('tok_123');
    sendLoginEmailMock.mockReset().mockResolvedValue(undefined);
  });

  it('rejects an invalid email without creating a token', async () => {
    const res = await POST(makeRequest({ email: 'nope' }));

    expect(res.status).toBe(400);
    expect(createLoginTokenMock).not.toHaveBeenCalled();
  });

  it('returns 429 and sends nothing when rate limited', async () => {
    checkRateLimitMock.mockResolvedValue({ allowed: false });

    const res = await POST(makeRequest({ email: 'jane@example.com' }));

    expect(res.status).toBe(429);
    expect(sendLoginEmailMock).not.toHaveBeenCalled();
  });

  it('emails a verify link for the normalized address', async () => {
    const res = await POST(
      makeRequest({ email: ' Jane@Example.com ', mode: 'login' }),
    );

    expect(res.status).toBe(200);
    expect(createLoginTokenMock).toHaveBeenCalledWith('jane@example.com');
    expect(sendLoginEmailMock).toHaveBeenCalledWith(
      'jane@example.com',
      'http://localhost:3000/verify-login?token=tok_123',
      'login',
    );
  });

  it('only returns the link to the browser in development', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    const prod = await (
      await POST(makeRequest({ email: 'jane@example.com' }))
    ).json();
    vi.stubEnv('NODE_ENV', 'development');
    const dev = await (
      await POST(makeRequest({ email: 'jane@example.com' }))
    ).json();
    vi.unstubAllEnvs();

    expect(prod).toEqual({ ok: true });
    expect(dev.devLink).toBe(
      'http://localhost:3000/verify-login?token=tok_123',
    );
  });

  it('reports a failed send as an error, not success', async () => {
    sendLoginEmailMock.mockRejectedValue(new Error('provider down'));

    const res = await POST(makeRequest({ email: 'jane@example.com' }));

    expect(res.status).toBe(500);
  });
});
