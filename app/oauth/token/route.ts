import { NextResponse } from 'next/server';
import {
  exchangeAuthorizationCode,
  OAUTH_CORS_HEADERS,
  refreshTokens,
  TokenResponse,
} from '@/lib/server/oauth';
import { checkRateLimit, getClientIp } from '@/lib/server/rateLimit';

const TOKEN_MAX_REQUESTS = 60;
const TOKEN_WINDOW_MS = 60 * 1000;

const TOKEN_HEADERS = { ...OAUTH_CORS_HEADERS, 'Cache-Control': 'no-store' };

function errorResponse(error: string, status = 400) {
  return NextResponse.json({ error }, { status, headers: TOKEN_HEADERS });
}

export async function POST(request: Request) {
  const { allowed } = await checkRateLimit(
    `oauth-token:${getClientIp(request)}`,
    TOKEN_MAX_REQUESTS,
    TOKEN_WINDOW_MS,
  );
  if (!allowed) return errorResponse('too_many_requests', 429);

  const form = await request.formData().catch(() => null);
  const field = (name: string) => {
    const value = form?.get(name);
    return typeof value === 'string' ? value : '';
  };
  const clientId = field('client_id');
  if (!clientId) return errorResponse('invalid_client', 401);

  try {
    let tokens: TokenResponse | null;
    switch (field('grant_type')) {
      case 'authorization_code':
        tokens = await exchangeAuthorizationCode(
          field('code'),
          clientId,
          field('redirect_uri'),
          field('code_verifier'),
        );
        break;
      case 'refresh_token':
        tokens = await refreshTokens(field('refresh_token'), clientId);
        break;
      default:
        return errorResponse('unsupported_grant_type');
    }

    if (!tokens) return errorResponse('invalid_grant');
    return NextResponse.json(tokens, { headers: TOKEN_HEADERS });
  } catch (error) {
    console.error('Error issuing OAuth tokens:', error);
    return errorResponse('server_error', 500);
  }
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: OAUTH_CORS_HEADERS });
}
