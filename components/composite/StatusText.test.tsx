import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { StatusText } from './StatusText';

describe('StatusText links', () => {
  it('shows a short address but links to the full one', () => {
    const html = renderToStaticMarkup(
      <StatusText text="Happy Monday everyone — https://www.nts.live/shows/the-do-your-thing" />,
    );
    expect(html).toContain(
      'href="https://www.nts.live/shows/the-do-your-thing"',
    );
    expect(html).toContain('>nts.live/shows/the-do-you…</a>');
    expect(html).not.toContain('>https://');
  });
});
