import { beforeEach, describe, expect, it, vi } from 'vitest';

const { authMock, headersMock, verifyMock } = vi.hoisted(() => ({
  authMock: vi.fn(),
  headersMock: vi.fn(),
  verifyMock: vi.fn(),
}));

vi.mock('@/auth', () => ({ auth: authMock }));
vi.mock('next/headers', () => ({ headers: headersMock }));
vi.mock('@/lib/server/db', () => ({ default: vi.fn() }));
vi.mock('@/lib/server/oauth', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./oauth')>()),
  verifyAccessToken: verifyMock,
}));

import { getApiSession } from './requestAuth';

const withHeader = (authorization?: string) =>
  new Request('http://localhost/api/resume', {
    headers: authorization ? { authorization } : {},
  });

const token = (scopes: string[]) => ({
  userId: 'user-1',
  clientId: 'portfoliofy-android',
  scopes,
  expiresAt: 0,
  resource: null,
});

describe('getApiSession', () => {
  beforeEach(() => {
    authMock.mockReset();
    headersMock.mockReset();
    verifyMock.mockReset();
  });

  it('accepts a bearer token that carries the app scope', async () => {
    verifyMock.mockResolvedValue(token(['app']));

    const session = await getApiSession(withHeader('Bearer abc123'));

    expect(session).toEqual({ user: { id: 'user-1' } });
    expect(verifyMock).toHaveBeenCalledWith('abc123');
    expect(authMock).not.toHaveBeenCalled();
  });

  it('rejects a token issued to another app (no app scope)', async () => {
    verifyMock.mockResolvedValue(token(['profile:read', 'profile:write']));

    await expect(
      getApiSession(withHeader('Bearer mcp-token')),
    ).resolves.toBeNull();
  });

  it('does not fall back to the cookie when a bearer token fails', async () => {
    verifyMock.mockResolvedValue(null);
    authMock.mockResolvedValue({ user: { id: 'cookie-user' } });

    await expect(
      getApiSession(withHeader('Bearer expired')),
    ).resolves.toBeNull();
    expect(authMock).not.toHaveBeenCalled();
  });

  it('uses the cookie session when there is no authorization header', async () => {
    authMock.mockResolvedValue({ user: { id: 'cookie-user', email: 'a@b.c' } });

    await expect(getApiSession(withHeader())).resolves.toEqual({
      user: { id: 'cookie-user' },
    });
    expect(verifyMock).not.toHaveBeenCalled();
  });

  it('ignores a non-bearer authorization header', async () => {
    authMock.mockResolvedValue({ user: { id: 'cookie-user' } });

    await expect(
      getApiSession(withHeader('Basic dXNlcjpwYXNz')),
    ).resolves.toEqual({ user: { id: 'cookie-user' } });
    expect(verifyMock).not.toHaveBeenCalled();
  });

  it('returns null when nobody is signed in', async () => {
    authMock.mockResolvedValue(null);
    await expect(getApiSession(withHeader())).resolves.toBeNull();
  });

  it('reads the header from the current request when none is passed', async () => {
    headersMock.mockResolvedValue(new Headers({ authorization: 'Bearer t1' }));
    verifyMock.mockResolvedValue(token(['app']));

    await expect(getApiSession()).resolves.toEqual({ user: { id: 'user-1' } });
  });

  it('falls back to the cookie outside a request', async () => {
    headersMock.mockRejectedValue(new Error('outside a request scope'));
    authMock.mockResolvedValue({ user: { id: 'cookie-user' } });

    await expect(getApiSession()).resolves.toEqual({
      user: { id: 'cookie-user' },
    });
  });
});
