// OAuth 2.1 authorization server for MCP clients. Clients are public (no
// secret), so every code is bound to a PKCE challenge. Only hashes of codes
// and tokens are stored.

import crypto from 'crypto';
import sql from '@/lib/server/db';

export const MCP_PATH = '/api/mcp';
export const OAUTH_SCOPES = ['profile:read'];

export const OAUTH_CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const CODE_TTL_SECONDS = 10 * 60;
const ACCESS_TOKEN_TTL_SECONDS = 60 * 60;
const REFRESH_TOKEN_TTL_SECONDS = 30 * 24 * 60 * 60;

const BLOCKED_REDIRECT_SCHEMES = [
  'javascript:',
  'data:',
  'vbscript:',
  'file:',
  'about:',
  'blob:',
];
const LOOPBACK_HOSTS = ['localhost', '127.0.0.1', '[::1]'];

export interface OAuthClient {
  clientId: string;
  clientName: string;
  redirectUris: string[];
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: 'Bearer';
  expires_in: number;
  scope: string;
}

export interface AccessTokenInfo {
  userId: string;
  clientId: string;
  scopes: string[];
  expiresAt: number;
  resource: string | null;
}

export interface AuthorizationParams {
  client_id?: string;
  redirect_uri?: string;
  response_type?: string;
  code_challenge?: string;
  code_challenge_method?: string;
  scope?: string;
  state?: string;
  resource?: string;
}

export interface ValidAuthorization {
  client: OAuthClient;
  redirectUri: string;
  codeChallenge: string;
  scopes: string[];
  state: string | null;
  resource: string | null;
}

function newSecret(): string {
  return crypto.randomBytes(32).toString('base64url');
}

function hashSecret(secret: string): string {
  return crypto.createHash('sha256').update(secret).digest('hex');
}

/** HTTPS, loopback HTTP for desktop apps, or an app's own URL scheme. */
export function isAllowedRedirectUri(uri: string): boolean {
  let url: URL;
  try {
    url = new URL(uri);
  } catch {
    return false;
  }
  if (url.hash || url.username || url.password) return false;
  if (BLOCKED_REDIRECT_SCHEMES.includes(url.protocol)) return false;
  if (url.protocol === 'http:') return LOOPBACK_HOSTS.includes(url.hostname);
  return true;
}

export function verifyPkce(verifier: string, challenge: string): boolean {
  const computed = Buffer.from(
    crypto.createHash('sha256').update(verifier).digest('base64url'),
  );
  const expected = Buffer.from(challenge);
  return (
    computed.length === expected.length &&
    crypto.timingSafeEqual(computed, expected)
  );
}

/** The scopes to grant: everything supported unless the client asked for less. */
export function resolveScopes(requested?: string | null): string[] {
  if (!requested) return OAUTH_SCOPES;
  return requested.split(' ').filter((s) => OAUTH_SCOPES.includes(s));
}

export function buildRedirectUrl(
  redirectUri: string,
  params: Record<string, string | null>,
): string {
  const url = new URL(redirectUri);
  for (const [key, value] of Object.entries(params)) {
    if (value !== null) url.searchParams.set(key, value);
  }
  return url.toString();
}

export async function registerClient(
  clientName: string,
  redirectUris: string[],
): Promise<OAuthClient> {
  const clientId = `pfy_${crypto.randomBytes(16).toString('hex')}`;
  await sql`
    INSERT INTO oauth_clients (client_id, client_name, redirect_uris)
    VALUES (${clientId}, ${clientName}, ${sql.array(redirectUris)})
  `;
  return { clientId, clientName, redirectUris };
}

export async function getClient(clientId: string): Promise<OAuthClient | null> {
  const [row] = await sql`
    SELECT client_id, client_name, redirect_uris
    FROM oauth_clients
    WHERE client_id = ${clientId}
  `;
  return row
    ? {
        clientId: row.clientId,
        clientName: row.clientName,
        redirectUris: row.redirectUris,
      }
    : null;
}

/**
 * Checks an authorization request. Used by both the consent page and the
 * approve action, so nothing the page rendered is trusted on submit.
 */
export async function validateAuthorization(
  params: AuthorizationParams,
  origin: string,
): Promise<{ valid: ValidAuthorization } | { error: string }> {
  const client = params.client_id ? await getClient(params.client_id) : null;
  if (!client) return { error: 'This app is not registered with Portfoliofy.' };

  const redirectUri = params.redirect_uri;
  if (!redirectUri || !client.redirectUris.includes(redirectUri)) {
    return { error: 'This app sent an unrecognised return address.' };
  }
  if (params.response_type !== 'code') {
    return { error: 'This app asked for an unsupported sign-in type.' };
  }
  if (!params.code_challenge || params.code_challenge_method !== 'S256') {
    return { error: 'This app did not secure its sign-in request.' };
  }
  if (params.resource && params.resource !== `${origin}${MCP_PATH}`) {
    return { error: 'This app asked for access to something else.' };
  }

  const scopes = resolveScopes(params.scope);
  if (scopes.length === 0) {
    return {
      error: 'This app asked for permissions Portfoliofy does not offer.',
    };
  }

  return {
    valid: {
      client,
      redirectUri,
      codeChallenge: params.code_challenge,
      scopes,
      state: params.state ?? null,
      resource: params.resource ?? null,
    },
  };
}

