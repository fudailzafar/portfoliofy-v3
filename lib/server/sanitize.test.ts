import { describe, it, expect } from 'vitest';
import {
  sanitizeRichText,
  sanitizePageContent,
  sanitizeResumeData,
} from './sanitize';

describe('sanitizeRichText', () => {
  it('strips script tags', () => {
    expect(sanitizeRichText('<script>alert(document.cookie)</script>')).toBe(
      '',
    );
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
    expect(sanitizeRichText('<iframe src="https://evil.com"></iframe>')).toBe(
      '',
    );
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
  it("sanitizes summary and every list section's description", () => {
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

    if (!result)
      throw new Error('expected sanitizeResumeData to return a value');

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

  it("sanitizes a page's content with the broader page allowlist", () => {
    const result = sanitizeResumeData({
      pages: [
        {
          id: 'page-1',
          url: 'https://example.com/thumb.png',
          type: 'page',
          title: 'My Deep Dive',
          slug: 'my-deep-dive',
          content:
            '<h1>Title</h1><script>alert(1)</script><img src=x onerror=alert(1)>',
        },
      ],
      workExperience: [
        {
          company: 'Acme',
          title: 'Engineer',
          location: 'Remote',
          start: '2020',
          description: '',
          hidden: false,
          // A page-type entry here is just a reference stub — no content
          // to sanitize, so it should pass through untouched.
          attachments: [{ id: 'page-1', type: 'page' }],
        },
      ],
    } as any);

    if (!result)
      throw new Error('expected sanitizeResumeData to return a value');
    const page = result.pages?.[0] as any;

    expect(page.content).toContain('<h1>Title</h1>');
    expect(page.content).not.toContain('<script>');
    expect(page.content).not.toContain('onerror');
    // The reference stub in the item's attachments is untouched.
    expect(result.workExperience?.[0].attachments).toEqual([
      { id: 'page-1', type: 'page' },
    ]);
  });
});

describe('sanitizePageContent', () => {
  it('allows headings, images, and hostname-locked iframes', () => {
    const out = sanitizePageContent(
      '<h1>Title</h1><img src="https://example.com/a.png" alt="a">' +
        '<iframe src="https://www.youtube.com/embed/abc" data-embed-provider="youtube"></iframe>',
    );
    expect(out).toContain('<h1>Title</h1>');
    expect(out).toContain('<img');
    expect(out).toContain('youtube.com/embed/abc');
  });

  it('strips iframes from non-allowlisted hosts', () => {
    const out = sanitizePageContent('<iframe src="https://evil.com"></iframe>');
    expect(out).not.toContain('evil.com');
  });

  it('strips script tags and event handlers', () => {
    expect(sanitizePageContent('<script>alert(1)</script>')).toBe('');
    expect(sanitizePageContent('<img src=x onerror=alert(1)>')).not.toContain(
      'onerror',
    );
  });

  it('strips javascript: URLs', () => {
    const out = sanitizePageContent('<a href="javascript:alert(1)">click</a>');
    expect(out).not.toContain('javascript:');
  });

  it('preserves gallery/embed markup produced by the Tiptap nodes', () => {
    const out = sanitizePageContent(
      '<div data-gallery="true" class="content-gallery" data-images="[&quot;a.png&quot;]">' +
        '<button type="button" class="content-gallery-item" data-src="a.png"><img src="a.png" alt=""></button>' +
        '</div>',
    );
    expect(out).toContain('data-gallery');
    expect(out).toContain('content-gallery-item');
  });

  it('preserves video markup produced by the ContentVideo Tiptap node', () => {
    const out = sanitizePageContent(
      '<video src="https://example.com/a.mp4" controls playsinline preload="metadata" ' +
        'class="content-video" data-content-video="true"></video>',
    );
    expect(out).toContain('<video');
    expect(out).toContain('src="https://example.com/a.mp4"');
    expect(out).toContain('controls');
    expect(out).toContain('data-content-video');
  });
});
