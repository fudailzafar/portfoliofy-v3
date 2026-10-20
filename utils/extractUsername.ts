// Options in the contact type picker, in display order. 'Custom' takes a
// platform name and full URL; every other type is a handle or address.
export const CONTACT_PLATFORMS = [
  'Custom',
  'Website',
  'Email',
  'Are.na',
  'Bluesky',
  'Dribbble',
  'Facebook',
  'Figma',
  'GitHub',
  'Honk',
  'Instagram',
  'Itch',
  'LinkedIn',
  'Mastodon',
  'Telegram',
  'Threads',
  'TikTok',
  'Twitch',
  'VSCO',
  'Vimeo',
  'X',
  'YouTube',
] as const;

const HANDLE_URLS: Record<string, (username: string) => string> = {
  twitter: (u) => `https://x.com/${u}`,
  x: (u) => `https://x.com/${u}`,
  linkedin: (u) => `https://linkedin.com/in/${u}`,
  github: (u) => `https://github.com/${u}`,
  instagram: (u) => `https://instagram.com/${u}`,
  threads: (u) => `https://threads.net/@${u}`,
  figma: (u) => `https://figma.com/@${u}`,
  bluesky: (u) => `https://bsky.app/profile/${u}`,
  mastodon: (u) => `https://mastodon.social/@${u}`,
  facebook: (u) => `https://facebook.com/${u}`,
  dribbble: (u) => `https://dribbble.com/${u}`,
  'are.na': (u) => `https://are.na/${u}`,
  telegram: (u) => `https://t.me/${u}`,
  twitch: (u) => `https://twitch.tv/${u}`,
  itch: (u) => `https://${u}.itch.io`,
  vimeo: (u) => `https://vimeo.com/${u}`,
  tiktok: (u) => `https://tiktok.com/@${u}`,
  vsco: (u) => `https://vsco.co/${u}`,
  honk: (u) => `https://honk.me/${u}`,
  youtube: (u) => `https://youtube.com/@${u}`,
};

// Profile hosts whose first path segment is the username.
const HANDLE_DOMAINS = [
  'facebook.com',
  'dribbble.com',
  'are.na',
  't.me',
  'twitch.tv',
  'vimeo.com',
  'tiktok.com',
  'vsco.co',
  'honk.me',
];

export function buildContactUrl(link: string, platform: string): string {
  if (!link) return '';

  const cleanLink = link.trim();

  if (
    cleanLink.toLowerCase().startsWith('http://') ||
    cleanLink.toLowerCase().startsWith('https://')
  ) {
    return cleanLink;
  }

  if (cleanLink.toLowerCase().startsWith('mailto:')) {
    return cleanLink;
  }

  if (
    platform.toLowerCase() === 'email' ||
    (cleanLink.includes('@') &&
      !cleanLink.startsWith('@') &&
      !cleanLink.includes('://') &&
      !platform.toLowerCase().match(/mastodon|bluesky/))
  ) {
    return `mailto:${cleanLink}`;
  }

  // A bare handle on a known platform, even one with dots (john.doe,
  // name.bsky.social), is a username rather than a domain.
  const toProfileUrl = HANDLE_URLS[platform.toLowerCase()];
  if (toProfileUrl && !cleanLink.includes('/')) {
    return toProfileUrl(cleanLink.replace(/^@/, ''));
  }

  return `https://${cleanLink}`;
}

export function extractUsername(url: string, _platform?: string): string {
  if (!url) return '';

  // Clean up the URL
  let cleanUrl = url.trim();

  // If it's an email, just return the email address without mailto:
  if (cleanUrl.toLowerCase().startsWith('mailto:')) {
    return cleanUrl.substring(7);
  }

  // If it looks like a raw email address, return it
  if (cleanUrl.includes('@') && !cleanUrl.includes('://')) {
    return cleanUrl;
  }

  // Remove protocol
  cleanUrl = cleanUrl.replace(/^https?:\/\//i, '');

  // Remove www.
  cleanUrl = cleanUrl.replace(/^www\./i, '');

  // Remove trailing slashes
  cleanUrl = cleanUrl.replace(/\/+$/, '');

  // itch.io puts the username in the subdomain.
  const itch = cleanUrl.match(/^([^./]+)\.itch\.io(?:\/|$)/i);
  if (itch) {
    return itch[1];
  }

  // If it's just a domain (like a personal website), return the domain
  if (!cleanUrl.includes('/')) {
    return cleanUrl;
  }

  // Platform specific parsing
  try {
    const parts = cleanUrl.split('/');
    const domain = parts[0].toLowerCase();

    // For standard social media (domain.com/username)
    if (
      domain.includes('twitter.com') ||
      domain.includes('x.com') ||
      domain.includes('github.com') ||
      domain.includes('instagram.com') ||
      domain.includes('threads.net') ||
      domain.includes('figma.com') ||
      domain.includes('bsky.app') || // Bluesky typically uses bsky.app/profile/username
      HANDLE_DOMAINS.some((d) => domain === d || domain.endsWith(`.${d}`))
    ) {
      if (domain.includes('bsky.app') && parts[1] === 'profile') {
        return parts[2] || parts[1];
      }
      return parts[1] || parts[0];
    }

    // For YouTube: youtube.com/@handle, or older /c/, /channel/ and /user/ links
    if (domain === 'youtube.com' || domain.endsWith('.youtube.com')) {
      if (['c', 'channel', 'user'].includes(parts[1])) {
        return parts[2] || parts[1];
      }
      return parts[1] || parts[0];
    }

    // For LinkedIn (linkedin.com/in/username)
    if (domain.includes('linkedin.com')) {
      if (parts[1] === 'in' || parts[1] === 'company') {
        return parts[2] || parts[1];
      }
      return parts[1] || parts[0];
    }

    // For Mastodon it varies widely, usually domain/@username
    if (parts[1] && parts[1].startsWith('@')) {
      return parts[1]; // Keep the @ for mastodon
    }

    // Default fallback: just return the last segment of the path
    return parts[parts.length - 1] || cleanUrl;
  } catch (e) {
    return cleanUrl;
  }
}
