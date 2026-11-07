import { EditError } from './profileEdits';

export interface McpContext {
  http?: { authInfo?: { scopes?: string[]; extra?: unknown } };
}

export function jsonResult(data: unknown) {
  return {
    content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
  };
}

export function errorResult(message: string) {
  return { content: [{ type: 'text' as const, text: message }], isError: true };
}

/** The signed-in user, once the token is known to carry `scope`. */
export function requireUser(ctx: McpContext, scope: string): string {
  const authInfo = ctx.http?.authInfo;
  const extra = authInfo?.extra as { userId?: string } | undefined;
  if (!extra?.userId) throw new Error('Not signed in');
  if (!authInfo?.scopes?.includes(scope)) {
    throw new EditError(
      'This connection does not have permission for that. Disconnect Portfoliofy in this app and connect it again.',
    );
  }
  return extra.userId;
}
