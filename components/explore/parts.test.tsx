import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import type { ExploreUser } from '@/hooks/useExplore';
import { Member } from './parts';

const user = (over: Partial<ExploreUser> = {}): ExploreUser => ({
  username: 'asha',
  userImage: null,
  customImage: null,
  name: 'Asha Rao',
  shortAbout: 'Product Designer',
  location: 'Chennai, India',
  statusEmoji: null,
  statusText: 'Shipping a thing https://example.com/a/very/long/path/here',
  statusUpdatedAt: null,
  updatedAt: new Date().toISOString(),
  createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
  ...over,
});

const html = (props: Parameters<typeof Member>[0]) =>
  renderToStaticMarkup(<Member {...props} />);

describe('Member second line follows the tab', () => {
  it('New: only when they joined, no username', () => {
    const out = html({ user: user(), tab: 'new' });
    expect(out).toContain('Joined 3 days ago');
    expect(out).not.toContain('@asha');
  });
  it('A–Z: the title, or @username when there is none', () => {
    expect(html({ user: user(), tab: 'a-z' })).toContain('Product Designer');
    expect(html({ user: user({ shortAbout: '' }), tab: 'a-z' })).toContain(
      '@asha',
    );
  });
  it('Activity: the status with its link shortened', () => {
    const out = html({ user: user(), tab: 'activity' });
    expect(out).toContain('Shipping a thing example.com/a/very/long/p…');
  });
  it('Activity without a status falls back to title or @username', () => {
    expect(
      html({
        user: user({ statusText: null, shortAbout: null }),
        tab: 'activity',
      }),
    ).toContain('@asha');
  });
});

describe('Member while searching', () => {
  it('shows a matched title with the match in bold', () => {
    const out = html({ user: user(), tab: 'a-z', words: ['design'] });
    expect(out).toContain(
      '<strong class="font-medium text-theme-primary">Design</strong>er',
    );
    expect(out).not.toContain('Chennai');
  });
  it('shows a matched location', () => {
    const out = html({ user: user(), tab: 'new', words: ['chen'] });
    expect(out).toContain('>Chen</strong>nai, India');
    expect(out).not.toContain('Joined');
  });
  it('shows both when both matched', () => {
    const out = html({
      user: user(),
      tab: 'a-z',
      words: ['designer', 'chennai'],
    });
    expect(out).toContain('Designer</strong>');
    expect(out).toContain('Chennai</strong>, India');
  });
  it('falls back to the tab line when only the name matched', () => {
    expect(html({ user: user(), tab: 'new', words: ['asha'] })).toContain(
      'Joined 3 days ago',
    );
    expect(html({ user: user(), tab: 'a-z', words: ['asha'] })).toContain(
      'Product Designer',
    );
  });
});
