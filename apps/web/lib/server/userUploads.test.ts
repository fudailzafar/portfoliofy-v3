import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/server/db', () => ({ default: vi.fn() }));

import { extractUploadKeys } from './userUploads';

const S3 = 'https://portfoliofy.s3.ap-south-1.amazonaws.com';
const CDN = 'https://d123.cloudfront.net';

describe('extractUploadKeys', () => {
  it('finds bucket and CDN URLs, including inside post HTML', () => {
    const text = JSON.stringify({
      avatar: `${S3}/next-s3-uploads/user-1/a-photo.png`,
      content: `<p>Hi</p><img src="${CDN}/next-s3-uploads/0b1c/old.jpg">`,
    });

    expect(extractUploadKeys(text, CDN).sort()).toEqual([
      'next-s3-uploads/0b1c/old.jpg',
      'next-s3-uploads/user-1/a-photo.png',
    ]);
  });

  it('ignores other hosts and lookalikes', () => {
    const text = [
      'https://example.com/next-s3-uploads/x/a.png',
      'https://portfoliofy.s3.amazonaws.com.evil.com/next-s3-uploads/x/b.png',
      `${CDN}/next-s3-uploads/x/c.png`,
    ].join(' ');

    expect(extractUploadKeys(text)).toEqual([]);
  });

  it('only returns keys under the uploads folder, once each', () => {
    const url = `${S3}/next-s3-uploads/u/one%20file.png`;
    const text = `${url} ${url} ${S3}/other/file.png`;

    expect(extractUploadKeys(text)).toEqual(['next-s3-uploads/u/one file.png']);
  });
});
