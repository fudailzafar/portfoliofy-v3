import {
  getPublicOrigin,
  metadataCorsOptionsRequestHandler,
  protectedResourceHandler,
} from 'mcp-handler';
import { MCP_PATH } from '@/lib/server/oauth';

export function GET(req: Request) {
  const origin = getPublicOrigin(req);
  return protectedResourceHandler({
    authServerUrls: [origin],
    resourceUrl: `${origin}${MCP_PATH}`,
  })(req);
}

export const OPTIONS = metadataCorsOptionsRequestHandler();
