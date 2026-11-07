import { describe, expect, it } from 'vitest';
import { safeNextPath } from './redirect';

describe('safeNextPath', () => {
  it('accepts the connect screen with its query', () => {
    const path =
      '/oauth/authorize?client_id=pfy_1&state=a%20b&code_challenge=x';
    expect(safeNextPath(path)).toBe(path);
  });

  it.each([
    ['another site', 'https://evil.com/oauth/authorize?x=1'],
    ['protocol-relative', '//evil.com/oauth/authorize?x=1'],
    ['another page', '/api/user?x=1'],
    ['a longer path', '/oauth/authorize/../../api?x=1'],
    ['no query', '/oauth/authorize'],
    ['a backslash', '/oauth/authorize?x=1\\evil'],
    ['a fragment', '/oauth/authorize?x=1#frag'],
    ['whitespace', '/oauth/authorize?x=1 2'],
    ['a newline', '/oauth/authorize?x=1\n2'],
    ['not a string', 42],
    ['too long', `/oauth/authorize?${'a'.repeat(2100)}`],
  ])('rejects %s', (_name, value) => {
    expect(safeNextPath(value)).toBeNull();
  });
});
