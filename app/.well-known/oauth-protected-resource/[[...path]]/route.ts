import {
  generateProtectedResourceMetadata,
  getPublicOrigin,
  metadataCorsOptionsRequestHandler,
} from 'mcp-handler';
import { NextResponse } from 'next/server';
import { MCP_PATH, OAUTH_CORS_HEADERS, OAUTH_SCOPES } from '@/lib/server/oauth';

export function GET(req: Request) {
  const origin = getPublicOrigin(req);
  return NextResponse.json(
    generateProtectedResourceMetadata({
      authServerUrls: [origin],
      resourceUrl: `${origin}${MCP_PATH}`,
      additionalMetadata: { scopes_supported: OAUTH_SCOPES },
    }),
    { headers: OAUTH_CORS_HEADERS },
  );
}

export const OPTIONS = metadataCorsOptionsRequestHandler();
