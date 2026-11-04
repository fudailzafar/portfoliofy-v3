import crypto from 'crypto';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { sqlMock } = vi.hoisted(() => ({ sqlMock: vi.fn() }));
vi.mock('@/lib/server/db', () => ({ default: sqlMock }));

import {
  buildRedirectUrl,
  exchangeAuthorizationCode,
  isAllowedRedirectUri,
  refreshTokens,
  resolveScopes,
  validateAuthorization,
  verifyAccessToken,
  verifyPkce,
} from './oauth';

const ORIGIN = 'https://portfoliofyme.vercel.app';
const VERIFIER = 'a-long-random-verifier';
const CHALLENGE = crypto
  .createHash('sha256')
  .update(VERIFIER)
  .digest('base64url');

const client = {
  clientId: 'pfy_1',
  clientName: 'Claude',
  redirectUris: ['https://claude.ai/callback'],
};
const request = {
  client_id: 'pfy_1',
  redirect_uri: 'https://claude.ai/callback',
  response_type: 'code',
  code_challenge: CHALLENGE,
  code_challenge_method: 'S256',
};
const codeRow = {
  clientId: 'pfy_1',
  userId: 'user-1',
  redirectUri: 'https://claude.ai/callback',
  codeChallenge: CHALLENGE,
  scope: 'profile:read',
  resource: null,
};

beforeEach(() => {
  sqlMock.mockReset();
});

describe('isAllowedRedirectUri', () => {
  it.each([
    'https://claude.ai/api/mcp/auth_callback',
    'http://localhost:6274/oauth/callback',
    'http://127.0.0.1:33418/',
    'cursor://anysphere.cursor-retrieval/oauth/callback',
  ])('allows %s', (uri) => {
    expect(isAllowedRedirectUri(uri)).toBe(true);
  });

  it.each([
    'http://evil.com/callback',
    'javascript:alert(1)',
    'data:text/html,hi',
    'file:///etc/passwd',
    'https://claude.ai/cb#fragment',
    'https://user:pass@claude.ai/cb',
    'not a url',
  ])('rejects %s', (uri) => {
    expect(isAllowedRedirectUri(uri)).toBe(false);
  });
});

describe('verifyPkce', () => {
  it('accepts the matching verifier and rejects others', () => {
    expect(verifyPkce(VERIFIER, CHALLENGE)).toBe(true);
    expect(verifyPkce('wrong', CHALLENGE)).toBe(false);
  });
});

describe('resolveScopes', () => {
  it('defaults to every scope and drops unknown ones', () => {
    expect(resolveScopes()).toEqual(['profile:read', 'profile:write']);
    expect(resolveScopes('profile:read admin')).toEqual(['profile:read']);
    expect(resolveScopes('admin')).toEqual([]);
  });
});

describe('buildRedirectUrl', () => {
  it('keeps existing params and skips null values', () => {
    expect(
      buildRedirectUrl('https://app.test/cb?a=1', { code: 'x', state: null }),
    ).toBe('https://app.test/cb?a=1&code=x');
  });
});

describe('validateAuthorization', () => {
  const clientRow = {
    clientId: 'pfy_1',
    clientName: 'Claude',
    redirectUris: client.redirectUris,
  };

  it('accepts a well-formed request', async () => {
    sqlMock.mockResolvedValueOnce([clientRow]);
    const result = await validateAuthorization(request, ORIGIN);
    expect('valid' in result && result.valid.scopes).toEqual([
      'profile:read',
      'profile:write',
    ]);
  });

  it.each([
    ['unknown client', {}, []],
    ['other redirect', { redirect_uri: 'https://evil.com/cb' }, [clientRow]],
    ['implicit flow', { response_type: 'token' }, [clientRow]],
    ['no PKCE', { code_challenge: undefined }, [clientRow]],
    ['plain PKCE', { code_challenge_method: 'plain' }, [clientRow]],
    ['other resource', { resource: 'https://evil.com/mcp' }, [clientRow]],
    ['unknown scope', { scope: 'admin' }, [clientRow]],
  ])('rejects %s', async (_name, override, rows) => {
    sqlMock.mockResolvedValueOnce(rows);
    const result = await validateAuthorization(
      { ...request, ...override },
      ORIGIN,
    );
    expect('error' in result).toBe(true);
  });
});

describe('exchangeAuthorizationCode', () => {
  it('issues tokens for a valid code', async () => {
    sqlMock.mockResolvedValueOnce([codeRow]).mockResolvedValueOnce([]);
    const tokens = await exchangeAuthorizationCode(
      'code',
      'pfy_1',
      codeRow.redirectUri,
      VERIFIER,
    );
    expect(tokens?.token_type).toBe('Bearer');
    expect(tokens?.scope).toBe('profile:read');
  });

  it('rejects a used or expired code', async () => {
    sqlMock.mockResolvedValueOnce([]);
    await expect(
      exchangeAuthorizationCode('code', 'pfy_1', codeRow.redirectUri, VERIFIER),
    ).resolves.toBeNull();
  });

  it.each([
    ['another client', 'pfy_2', codeRow.redirectUri, VERIFIER],
    ['another redirect', 'pfy_1', 'https://evil.com/cb', VERIFIER],
    ['the wrong verifier', 'pfy_1', codeRow.redirectUri, 'wrong'],
  ])('issues nothing to %s', async (_name, clientId, redirectUri, verifier) => {
    sqlMock.mockResolvedValueOnce([codeRow]);
    await expect(
      exchangeAuthorizationCode('code', clientId, redirectUri, verifier),
    ).resolves.toBeNull();
    expect(sqlMock).toHaveBeenCalledTimes(1);
  });
});

describe('refreshTokens', () => {
  it('returns new tokens, or null for an unknown refresh token', async () => {
    sqlMock.mockResolvedValueOnce([{ scope: 'profile:read' }]);
    const tokens = await refreshTokens('old', 'pfy_1');
    expect(tokens?.refresh_token).not.toBe('old');

    sqlMock.mockResolvedValueOnce([]);
    await expect(refreshTokens('old', 'pfy_1')).resolves.toBeNull();
  });
});

describe('verifyAccessToken', () => {
  it('maps a live token and rejects an unknown one', async () => {
    sqlMock.mockResolvedValueOnce([
      {
        userId: 'user-1',
        clientId: 'pfy_1',
        scope: 'profile:read',
        resource: null,
        accessExpiresAt: '2030-01-01T00:00:00Z',
      },
    ]);
    const info = await verifyAccessToken('token');
    expect(info?.userId).toBe('user-1');
    expect(info?.scopes).toEqual(['profile:read']);

    sqlMock.mockResolvedValueOnce([]);
    await expect(verifyAccessToken('token')).resolves.toBeNull();
  });
});
