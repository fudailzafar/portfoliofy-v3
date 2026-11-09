import { describe, it, expect, beforeEach, vi } from 'vitest';

const { authMock, sendReplyMock, checkRateLimitMock } = vi.hoisted(() => ({
  authMock: vi.fn(),
  sendReplyMock: vi.fn(),
  checkRateLimitMock: vi.fn(),
}));

vi.mock('@/auth', () => ({ auth: authMock }));
vi.mock('@/lib/server/replies', () => ({ sendReply: sendReplyMock }));
vi.mock('@/lib/server/rateLimit', () => ({
  checkRateLimit: checkRateLimitMock,
}));

import { POST } from './route';

function post(body: unknown) {
  return POST(
    new Request('http://localhost/api/replies', {
      method: 'POST',
      body: typeof body === 'string' ? body : JSON.stringify(body),
      headers: { 'content-type': 'application/json' },
    }),
  );
}

describe('POST /api/replies', () => {
  beforeEach(() => {
    authMock.mockReset().mockResolvedValue({ user: { id: 'me' } });
    sendReplyMock.mockReset();
    checkRateLimitMock
      .mockReset()
      .mockResolvedValue({ allowed: true, retryAfterMs: 0 });
  });

  it('rejects a signed-out visitor', async () => {
    authMock.mockResolvedValueOnce(null);
    const res = await post({ username: 'andy', body: '🔥' });
    expect(res.status).toBe(401);
    expect(sendReplyMock).not.toHaveBeenCalled();
  });

  it('rejects a bad body without touching the database', async () => {
    expect((await post({ username: 'andy', body: '   ' })).status).toBe(400);
    expect((await post({ body: 'hi' })).status).toBe(400);
    expect((await post('not json')).status).toBe(400);
    expect(sendReplyMock).not.toHaveBeenCalled();
  });

  it('sends a reply to a project and returns the conversation', async () => {
    sendReplyMock.mockResolvedValueOnce({
      ok: true,
      conversationId: 'c1',
      messageId: 7,
    });

    const res = await post({
      username: 'andy',
      body: ' Great work ',
      target: { kind: 'item', section: 'projects', itemId: 'p1' },
    });

    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({ conversationId: 'c1', messageId: 7 });
    expect(sendReplyMock).toHaveBeenCalledWith({
      senderId: 'me',
      recipientUsername: 'andy',
      body: 'Great work',
      target: { kind: 'item', section: 'projects', itemId: 'p1' },
    });
  });

  it.each([
    ['not_found', 404],
    ['self', 400],
    ['not_accepting', 403],
    ['blocked_by_you', 403],
    ['target_unavailable', 409],
  ])('maps the refusal "%s" to HTTP %i', async (reason, status) => {
    sendReplyMock.mockResolvedValueOnce({ ok: false, reason });
    const res = await post({ username: 'andy', body: 'hi' });
    expect(res.status).toBe(status);
    expect((await res.json()).code).toBe(reason);
  });

  it('never says a block is the reason', async () => {
    sendReplyMock.mockResolvedValueOnce({ ok: false, reason: 'not_accepting' });
    const res = await post({ username: 'andy', body: 'hi' });
    expect((await res.json()).error).not.toMatch(/block/i);
  });

  it('returns 429 with Retry-After when rate limited', async () => {
    checkRateLimitMock.mockResolvedValueOnce({
      allowed: false,
      retryAfterMs: 12_300,
    });
    const res = await post({ username: 'andy', body: 'hi' });
    expect(res.status).toBe(429);
    expect(res.headers.get('Retry-After')).toBe('13');
    expect(sendReplyMock).not.toHaveBeenCalled();
  });

  it('returns a plain 500 when the database fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    sendReplyMock.mockRejectedValueOnce(new Error('connection refused'));
    const res = await post({ username: 'andy', body: 'hi' });
    expect(res.status).toBe(500);
    expect(JSON.stringify(await res.json())).not.toMatch(/connection/);
  });
});
