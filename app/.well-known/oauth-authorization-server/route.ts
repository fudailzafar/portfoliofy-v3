import {
  getPublicOrigin,
  metadataCorsOptionsRequestHandler,
} from 'mcp-handler';
import { NextResponse } from 'next/server';
import { OAUTH_CORS_HEADERS, OAUTH_SCOPES } from '@/lib/server/oauth';

export function GET(req: Request) {
  const issuer = getPublicOrigin(req);
  return NextResponse.json(
    {
      issuer,
      authorization_endpoint: `${issuer}/oauth/authorize`,
      token_endpoint: `${issuer}/oauth/token`,
      registration_endpoint: `${issuer}/oauth/register`,
      response_types_supported: ['code'],
      grant_types_supported: ['authorization_code', 'refresh_token'],
      code_challenge_methods_supported: ['S256'],
      token_endpoint_auth_methods_supported: ['none'],
      scopes_supported: OAUTH_SCOPES,
    },
    { headers: OAUTH_CORS_HEADERS },
  );
}

export const OPTIONS = metadataCorsOptionsRequestHandler();
