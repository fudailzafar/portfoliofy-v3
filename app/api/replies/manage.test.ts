// Covers the small routes: blocks, reports, settings, read, hide and unread.

import { describe, it, expect, beforeEach, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  setBlocked: vi.fn(),
  reportConversation: vi.fn(),
  getRepliesEnabled: vi.fn(),
  setRepliesEnabled: vi.fn(),
  markConversationRead: vi.fn(),
  hideConversation: vi.fn(),
  countUnreadConversations: vi.fn(),
  checkRateLimit: vi.fn(),
}));

vi.mock('@/auth', () => ({ auth: mocks.auth }));
vi.mock('@/lib/server/replies', () => ({
  setBlocked: mocks.setBlocked,
  reportConversation: mocks.reportConversation,
  getRepliesEnabled: mocks.getRepliesEnabled,
  setRepliesEnabled: mocks.setRepliesEnabled,
  markConversationRead: mocks.markConversationRead,
  hideConversation: mocks.hideConversation,
  countUnreadConversations: mocks.countUnreadConversations,
}));
vi.mock('next/cache', () => ({ revalidateTag: vi.fn() }));
vi.mock('@/lib/server/rateLimit', () => ({
  checkRateLimit: mocks.checkRateLimit,
}));

import { PUT as putBlock } from './blocks/route';
import { POST as postReport } from './reports/route';
import { GET as getSetting, PUT as putSetting } from './settings/route';
import { POST as postRead } from './conversations/[id]/read/route';
import { POST as postHide } from './conversations/[id]/hide/route';
import { GET as getUnread } from './unread/route';

const ID = '3f2b8c1e-5d4a-4e6b-9c7d-1a2b3c4d5e6f';
const params = (id: string) => ({ params: Promise.resolve({ id }) });
const json = (body: unknown) =>
  new Request('http://localhost/api', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  });

beforeEach(() => {
  Object.values(mocks).forEach((mock) => mock.mockReset());
  mocks.auth.mockResolvedValue({ user: { id: 'me' } });
  mocks.checkRateLimit.mockResolvedValue({ allowed: true, retryAfterMs: 0 });
});

describe('every route needs a signed-in user', () => {
  it('returns 401 and does nothing', async () => {
    mocks.auth.mockResolvedValue(null);
    const responses = await Promise.all([
      putBlock(json({ username: 'a', blocked: true })),
      postReport(json({ conversationId: ID, reason: 'spam' })),
      getSetting(),
      putSetting(json({ repliesEnabled: false })),
      postRead(json({}), params(ID)),
      postHide(json({}), params(ID)),
      getUnread(),
    ]);
    expect(responses.map((r) => r.status)).toEqual(Array(7).fill(401));
    expect(mocks.setBlocked).not.toHaveBeenCalled();
    expect(mocks.setRepliesEnabled).not.toHaveBeenCalled();
  });
});

describe('PUT /api/replies/blocks', () => {
  it('blocks and unblocks', async () => {
    mocks.setBlocked.mockResolvedValue({ ok: true });
    const res = await putBlock(json({ username: 'andy', blocked: true }));
    expect(res.status).toBe(200);
    expect(mocks.setBlocked).toHaveBeenCalledWith('me', 'andy', true);

    await putBlock(json({ username: 'andy', blocked: false }));
    expect(mocks.setBlocked).toHaveBeenLastCalledWith('me', 'andy', false);
  });

  it('refuses blocking yourself and unknown people', async () => {
    mocks.setBlocked.mockResolvedValueOnce({ ok: false, reason: 'self' });
    expect(
      (await putBlock(json({ username: 'me', blocked: true }))).status,
    ).toBe(400);
    mocks.setBlocked.mockResolvedValueOnce({ ok: false, reason: 'not_found' });
    expect(
      (await putBlock(json({ username: 'x', blocked: true }))).status,
    ).toBe(404);
  });

  it('rejects a malformed body', async () => {
    expect((await putBlock(json({ username: 'andy' }))).status).toBe(400);
    expect(mocks.setBlocked).not.toHaveBeenCalled();
  });
});

describe('POST /api/replies/reports', () => {
  it('files a report', async () => {
    mocks.reportConversation.mockResolvedValue({ ok: true });
    const res = await postReport(
      json({
        conversationId: ID,
        messageId: 5,
        reason: 'harassment',
        details: 'rude',
      }),
    );
    expect(res.status).toBe(201);
    expect(mocks.reportConversation).toHaveBeenCalledWith({
      reporterId: 'me',
      conversationId: ID,
      messageId: 5,
      reason: 'harassment',
      details: 'rude',
    });
  });

  it('rejects an unknown reason', async () => {
    const res = await postReport(json({ conversationId: ID, reason: 'rude' }));
    expect(res.status).toBe(400);
    expect(mocks.reportConversation).not.toHaveBeenCalled();
  });

  it('maps refusals', async () => {
    mocks.reportConversation.mockResolvedValueOnce({
      ok: false,
      reason: 'not_found',
    });
    expect(
      (await postReport(json({ conversationId: ID, reason: 'spam' }))).status,
    ).toBe(404);
    mocks.reportConversation.mockResolvedValueOnce({
      ok: false,
      reason: 'invalid_message',
    });
    expect(
      (
        await postReport(
          json({ conversationId: ID, messageId: 1, reason: 'spam' }),
        )
      ).status,
    ).toBe(400);
  });

  it('is rate limited', async () => {
    mocks.checkRateLimit.mockResolvedValueOnce({
      allowed: false,
      retryAfterMs: 1000,
    });
    expect(
      (await postReport(json({ conversationId: ID, reason: 'spam' }))).status,
    ).toBe(429);
    expect(mocks.reportConversation).not.toHaveBeenCalled();
  });
});

describe('/api/replies/settings', () => {
  it('reads and writes the setting', async () => {
    mocks.getRepliesEnabled.mockResolvedValue(true);
    expect(await (await getSetting()).json()).toEqual({ repliesEnabled: true });

    const res = await putSetting(json({ repliesEnabled: false }));
    expect(await res.json()).toEqual({ repliesEnabled: false });
    expect(mocks.setRepliesEnabled).toHaveBeenCalledWith('me', false);
  });

  it('rejects a non-boolean', async () => {
    expect((await putSetting(json({ repliesEnabled: 'no' }))).status).toBe(400);
    expect(mocks.setRepliesEnabled).not.toHaveBeenCalled();
  });
});

describe('read and hide', () => {
  it('act on the user’s own conversation', async () => {
    mocks.markConversationRead.mockResolvedValue(true);
    mocks.hideConversation.mockResolvedValue(true);
    expect((await postRead(json({}), params(ID))).status).toBe(200);
    expect((await postHide(json({}), params(ID))).status).toBe(200);
    expect(mocks.markConversationRead).toHaveBeenCalledWith('me', ID);
    expect(mocks.hideConversation).toHaveBeenCalledWith('me', ID);
  });

  it('return 404 for someone else’s conversation or a bad id', async () => {
    mocks.markConversationRead.mockResolvedValue(false);
    mocks.hideConversation.mockResolvedValue(false);
    expect((await postRead(json({}), params(ID))).status).toBe(404);
    expect((await postHide(json({}), params(ID))).status).toBe(404);
    expect((await postRead(json({}), params('nope'))).status).toBe(404);
  });
});

describe('GET /api/replies/unread', () => {
  it('returns the count', async () => {
    mocks.countUnreadConversations.mockResolvedValue(3);
    expect(await (await getUnread()).json()).toEqual({ unread: 3 });
  });
});
