import { Node, mergeAttributes } from '@tiptap/react';

export type EmbedProvider = 'youtube' | 'vimeo' | 'figma' | 'twitter';

export interface EmbedParseResult {
  provider: EmbedProvider;
  src: string;
}

/**
 * Resolves a pasted URL to a known embed provider. Twitter/X has no public
 * iframe embed (their real embed needs platform.twitter.com/widgets.js,
 * third-party JS we don't want executing inside saved page content), so its
 * "src" is just the original tweet URL and it renders as a static link card
 * instead of a live embed.
 */
export function parseEmbedUrl(rawUrl: string): EmbedParseResult | null {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^www\./, '');

  if (
    host === 'youtube.com' ||
    host === 'youtu.be' ||
    host === 'm.youtube.com'
  ) {
    let videoId: string | null = null;
    if (host === 'youtu.be') {
      videoId = url.pathname.slice(1);
    } else if (url.pathname.startsWith('/embed/')) {
      videoId = url.pathname.slice('/embed/'.length);
    } else if (url.pathname.startsWith('/shorts/')) {
      videoId = url.pathname.slice('/shorts/'.length);
    } else {
      videoId = url.searchParams.get('v');
    }
    videoId = videoId ? videoId.split(/[?&/]/)[0] : null;
    if (!videoId) return null;
    return {
      provider: 'youtube',
      src: `https://www.youtube.com/embed/${videoId}`,
    };
  }

  if (host === 'vimeo.com' || host === 'player.vimeo.com') {
    const match = url.pathname.match(/(\d+)/);
    if (!match) return null;
    return {
      provider: 'vimeo',
      src: `https://player.vimeo.com/video/${match[1]}`,
    };
  }

  if (host === 'figma.com') {
    return {
      provider: 'figma',
      src: `https://www.figma.com/embed?embed_host=portfoliofy&url=${encodeURIComponent(rawUrl)}`,
    };
  }

  if (host === 'twitter.com' || host === 'x.com') {
    return { provider: 'twitter', src: rawUrl };
  }

  return null;
}

export const Embed = Node.create({
  name: 'embed',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      provider: { default: null },
      src: { default: null },
    };
  },

  parseHTML() {
    return [
      { tag: 'iframe[data-embed-provider]' },
      { tag: 'a[data-embed-provider]' },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const { provider, src } = HTMLAttributes;

    if (provider === 'twitter') {
      return [
        'a',
        mergeAttributes({
          'data-embed-provider': provider,
          class: 'embed-tweet-card',
          href: src,
          target: '_blank',
          rel: 'noopener noreferrer',
        }),
        `View post on X: ${src}`,
      ];
    }

    return [
      'iframe',
      mergeAttributes({
        'data-embed-provider': provider,
        class: 'embed-iframe',
        src,
        frameborder: '0',
        allow: 'autoplay; fullscreen; picture-in-picture; encrypted-media',
        allowfullscreen: 'true',
      }),
    ];
  },
});
