// The sign-in session: tokens kept in the device's secure storage, refreshed
// when they run out. Nothing here knows about screens.

import {
  exchangeCodeAsync,
  refreshAsync,
  TokenError,
  TokenResponse,
} from 'expo-auth-session';
import * as SecureStore from 'expo-secure-store';
import {
  OAUTH_CLIENT_ID,
  OAUTH_DISCOVERY,
  OAUTH_REDIRECT_URI,
  SITE_URL,
} from './config';

const STORE_KEY = 'portfoliofy.session';
// Refresh a little early so a token never runs out mid-request.
const EXPIRY_MARGIN_MS = 60_000;

interface StoredSession {
  accessToken: string;
  refreshToken: string;
  /** When the access token stops working, in ms since the epoch. */
  expiresAt: number;
}

let cached: StoredSession | null | undefined;
let refreshing: Promise<StoredSession | null> | null = null;
const expiredListeners = new Set<() => void>();

function toStored(response: TokenResponse): StoredSession | null {
  if (!response.refreshToken) return null;
  const issuedAtMs = (response.issuedAt ?? Date.now() / 1000) * 1000;
  return {
    accessToken: response.accessToken,
    refreshToken: response.refreshToken,
    expiresAt: issuedAtMs + (response.expiresIn ?? 3600) * 1000,
  };
}

async function save(session: StoredSession | null) {
  cached = session;
  if (session) {
    await SecureStore.setItemAsync(STORE_KEY, JSON.stringify(session));
  } else {
    await SecureStore.deleteItemAsync(STORE_KEY);
  }
}

async function load(): Promise<StoredSession | null> {
  if (cached !== undefined) return cached;
  try {
    const raw = await SecureStore.getItemAsync(STORE_KEY);
    cached = raw ? (JSON.parse(raw) as StoredSession) : null;
  } catch {
    // Unreadable storage is the same as signed out.
    cached = null;
  }
  return cached;
}

/** Tells the app the saved session no longer works, so it can show sign in. */
export function onSessionExpired(listener: () => void): () => void {
  expiredListeners.add(listener);
  return () => expiredListeners.delete(listener);
}

export async function hasSession(): Promise<boolean> {
  return (await load()) !== null;
}

/** Turns the code from the sign-in redirect into a saved session. */
export async function completeSignIn(code: string, codeVerifier: string) {
  const response = await exchangeCodeAsync(
    {
      clientId: OAUTH_CLIENT_ID,
      code,
      redirectUri: OAUTH_REDIRECT_URI,
      extraParams: { code_verifier: codeVerifier },
    },
    OAUTH_DISCOVERY,
  );
  const session = toStored(response);
  if (!session) throw new Error('Sign in did not return a session.');
  await save(session);
}

async function refresh(): Promise<StoredSession | null> {
  const current = await load();
  if (!current) return null;
  try {
    const response = await refreshAsync(
      { clientId: OAUTH_CLIENT_ID, refreshToken: current.refreshToken },
      OAUTH_DISCOVERY,
    );
    const next = toStored(response);
    if (!next) throw new Error('No refresh token returned.');
    await save(next);
    return next;
  } catch (error) {
    // Only an answer from the server that the token is no good ends the
    // session. Being offline, or a server hiccup, must not sign anyone out.
    if (!isRejected(error)) throw error;
    await save(null);
    expiredListeners.forEach((listener) => listener());
    return null;
  }
}

function isRejected(error: unknown): boolean {
  return (
    error instanceof TokenError &&
    ['invalid_grant', 'invalid_client'].includes(error.params?.error)
  );
}

/** One refresh at a time, however many requests found the token expired. */
export function refreshSession(): Promise<StoredSession | null> {
  refreshing ??= refresh().finally(() => {
    refreshing = null;
  });
  return refreshing;
}

/** The token to send with a request, refreshed first if it is about to expire. */
export async function getAccessToken(): Promise<string | null> {
  const session = await load();
  if (!session) return null;
  if (session.expiresAt - Date.now() > EXPIRY_MARGIN_MS) {
    return session.accessToken;
  }
  return (await refreshSession())?.accessToken ?? null;
}

/** Signs out here and, as far as possible, on the server. */
export async function endSession(): Promise<void> {
  const session = await load();
  await save(null);
  if (!session) return;
  try {
    await fetch(`${SITE_URL}/oauth/revoke`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        token: session.refreshToken,
        client_id: OAUTH_CLIENT_ID,
      }).toString(),
    });
  } catch {
    // Offline: the device is signed out, and the token expires on its own.
  }
}
