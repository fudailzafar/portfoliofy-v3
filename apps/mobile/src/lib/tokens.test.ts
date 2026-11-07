import { beforeEach, describe, expect, it, vi } from 'vitest';

const store = new Map<string, string>();
const exchangeCodeAsync = vi.fn();
const refreshAsync = vi.fn();

class TokenError extends Error {
  params: Record<string, string>;
  constructor(error: string) {
    super(error);
    this.params = { error };
  }
}

vi.mock('expo-secure-store', () => ({
  getItemAsync: async (key: string) => store.get(key) ?? null,
  setItemAsync: async (key: string, value: string) =>
    void store.set(key, value),
  deleteItemAsync: async (key: string) => void store.delete(key),
}));
vi.mock('expo-auth-session', () => ({
  exchangeCodeAsync: (...args: unknown[]) => exchangeCodeAsync(...args),
  refreshAsync: (...args: unknown[]) => refreshAsync(...args),
  TokenError,
}));

const NOW = 1_800_000_000_000;

function response(over: Record<string, unknown> = {}) {
  return {
    accessToken: 'access-1',
    refreshToken: 'refresh-1',
    expiresIn: 3600,
    issuedAt: NOW / 1000,
    ...over,
  };
}

async function load() {
  vi.resetModules();
  return import('./tokens');
}

function seed(
  session: Partial<{
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
  }>,
) {
  store.set(
    'portfoliofy.session',
    JSON.stringify({
      accessToken: 'old-access',
      refreshToken: 'old-refresh',
      expiresAt: NOW + 3_600_000,
      ...session,
    }),
  );
}

describe('tokens', () => {
  beforeEach(() => {
    store.clear();
    exchangeCodeAsync.mockReset();
    refreshAsync.mockReset();
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(null, { status: 200 })),
    );
  });

  it('is signed out until a session is saved', async () => {
    const tokens = await load();
    expect(await tokens.hasSession()).toBe(false);
    expect(await tokens.getAccessToken()).toBeNull();
  });

  it('turns a sign-in code into a saved session', async () => {
    exchangeCodeAsync.mockResolvedValue(response());
    const tokens = await load();

    await tokens.completeSignIn('the-code', 'the-verifier');

    expect(exchangeCodeAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        clientId: 'portfoliofy-android',
        code: 'the-code',
        redirectUri: 'com.portfoliofy.app:/oauth/callback',
        extraParams: { code_verifier: 'the-verifier' },
      }),
      expect.objectContaining({
        tokenEndpoint: expect.stringContaining('/oauth/token'),
      }),
    );
    expect(await tokens.hasSession()).toBe(true);
    expect(await tokens.getAccessToken()).toBe('access-1');
    expect(JSON.parse(store.get('portfoliofy.session')!).expiresAt).toBe(
      NOW + 3_600_000,
    );
  });

  it('refuses a sign-in that came back without a refresh token', async () => {
    exchangeCodeAsync.mockResolvedValue(response({ refreshToken: undefined }));
    const tokens = await load();

    await expect(tokens.completeSignIn('c', 'v')).rejects.toThrow(
      /did not return a session/,
    );
    expect(await tokens.hasSession()).toBe(false);
  });

  it('uses the saved token while it is still good, without refreshing', async () => {
    seed({});
    const tokens = await load();

    expect(await tokens.getAccessToken()).toBe('old-access');
    expect(refreshAsync).not.toHaveBeenCalled();
  });

  it('refreshes a token that is about to expire, and keeps the new one', async () => {
    seed({ expiresAt: NOW + 30_000 }); // inside the one-minute margin
    refreshAsync.mockResolvedValue(
      response({ accessToken: 'access-2', refreshToken: 'refresh-2' }),
    );
    const tokens = await load();

    expect(await tokens.getAccessToken()).toBe('access-2');
    expect(refreshAsync).toHaveBeenCalledWith(
      { clientId: 'portfoliofy-android', refreshToken: 'old-refresh' },
      expect.anything(),
    );
    expect(JSON.parse(store.get('portfoliofy.session')!).refreshToken).toBe(
      'refresh-2',
    );
  });

  it('refreshes once however many requests find the token expired', async () => {
    seed({ expiresAt: NOW - 1 });
    refreshAsync.mockImplementation(async () =>
      response({ accessToken: 'access-2' }),
    );
    const tokens = await load();

    const results = await Promise.all([
      tokens.getAccessToken(),
      tokens.getAccessToken(),
      tokens.getAccessToken(),
    ]);

    expect(results).toEqual(['access-2', 'access-2', 'access-2']);
    expect(refreshAsync).toHaveBeenCalledTimes(1);
  });

  it('ends the session when the server says the refresh token is no good', async () => {
    seed({ expiresAt: NOW - 1 });
    refreshAsync.mockRejectedValue(new TokenError('invalid_grant'));
    const tokens = await load();
    const expired = vi.fn();
    tokens.onSessionExpired(expired);

    expect(await tokens.getAccessToken()).toBeNull();

    expect(expired).toHaveBeenCalledTimes(1);
    expect(store.has('portfoliofy.session')).toBe(false);
    expect(await tokens.hasSession()).toBe(false);
  });

  it('stays signed in when offline, and when the server has a hiccup', async () => {
    seed({ expiresAt: NOW - 1 });
    const tokens = await load();
    const expired = vi.fn();
    tokens.onSessionExpired(expired);

    refreshAsync.mockRejectedValueOnce(new TypeError('Network request failed'));
    await expect(tokens.getAccessToken()).rejects.toThrow(TypeError);

    refreshAsync.mockRejectedValueOnce(new TokenError('server_error'));
    await expect(tokens.getAccessToken()).rejects.toThrow('server_error');

    expect(expired).not.toHaveBeenCalled();
    expect(store.has('portfoliofy.session')).toBe(true);
  });

  it('can try again after a failed refresh', async () => {
    seed({ expiresAt: NOW - 1 });
    refreshAsync
      .mockRejectedValueOnce(new TypeError('Network request failed'))
      .mockResolvedValueOnce(response({ accessToken: 'access-3' }));
    const tokens = await load();

    await expect(tokens.getAccessToken()).rejects.toThrow();
    expect(await tokens.getAccessToken()).toBe('access-3');
  });

  it('signs out here, and tells the server which token to revoke', async () => {
    seed({});
    const tokens = await load();

    await tokens.endSession();

    expect(store.has('portfoliofy.session')).toBe(false);
    const [url, init] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toMatch(/\/oauth\/revoke$/);
    expect(init.method).toBe('POST');
    const body = new URLSearchParams(init.body as string);
    expect(body.get('token')).toBe('old-refresh');
    expect(body.get('client_id')).toBe('portfoliofy-android');
  });

  it('still signs out when the server cannot be reached', async () => {
    seed({});
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Promise.reject(new TypeError('offline'))),
    );
    const tokens = await load();

    await expect(tokens.endSession()).resolves.toBeUndefined();
    expect(store.has('portfoliofy.session')).toBe(false);
  });

  it('treats unreadable storage as signed out', async () => {
    store.set('portfoliofy.session', '{not json');
    const tokens = await load();

    expect(await tokens.hasSession()).toBe(false);
  });
});
