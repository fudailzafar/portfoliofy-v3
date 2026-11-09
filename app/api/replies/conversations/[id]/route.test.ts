import { describe, it, expect, beforeEach, vi } from 'vitest';

const { authMock, getThreadMock, sendInConversationMock, checkRateLimitMock } =
  vi.hoisted(() => ({
    authMock: vi.fn(),
    getThreadMock: vi.fn(),
    sendInConversationMock: vi.fn(),
    checkRateLimitMock: vi.fn(),
  }));

vi.mock('@/auth', () => ({ auth: authMock }));
vi.mock('@/lib/server/replies', () => ({
  getThread: getThreadMock,
  sendInConversation: sendInConversationMock,
}));
vi.mock('@/lib/server/rateLimit', () => ({
  checkRateLimit: checkRateLimitMock,
}));

import { GET, POST } from './route';

const ID = '3f2b8c1e-5d4a-4e6b-9c7d-1a2b3c4d5e6f';
const params = (id: string) => ({ params: Promise.resolve({ id }) });

const get = (id: string, query = '') =>
  GET(
    new Request(`http://localhost/api/replies/conversations/${id}${query}`),
    params(id),
  );

const post = (id: string, body: unknown) =>
  POST(
    new Request(`http://localhost/api/replies/conversations/${id}`, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'content-type': 'application/json' },
    }),
    params(id),
  );

describe('GET /api/replies/conversations/[id]', () => {
  beforeEach(() => {
    authMock.mockReset().mockResolvedValue({ user: { id: 'me' } });
    getThreadMock.mockReset();
    sendInConversationMock.mockReset();
    checkRateLimitMock
      .mockReset()
      .mockResolvedValue({ allowed: true, retryAfterMs: 0 });
  });

  it('rejects a signed-out visitor', async () => {
    authMock.mockResolvedValueOnce(null);
    expect((await get(ID)).status).toBe(401);
  });

  it('returns 404 for an id that is not a uuid, without querying', async () => {
    expect((await get('abc')).status).toBe(404);
    expect(getThreadMock).not.toHaveBeenCalled();
  });

  it('returns 404 when the conversation is not the user’s', async () => {
    getThreadMock.mockResolvedValueOnce(null);
    expect((await get(ID)).status).toBe(404);
    expect(getThreadMock).toHaveBeenCalledWith('me', ID, undefined);
  });

  it('returns the thread and passes the paging cursor', async () => {
    getThreadMock.mockResolvedValueOnce({ messages: [], hasMore: false });
    const res = await get(ID, '?before=42');
    expect(res.status).toBe(200);
    expect(getThreadMock).toHaveBeenCalledWith('me', ID, 42);
  });

  it('rejects a bad cursor', async () => {
    expect((await get(ID, '?before=abc')).status).toBe(400);
    expect((await get(ID, '?before=-1')).status).toBe(400);
    expect(getThreadMock).not.toHaveBeenCalled();
  });
});

describe('POST /api/replies/conversations/[id]', () => {
  beforeEach(() => {
    authMock.mockReset().mockResolvedValue({ user: { id: 'me' } });
    sendInConversationMock.mockReset();
    checkRateLimitMock
      .mockReset()
      .mockResolvedValue({ allowed: true, retryAfterMs: 0 });
  });

  it('sends a trimmed message', async () => {
    sendInConversationMock.mockResolvedValueOnce({
      ok: true,
      conversationId: ID,
      messageId: 9,
    });
    const res = await post(ID, { body: '  Thanks!  ' });
    expect(res.status).toBe(201);
    expect(sendInConversationMock).toHaveBeenCalledWith({
      senderId: 'me',
      conversationId: ID,
      body: 'Thanks!',
    });
  });

  it('refuses empty and oversized messages', async () => {
    expect((await post(ID, { body: ' ' })).status).toBe(400);
    expect((await post(ID, { body: 'x'.repeat(2001) })).status).toBe(400);
    expect(sendInConversationMock).not.toHaveBeenCalled();
  });

  it('tells you when you blocked them, and says nothing of being blocked', async () => {
    sendInConversationMock.mockResolvedValueOnce({
      ok: false,
      reason: 'blocked_by_you',
    });
    const mine = await post(ID, { body: 'hi' });
    expect(mine.status).toBe(403);
    expect((await mine.json()).error).toMatch(/unblock/i);

    sendInConversationMock.mockResolvedValueOnce({
      ok: false,
      reason: 'not_accepting',
    });
    const theirs = await post(ID, { body: 'hi' });
    expect((await theirs.json()).error).not.toMatch(/block/i);
  });

  it('is rate limited', async () => {
    checkRateLimitMock.mockResolvedValueOnce({
      allowed: false,
      retryAfterMs: 500,
    });
    expect((await post(ID, { body: 'hi' })).status).toBe(429);
  });
});
