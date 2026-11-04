import { createMcpHandler, getPublicOrigin, withMcpAuth } from 'mcp-handler';
import { NextResponse } from 'next/server';
import { registerReadTools } from '@/lib/server/mcp/readTools';
import { registerWriteTools } from '@/lib/server/mcp/writeTools';
import { MCP_PATH, verifyAccessToken } from '@/lib/server/oauth';
import { checkRateLimit } from '@/lib/server/rateLimit';

const MCP_MAX_REQUESTS = 120;
const MCP_WINDOW_MS = 60 * 1000;

const handler = createMcpHandler(
  (server) => {
    registerReadTools(server);
    registerWriteTools(server);
  },
  { serverInfo: { name: 'portfoliofy', version: '1.0.0' } },
);

async function rateLimited(req: Request): Promise<Response> {
  const { userId } = req.auth?.extra as { userId: string };
  const { allowed, retryAfterMs } = await checkRateLimit(
    `mcp:${userId}`,
    MCP_MAX_REQUESTS,
    MCP_WINDOW_MS,
  );
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many requests — please try again shortly.' },
      {
        status: 429,
        headers: { 'Retry-After': String(Math.ceil(retryAfterMs / 1000)) },
      },
    );
  }
  return handler(req);
}

const authedHandler = withMcpAuth(
  rateLimited,
  async (req, bearerToken) => {
    if (!bearerToken) return undefined;
    const info = await verifyAccessToken(bearerToken);
    if (!info) return undefined;

    // A token issued for another server must not work here.
    const resource = `${getPublicOrigin(req)}${MCP_PATH}`;
    if (info.resource && info.resource !== resource) return undefined;

    return {
      token: bearerToken,
      clientId: info.clientId,
      scopes: info.scopes,
      expiresAt: info.expiresAt,
      extra: { userId: info.userId },
    };
  },
  // Scopes are checked per tool. Naming them here would make the 401 tell
  // apps to request only those, instead of reading scopes_supported.
  { required: true },
);

export { authedHandler as GET, authedHandler as POST, authedHandler as DELETE };
