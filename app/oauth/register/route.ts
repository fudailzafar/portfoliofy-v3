import { NextResponse } from 'next/server';
import { z } from 'zod';
import {
  isAllowedRedirectUri,
  OAUTH_CORS_HEADERS,
  registerClient,
} from '@/lib/server/oauth';
import { checkRateLimit, getClientIp } from '@/lib/server/rateLimit';

const REGISTER_MAX_REQUESTS = 20;
const REGISTER_WINDOW_MS = 60 * 60 * 1000; // 1 hour

const RegistrationSchema = z.object({
  client_name: z.string().trim().min(1).max(100).optional(),
  redirect_uris: z.array(z.string().max(2000)).min(1).max(10),
});

function errorResponse(error: string, description: string, status = 400) {
  return NextResponse.json(
    { error, error_description: description },
    { status, headers: OAUTH_CORS_HEADERS },
  );
}

export async function POST(request: Request) {
  const { allowed } = await checkRateLimit(
    `oauth-register:${getClientIp(request)}`,
    REGISTER_MAX_REQUESTS,
    REGISTER_WINDOW_MS,
  );
  if (!allowed) {
    return errorResponse('too_many_requests', 'Try again later.', 429);
  }

  const parsed = RegistrationSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success) {
    return errorResponse(
      'invalid_client_metadata',
      'redirect_uris is required.',
    );
  }

  const { client_name, redirect_uris } = parsed.data;
  if (!redirect_uris.every(isAllowedRedirectUri)) {
    return errorResponse(
      'invalid_redirect_uri',
      'Redirect URIs must use HTTPS, a loopback address or an app scheme.',
    );
  }

  try {
    const client = await registerClient(
      client_name ?? 'Unknown app',
      redirect_uris,
    );
    return NextResponse.json(
      {
        client_id: client.clientId,
        client_id_issued_at: Math.floor(Date.now() / 1000),
        client_name: client.clientName,
        redirect_uris: client.redirectUris,
        grant_types: ['authorization_code', 'refresh_token'],
        response_types: ['code'],
        token_endpoint_auth_method: 'none',
      },
      { status: 201, headers: OAUTH_CORS_HEADERS },
    );
  } catch (error) {
    console.error('Error registering OAuth client:', error);
    return errorResponse('server_error', 'Could not register the app.', 500);
  }
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: OAUTH_CORS_HEADERS });
}
