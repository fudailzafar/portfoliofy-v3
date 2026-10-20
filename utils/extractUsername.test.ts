import { describe, it, expect } from 'vitest';
import { extractUsername, buildContactUrl } from './extractUsername';

describe('extractUsername', () => {
  describe('Standard URLs', () => {
    it('should extract username from standard twitter URL', () => {
      expect(extractUsername('https://twitter.com/johndoe')).toBe('johndoe');
      expect(extractUsername('http://x.com/johndoe')).toBe('johndoe');
    });

    it('should extract username from linkedin URL', () => {
      expect(extractUsername('https://linkedin.com/in/johndoe')).toBe(
        'johndoe',
      );
      expect(extractUsername('www.linkedin.com/company/acme')).toBe('acme');
    });

    it('should extract username from github URL', () => {
      expect(extractUsername('https://github.com/johndoe')).toBe('johndoe');
    });

    it('should extract username from instagram URL', () => {
      expect(extractUsername('https://instagram.com/johndoe')).toBe('johndoe');
    });

    it('should extract username from threads URL', () => {
      expect(extractUsername('https://threads.net/@johndoe')).toBe('@johndoe');
    });

    it('should extract username from bluesky URL', () => {
      expect(
        extractUsername('https://bsky.app/profile/johndoe.bsky.social'),
      ).toBe('johndoe.bsky.social');
    });

    it('should extract username from mastodon URL', () => {
      expect(extractUsername('https://mastodon.social/@johndoe')).toBe(
        '@johndoe',
      );
    });
  });

  describe('Edge Case URLs', () => {
    it('should handle trailing slashes', () => {
      expect(extractUsername('https://github.com/johndoe/')).toBe('johndoe');
      expect(extractUsername('linkedin.com/in/johndoe///')).toBe('johndoe');
    });

    it('should handle deep paths by returning the first valid segment', () => {
      // For GitHub/Twitter it should grab the immediate username after the domain
      expect(extractUsername('https://github.com/johndoe/repo/issues')).toBe(
        'johndoe',
      );
      expect(extractUsername('https://twitter.com/johndoe/status/123')).toBe(
        'johndoe',
      );
    });

    it('should handle queries and fragments gracefully', () => {
      expect(
        extractUsername('https://linkedin.com/in/johndoe?source=mobile'),
      ).toBe('johndoe?source=mobile'); // Note: The current function doesn't strip queries, this test asserts current behavior
    });
  });

  describe('Broken URLs and Raw Input', () => {
    it('should return empty string for falsy input', () => {
      expect(extractUsername('')).toBe('');
    });

    it('should return raw username if no domain is provided', () => {
      expect(extractUsername('johndoe')).toBe('johndoe');
      expect(extractUsername('@johndoe')).toBe('@johndoe');
    });

    it('should handle whitespace', () => {
      expect(extractUsername('  https://github.com/johndoe  ')).toBe('johndoe');
    });
  });

  describe('Emails and Domains', () => {
    it('should extract email address', () => {
      expect(extractUsername('mailto:john@example.com')).toBe(
        'john@example.com',
      );
      expect(extractUsername('john@example.com')).toBe('john@example.com');
    });

    it('should extract personal domain', () => {
      expect(extractUsername('https://johndoe.com')).toBe('johndoe.com');
      expect(extractUsername('www.johndoe.com')).toBe('johndoe.com');
    });
  });
});

