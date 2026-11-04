'use server';

import { auth } from '@/auth';
import { getUsernameById } from '@/lib/server/dbActions';
import {
  AuthorizationParams,
  buildRedirectUrl,
  createAuthorizationCode,
  validateAuthorization,
} from '@/lib/server/oauth';
import { requestOrigin } from '@/lib/server/requestOrigin';

export type ConsentResult = { redirectUrl: string } | { error: string };

// These return a URL rather than redirecting: the site's form-action policy
// blocks a form submission from ending up on another site.
export async function approveAuthorization(
  params: AuthorizationParams,
): Promise<ConsentResult> {
  const session = await auth();
  if (!session?.user?.id || !(await getUsernameById(session.user.id))) {
    return { error: 'Sign in to Portfoliofy first.' };
  }

  const result = await validateAuthorization(params, await requestOrigin());
  if ('error' in result) return result;

  const { valid } = result;
  const code = await createAuthorizationCode(session.user.id, valid);
  return {
    redirectUrl: buildRedirectUrl(valid.redirectUri, {
      code,
      state: valid.state,
      iss: await requestOrigin(),
    }),
  };
}

export async function denyAuthorization(
  params: AuthorizationParams,
): Promise<ConsentResult> {
  const result = await validateAuthorization(params, await requestOrigin());
  if ('error' in result) return result;

  return {
    redirectUrl: buildRedirectUrl(result.valid.redirectUri, {
      error: 'access_denied',
      state: result.valid.state,
    }),
  };
}
