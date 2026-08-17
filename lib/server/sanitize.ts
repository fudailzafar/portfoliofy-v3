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