describe('buildContactUrl', () => {
  describe('Email handling', () => {
    it('should handle email platforms', () => {
      expect(buildContactUrl('john@example.com', 'email')).toBe(
        'mailto:john@example.com',
      );
    });

    it('should auto-detect emails without protocol', () => {
      expect(buildContactUrl('john@example.com', 'unknown')).toBe(
        'mailto:john@example.com',
      );
    });

    it('should preserve existing mailto', () => {
      expect(buildContactUrl('mailto:john@example.com', 'email')).toBe(
        'mailto:john@example.com',
      );
    });
  });

  describe('Platform Formatting', () => {
    it('should format twitter/x URLs', () => {
      expect(buildContactUrl('johndoe', 'twitter')).toBe(
        'https://x.com/johndoe',
      );
      expect(buildContactUrl('@johndoe', 'x')).toBe('https://x.com/johndoe');
    });

    it('should format linkedin URLs', () => {
      expect(buildContactUrl('johndoe', 'linkedin')).toBe(
        'https://linkedin.com/in/johndoe',
      );
    });

    it('should format threads and figma with @ symbol', () => {
      expect(buildContactUrl('johndoe', 'threads')).toBe(
        'https://threads.net/@johndoe',
      );
      expect(buildContactUrl('johndoe', 'figma')).toBe(
        'https://figma.com/@johndoe',
      );
    });
  });

  describe('Edge cases', () => {
    it('should preserve full URLs if provided', () => {
      expect(buildContactUrl('https://twitter.com/johndoe', 'twitter')).toBe(
        'https://twitter.com/johndoe',
      );
      expect(buildContactUrl('http://mysite.com', 'website')).toBe(
        'http://mysite.com',
      );
    });

    it('should handle domains passed directly', () => {
      expect(buildContactUrl('mysite.com', 'website')).toBe(
        'https://mysite.com',
      );
    });

    it('should fallback cleanly for unknown platforms', () => {
      expect(buildContactUrl('johndoe', 'mysocial')).toBe('https://johndoe');
    });
  });
});

describe('additional contact platforms', () => {
  const cases: [string, string, string, string][] = [
    ['Facebook', 'johndoe', 'https://facebook.com/johndoe', 'johndoe'],
    ['Dribbble', 'johndoe', 'https://dribbble.com/johndoe', 'johndoe'],
    ['Are.na', 'john-doe', 'https://are.na/john-doe', 'john-doe'],
    ['Telegram', 'johndoe', 'https://t.me/johndoe', 'johndoe'],
    ['Twitch', 'johndoe', 'https://twitch.tv/johndoe', 'johndoe'],
    ['Itch', 'johndoe', 'https://johndoe.itch.io', 'johndoe'],
    ['Vimeo', 'johndoe', 'https://vimeo.com/johndoe', 'johndoe'],
    ['TikTok', 'johndoe', 'https://tiktok.com/@johndoe', '@johndoe'],
    ['VSCO', 'johndoe', 'https://vsco.co/johndoe', 'johndoe'],
    ['Honk', 'johndoe', 'https://honk.me/johndoe', 'johndoe'],
    ['YouTube', 'johndoe', 'https://youtube.com/@johndoe', '@johndoe'],
  ];

  it.each(cases)(
    'builds a %s link and shows the handle',
    (platform, handle, url, shown) => {
      expect(buildContactUrl(handle, platform)).toBe(url);
      expect(buildContactUrl(`@${handle}`, platform)).toBe(url);
      expect(extractUsername(url, platform)).toBe(shown);
    },
  );

  it('keeps a pasted profile URL as is', () => {
    expect(buildContactUrl('https://www.tiktok.com/@johndoe', 'TikTok')).toBe(
      'https://www.tiktok.com/@johndoe',
    );
    expect(extractUsername('https://m.facebook.com/johndoe/')).toBe('johndoe');
  });

  it('names older YouTube channel links', () => {
    expect(extractUsername('https://www.youtube.com/c/JohnDoe')).toBe(
      'JohnDoe',
    );
    expect(extractUsername('https://youtube.com/user/johndoe/videos')).toBe(
      'johndoe',
    );
    expect(extractUsername('https://m.youtube.com/@johndoe')).toBe('@johndoe');
  });

  it('reads the itch.io username from the subdomain', () => {
    expect(extractUsername('https://johndoe.itch.io/my-game')).toBe('johndoe');
  });
});

describe('handles containing dots', () => {
  it('treats them as usernames on known platforms', () => {
    expect(buildContactUrl('john.doe', 'Instagram')).toBe(
      'https://instagram.com/john.doe',
    );
    expect(buildContactUrl('john.doe', 'TikTok')).toBe(
      'https://tiktok.com/@john.doe',
    );
    expect(buildContactUrl('johndoe.bsky.social', 'Bluesky')).toBe(
      'https://bsky.app/profile/johndoe.bsky.social',
    );
  });

  it('still treats a bare domain as a website for other types', () => {
    expect(buildContactUrl('johndoe.com', 'Website')).toBe(
      'https://johndoe.com',
    );
    expect(buildContactUrl('instagram.com/johndoe', 'Instagram')).toBe(
      'https://instagram.com/johndoe',
    );
  });
});