export async function createAuthorizationCode(
  userId: string,
  authorization: ValidAuthorization,
): Promise<string> {
  const code = newSecret();
  await sql`
    INSERT INTO oauth_codes (
      code_hash, client_id, user_id, redirect_uri, code_challenge, scope,
      resource, expires_at
    )
    VALUES (
      ${hashSecret(code)},
      ${authorization.client.clientId},
      ${userId},
      ${authorization.redirectUri},
      ${authorization.codeChallenge},
      ${authorization.scopes.join(' ')},
      ${authorization.resource},
      now() + make_interval(secs => ${CODE_TTL_SECONDS})
    )
  `;
  return code;
}

async function issueTokens(
  clientId: string,
  userId: string,
  scope: string,
  resource: string | null,
): Promise<TokenResponse> {
  const accessToken = newSecret();
  const refreshToken = newSecret();
  await sql`
    INSERT INTO oauth_tokens (
      access_hash, refresh_hash, client_id, user_id, scope, resource,
      access_expires_at, refresh_expires_at
    )
    VALUES (
      ${hashSecret(accessToken)},
      ${hashSecret(refreshToken)},
      ${clientId},
      ${userId},
      ${scope},
      ${resource},
      now() + make_interval(secs => ${ACCESS_TOKEN_TTL_SECONDS}),
      now() + make_interval(secs => ${REFRESH_TOKEN_TTL_SECONDS})
    )
  `;
  return {
    access_token: accessToken,
    refresh_token: refreshToken,
    token_type: 'Bearer',
    expires_in: ACCESS_TOKEN_TTL_SECONDS,
    scope,
  };
}

/** Swaps a code for tokens. A code works once, even if the exchange then fails. */
export async function exchangeAuthorizationCode(
  code: string,
  clientId: string,
  redirectUri: string,
  codeVerifier: string,
): Promise<TokenResponse | null> {
  const [row] = await sql`
    UPDATE oauth_codes
    SET consumed_at = now()
    WHERE code_hash = ${hashSecret(code)}
      AND consumed_at IS NULL
      AND expires_at > now()
    RETURNING client_id, user_id, redirect_uri, code_challenge, scope, resource
  `;
  if (
    !row ||
    row.clientId !== clientId ||
    row.redirectUri !== redirectUri ||
    !verifyPkce(codeVerifier, row.codeChallenge)
  ) {
    return null;
  }
  return issueTokens(clientId, row.userId, row.scope, row.resource);
}

/** Rotates tokens: the refresh token used here stops working. */
export async function refreshTokens(
  refreshToken: string,
  clientId: string,
): Promise<TokenResponse | null> {
  const accessToken = newSecret();
  const nextRefreshToken = newSecret();
  const [row] = await sql`
    UPDATE oauth_tokens
    SET access_hash = ${hashSecret(accessToken)},
        refresh_hash = ${hashSecret(nextRefreshToken)},
        access_expires_at = now() + make_interval(secs => ${ACCESS_TOKEN_TTL_SECONDS}),
        refresh_expires_at = now() + make_interval(secs => ${REFRESH_TOKEN_TTL_SECONDS})
    WHERE refresh_hash = ${hashSecret(refreshToken)}
      AND client_id = ${clientId}
      AND revoked_at IS NULL
      AND refresh_expires_at > now()
    RETURNING scope
  `;
  if (!row) return null;
  return {
    access_token: accessToken,
    refresh_token: nextRefreshToken,
    token_type: 'Bearer',
    expires_in: ACCESS_TOKEN_TTL_SECONDS,
    scope: row.scope,
  };
}

export async function verifyAccessToken(
  token: string,
): Promise<AccessTokenInfo | null> {
  const [row] = await sql`
    UPDATE oauth_tokens
    SET last_used_at = now()
    WHERE access_hash = ${hashSecret(token)}
      AND revoked_at IS NULL
      AND access_expires_at > now()
    RETURNING user_id, client_id, scope, resource, access_expires_at
  `;
  if (!row) return null;
  return {
    userId: row.userId,
    clientId: row.clientId,
    scopes: row.scope.split(' '),
    expiresAt: Math.floor(new Date(row.accessExpiresAt).getTime() / 1000),
    resource: row.resource,
  };
}
