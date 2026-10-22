import { describe, expect, it } from 'vitest';
import { serializeJsonLd } from './jsonLd';
describe('serializeJsonLd', () => {
  it('cannot close the script tag', () => {
    const out = serializeJsonLd({ name: '</script><script>alert(1)</script>' });
    expect(out).not.toContain('<');
    expect(out).not.toContain('>');
    expect(JSON.parse(out).name).toBe('</script><script>alert(1)</script>');
  });

  it('escapes ampersands and line separators', () => {
    const out = serializeJsonLd({ a: 'x & y z' });
    expect(out).toContain('\\u0026');
    expect(out).toContain('\\u2028');
    expect(JSON.parse(out).a).toBe('x & y z');
  });
});
