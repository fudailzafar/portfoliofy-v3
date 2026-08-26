/**
 * Extracts a displayable username from a given URL.
 * Handles common platforms like Twitter/X, GitHub, LinkedIn, Instagram, etc.
 */
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

  if (
    cleanLink.includes('.') &&
    !cleanLink.includes(' ') &&
    !cleanLink.startsWith('@')
  ) {
    return `https://${cleanLink}`;
  }

  const username = cleanLink.replace(/^@/, '');

  switch (platform.toLowerCase()) {
    case 'twitter':
    case 'x':
      return `https://x.com/${username}`;
    case 'linkedin':
      return `https://linkedin.com/in/${username}`;
    case 'github':
      return `https://github.com/${username}`;
    case 'instagram':
      return `https://instagram.com/${username}`;
    case 'threads':
      return `https://threads.net/@${username}`;
    case 'figma':
      return `https://figma.com/@${username}`;
    case 'bluesky':
      return `https://bsky.app/profile/${username}`;
    case 'mastodon':
      return `https://mastodon.social/@${username}`;
    default:
      return `https://${cleanLink}`;
  }
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
      domain.includes('bsky.app') // Bluesky typically uses bsky.app/profile/username
    ) {
      if (domain.includes('bsky.app') && parts[1] === 'profile') {
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
