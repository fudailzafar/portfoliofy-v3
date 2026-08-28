import sanitizeHtml from 'sanitize-html';
import type { Resume } from './dbActions';

// Mirrors exactly what RichTextEditor can produce: paragraphs, bullet/ordered
// lists, links, and line breaks. Bold/italic/heading/code/blockquote are
// disabled in the editor config, so they are not allowed here either.
const RICH_TEXT_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: ['p', 'br', 'ul', 'ol', 'li', 'a'],
  allowedAttributes: { a: ['href', 'target', 'rel'] },
  allowedSchemes: ['http', 'https', 'mailto'],
  transformTags: {
    a: sanitizeHtml.simpleTransform('a', {
      target: '_blank',
      rel: 'noopener noreferrer nofollow',
    }),
  },
};

export function sanitizeRichText(html: string): string {
  return sanitizeHtml(html, RICH_TEXT_OPTIONS);
}

// Broader allowlist for an embedded page's body — mirrors what
// PageEditorView's richer Tiptap instance (headings, images, video,
// YouTube/Vimeo/Figma embeds) can actually produce. Iframes are locked to
// those three hostnames so this can't be used to embed arbitrary third-party
// content.
const PAGE_CONTENT_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    ...(RICH_TEXT_OPTIONS.allowedTags as string[]),
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'blockquote',
    'pre',
    'code',
    'strong',
    'em',
    's',
    'hr',
    'img',
    'video',
    'iframe',
    'div',
    'button',
  ],
  allowedAttributes: {
    a: ['href', 'target', 'rel', 'class', 'data-embed-provider'],
    img: ['src', 'alt', 'width', 'height', 'class', 'data-content-image'],
    video: [
      'src',
      'controls',
      'playsinline',
      'preload',
      'width',
      'height',
      'class',
      'data-content-video',
    ],
    iframe: [
      'src',
      'width',
      'height',
      'allow',
      'allowfullscreen',
      'frameborder',
      'class',
      'data-embed-provider',
    ],
    div: ['data-gallery', 'data-images', 'class'],
    button: ['type', 'data-src', 'class'],
  },
  allowedIframeHostnames: [
    'www.youtube.com',
    'player.vimeo.com',
    'www.figma.com',
  ],
  allowedSchemes: ['http', 'https', 'mailto'],
  transformTags: {
    a: sanitizeHtml.simpleTransform('a', {
      target: '_blank',
      rel: 'noopener noreferrer nofollow',
    }),
  },
};

export function sanitizePageContent(html: string): string {
  return sanitizeHtml(html, PAGE_CONTENT_OPTIONS);
}

const RICH_TEXT_FIELDS = ['summary', 'description'];

/**
 * Sanitizes every rich-text field on a resume before it is persisted.
 * Sanitizing on write (rather than on render) means the database never holds
 * untrusted markup, so any current or future render path is safe by default.
 */
export function sanitizeResumeData(resumeData: Resume['resumeData']) {
  if (!resumeData) return resumeData;

  // Clone the object so we don't mutate the original reference
  const sanitized = { ...resumeData } as any;

  // Dynamically traverse top-level keys
  for (const key of Object.keys(sanitized)) {
    const value = sanitized[key];

    // If it's a top level string (like summary)
    if (typeof value === 'string' && RICH_TEXT_FIELDS.includes(key)) {
      sanitized[key] = sanitizeRichText(value);
    }
    // pages is its own top-level array now (a page can be attached to more
    // than one section item, so it's no longer nested under any one item's
    // attachments) — its body gets the broader PAGE_CONTENT_OPTIONS
    // allowlist (headings, images, embeds) instead of sanitizeRichText.
    else if (key === 'pages' && Array.isArray(value)) {
      sanitized.pages = value.map((page: any) =>
        page && typeof page.content === 'string'
          ? { ...page, content: sanitizePageContent(page.content) }
          : page,
      );
    }
    // If it's an array of section items (like workExperience)
    else if (Array.isArray(value)) {
      sanitized[key] = value.map((item) => {
        if (typeof item === 'object' && item !== null) {
          const sanitizedItem = { ...item };
          // Loop through keys on the item (e.g. title, year, description)
          for (const itemKey of Object.keys(sanitizedItem)) {
            if (
              typeof sanitizedItem[itemKey] === 'string' &&
              RICH_TEXT_FIELDS.includes(itemKey)
            ) {
              sanitizedItem[itemKey] = sanitizeRichText(sanitizedItem[itemKey]);
            }
          }
          return sanitizedItem;
        }
        return item;
      });
    }
  }

  return sanitized as Resume['resumeData'];
}
