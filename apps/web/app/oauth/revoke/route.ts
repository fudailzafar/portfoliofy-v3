import { NextResponse } from 'next/server';
import { isFirstPartyClient, revokeToken } from '@/lib/server/oauth';
import { checkRateLimit, getClientIp } from '@/lib/server/rateLimit';

const REVOKE_MAX_REQUESTS = 60;
const REVOKE_WINDOW_MS = 60 * 1000;

// RFC 7009 token revocation, for our own app's sign out. Answers 200 whether
// or not the token existed, so it can't be used to probe for valid tokens.
export async function POST(request: Request) {
  const { allowed } = await checkRateLimit(
    `oauth-revoke:${getClientIp(request)}`,
    REVOKE_MAX_REQUESTS,
    REVOKE_WINDOW_MS,
  );
  if (!allowed) {
    return NextResponse.json({ error: 'too_many_requests' }, { status: 429 });
  }

  const form = await request.formData().catch(() => null);
  const token = form?.get('token');
  const clientId = form?.get('client_id');
  if (
    typeof token !== 'string' ||
    typeof clientId !== 'string' ||
    !isFirstPartyClient(clientId)
  ) {
    return NextResponse.json({ error: 'invalid_request' }, { status: 400 });
  }

  try {
    await revokeToken(token, clientId);
  } catch (error) {
    console.error('Error revoking OAuth token:', error);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
  return new NextResponse(null, { status: 200 });
}
