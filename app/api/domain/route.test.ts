import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';

const {
  authMock,
  getUserIdByCustomDomainMock,
  getCustomDomainByUserIdMock,
  setCustomDomainMock,
  removeCustomDomainMock,
  fetchMock,
} = vi.hoisted(() => ({
  authMock: vi.fn(),
  getUserIdByCustomDomainMock: vi.fn(),
  getCustomDomainByUserIdMock: vi.fn(),
  setCustomDomainMock: vi.fn(),
  removeCustomDomainMock: vi.fn(),
  fetchMock: vi.fn(),
}));

vi.mock('@/auth', () => ({ auth: authMock }));
vi.mock('@/lib/server/dbActions', () => ({
  getUserIdByCustomDomain: getUserIdByCustomDomainMock,
  getCustomDomainByUserId: getCustomDomainByUserIdMock,
  setCustomDomain: setCustomDomainMock,
  removeCustomDomain: removeCustomDomainMock,
}));
// revalidateTag needs Next's request-scoped async storage, which only
// exists inside a real server request — not relevant to what this file
// tests (the domain-ownership/HTTP-status logic), so it's stubbed out.
vi.mock('next/cache', () => ({ revalidateTag: vi.fn() }));
vi.stubGlobal('fetch', fetchMock);

import { POST } from './route';

function makeRequest(body: unknown) {
  return new NextRequest('http://localhost/api/domain', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  });
}

describe('POST /api/domain', () => {
  beforeEach(() => {
    authMock.mockReset();
    getUserIdByCustomDomainMock.mockReset();
    getCustomDomainByUserIdMock.mockReset();
    setCustomDomainMock.mockReset();
    removeCustomDomainMock.mockReset();
    fetchMock.mockReset();
  });

  it('rejects unauthenticated requests', async () => {
    authMock.mockResolvedValueOnce(null);

    const res = await POST(makeRequest({ domain: 'example.com' }));

    expect(res.status).toBe(401);
  });

  it('rejects a domain already owned by a different account, without calling Vercel', async () => {
    authMock.mockResolvedValueOnce({ user: { id: 'user-1' } });
    getUserIdByCustomDomainMock.mockResolvedValueOnce('some-other-user-id');

    const res = await POST(makeRequest({ domain: 'taken.com' }));
    const json = await res.json();

    expect(res.status).toBe(409);
    expect(json.error).toMatch(/already connected to another account/i);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('lets the owner re-submit their own already-connected domain', async () => {
    authMock.mockResolvedValueOnce({ user: { id: 'user-1' } });
    getUserIdByCustomDomainMock.mockResolvedValueOnce('user-1');
    getCustomDomainByUserIdMock.mockResolvedValueOnce('mine.com');
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({}) });
    setCustomDomainMock.mockResolvedValueOnce({ success: true });

    const res = await POST(makeRequest({ domain: 'mine.com' }));

    expect(res.status).toBe(200);
  });

  it('surfaces a clear 409 (not a generic 500) if the DB unique-constraint backstop fires on a race', async () => {
    authMock.mockResolvedValueOnce({ user: { id: 'user-1' } });
    getUserIdByCustomDomainMock.mockResolvedValueOnce(null); // pre-check saw it as free
    getCustomDomainByUserIdMock.mockResolvedValueOnce(null);
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({}) });
    // ...but another request won the race and claimed it a moment later.
    setCustomDomainMock.mockResolvedValueOnce({ success: false, reason: 'taken' });

    const res = await POST(makeRequest({ domain: 'race-condition.com' }));
    const json = await res.json();

    expect(res.status).toBe(409);
    expect(json.error).toMatch(/already connected to another account/i);
  });

  it('falls back to a generic 500 for a non-conflict DB failure', async () => {
    authMock.mockResolvedValueOnce({ user: { id: 'user-1' } });
    getUserIdByCustomDomainMock.mockResolvedValueOnce(null);
    getCustomDomainByUserIdMock.mockResolvedValueOnce(null);
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({}) });
    setCustomDomainMock.mockResolvedValueOnce({ success: false, reason: 'error' });

    const res = await POST(makeRequest({ domain: 'example.com' }));
    const json = await res.json();

    expect(res.status).toBe(500);
    expect(json.error).toMatch(/failed to save domain/i);
  });
});
