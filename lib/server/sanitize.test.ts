import { describe, it, expect } from 'vitest';
import { sanitizeRichText, sanitizeResumeData } from './sanitize';

describe('sanitizeRichText', () => {
  it('strips script tags', () => {
    expect(sanitizeRichText('<script>alert(document.cookie)</script>')).toBe('');
  });

  it('strips event handler attributes', () => {
    expect(sanitizeRichText('<img src=x onerror=alert(1)>')).toBe('');
    expect(sanitizeRichText('<p onclick="alert(1)">Hi</p>')).toBe('<p>Hi</p>');
  });

  it('strips javascript: URLs on links', () => {
    const out = sanitizeRichText('<a href="javascript:alert(1)">click</a>');
    expect(out).not.toContain('javascript:');
  });

  it('strips iframes and svg-based vectors', () => {
    expect(sanitizeRichText('<iframe src="https://evil.com"></iframe>')).toBe('');
    expect(sanitizeRichText('<svg onload=alert(1)>')).toBe('');
  });

  it('preserves everything RichTextEditor actually produces', () => {
    const out = sanitizeRichText(
      '<p>Built <a href="https://example.com">the thing</a></p><ul><li>bullet one</li></ul>',
    );
    expect(out).toContain('Built');
    expect(out).toContain('href="https://example.com"');
    expect(out).toContain('<li>bullet one</li>');
  });

  it('forces safe rel/target on links regardless of input', () => {
    const out = sanitizeRichText('<a href="https://example.com">link</a>');
    expect(out).toContain('target="_blank"');
    expect(out).toContain('rel="noopener noreferrer nofollow"');
  });
});

describe('sanitizeResumeData', () => {
  it('sanitizes summary and every list section\'s description', () => {
    const result = sanitizeResumeData({
      summary: '<script>alert(1)</script>Safe summary',
      workExperience: [
        {
          company: 'Acme',
          title: 'Engineer',
          location: 'Remote',
          start: '2020',
          description: '<img src=x onerror=alert(1)>Built things',
          hidden: false,
          attachments: [],
        },
      ],
      awards: [
        {
          title: 'Award',
          description: '<script>alert(2)</script>Won an award',
          hidden: false,
        },
      ],
    } as any);

    if (!result) throw new Error('expected sanitizeResumeData to return a value');

    expect(result.summary).toBe('Safe summary');
    expect(result.workExperience?.[0].description).toBe('Built things');
    expect(result.awards?.[0].description).toBe('Won an award');
    // Non-rich-text fields are untouched.
    expect(result.workExperience?.[0].company).toBe('Acme');
  });

  it('passes through nullish resumeData unchanged', () => {
    expect(sanitizeResumeData(undefined as any)).toBeUndefined();
    expect(sanitizeResumeData(null as any)).toBeNull();
  });
});
