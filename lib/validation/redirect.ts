const MAX_LENGTH = 2000;

/**
 * The one place an emailed sign-in link may send someone afterwards: the
 * connect screen for an AI app. Anything else is rejected, so a crafted link
 * can't redirect to another site.
 */
export function safeNextPath(input: unknown): string | null {
  if (typeof input !== 'string' || input.length > MAX_LENGTH) return null;
  if (!input.startsWith('/oauth/authorize?')) return null;
  // Control characters, spaces, backslashes and fragments have no place here.
  if (/[\s\\\u0000-\u001f#]/.test(input)) return null;

  try {
    const url = new URL(input, 'http://invalid.test');
    if (url.origin !== 'http://invalid.test') return null;
    if (url.pathname !== '/oauth/authorize') return null;
  } catch {
    return null;
  }
  return input;
}
