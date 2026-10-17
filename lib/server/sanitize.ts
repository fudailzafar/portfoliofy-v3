import sanitizeHtml from 'sanitize-html';
import type { Resume } from './dbActions';

// Must match what RichTextEditor can produce.
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

// Must match what PageEditorView can produce. Iframes are limited to YouTube,
// Vimeo and Figma so embeds can't load arbitrary sites.
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
    'figure',
    'figcaption',
  ],
  allowedAttributes: {
    a: ['href', 'target', 'rel', 'class', 'data-embed-provider'],
    img: ['src', 'alt', 'width', 'height', 'class', 'data-content-image'],
    figure: ['data-content-image', 'data-content-video', 'class'],
    figcaption: ['class'],
    video: [
      'src',
      'controls',
      'autoplay',
      'muted',
      'loop',
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

// Sanitized on write, so stored markup is always safe to render.
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
    // Page bodies allow richer markup (headings, images, embeds).
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
