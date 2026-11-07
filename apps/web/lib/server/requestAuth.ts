// Who is calling an API route: a signed-in browser (session cookie) or our
// mobile app (a bearer token carrying the first-party scope). Tokens issued to
// other apps, such as MCP clients, don't carry that scope and don't work here.

import { headers } from 'next/headers';
import { auth } from '@/auth';
import { FIRST_PARTY_SCOPE, verifyAccessToken } from '@/lib/server/oauth';

export interface ApiSession {
  user: { id: string };
}

const BEARER = /^Bearer\s+(\S+)$/i;

async function readAuthorization(request?: Request): Promise<string | null> {
  if (request) return request.headers.get('authorization');
  try {
    return (await headers()).get('authorization');
  } catch {
    // Not inside a request, so there is no header to read.
    return null;
  }
}

export async function getApiSession(
  request?: Request,
): Promise<ApiSession | null> {
  const bearer = BEARER.exec((await readAuthorization(request)) ?? '');
  if (bearer) {
    // A bearer token that fails is a failure, never a fallback to the cookie.
    const info = await verifyAccessToken(bearer[1]);
    if (!info || !info.scopes.includes(FIRST_PARTY_SCOPE)) return null;
    return { user: { id: info.userId } };
  }

  const session = await auth();
  return session?.user?.id ? { user: { id: session.user.id } } : null;
}
