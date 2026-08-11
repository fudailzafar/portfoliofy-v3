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

function sanitizeDescriptions<T extends { description?: string }>(
  items: T[] | undefined,
): T[] | undefined {
  if (!items) return items;
  return items.map((item) =>
    typeof item.description === 'string'
      ? { ...item, description: sanitizeRichText(item.description) }
      : item,
  );
}

/**
 * Sanitizes every rich-text field on a resume before it is persisted.
 * Sanitizing on write (rather than on render) means the database never holds
 * untrusted markup, so any current or future render path is safe by default.
 */
export function sanitizeResumeData(resumeData: Resume['resumeData']) {
  if (!resumeData) return resumeData;

  return {
    ...resumeData,
    summary:
      typeof resumeData.summary === 'string'
        ? sanitizeRichText(resumeData.summary)
        : resumeData.summary,
    workExperience: sanitizeDescriptions(resumeData.workExperience),
    education: sanitizeDescriptions(resumeData.education),
    projects: sanitizeDescriptions(resumeData.projects),
    sideProjects: sanitizeDescriptions(resumeData.sideProjects),
    speaking: sanitizeDescriptions(resumeData.speaking),
    writing: sanitizeDescriptions(resumeData.writing),
    exhibitions: sanitizeDescriptions(resumeData.exhibitions),
    features: sanitizeDescriptions(resumeData.features),
    volunteering: sanitizeDescriptions(resumeData.volunteering),
    awards: sanitizeDescriptions(resumeData.awards),
    certifications: sanitizeDescriptions(resumeData.certifications),
  };
}
