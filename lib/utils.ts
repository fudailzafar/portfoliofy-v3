import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Matches only our own next-s3-upload bucket, e.g. https://portfoliofy.s3.amazonaws.com/path
// or https://portfoliofy.s3.us-east-1.amazonaws.com/path — anchored so a lookalike host
// (e.g. "portfoliofy.s3.amazonaws.com.evil.com") can't pass.
const OWN_S3_HOSTNAME = /^portfoliofy\.s3\.(?:[a-z0-9-]+\.)?amazonaws\.com$/i;

// Whether `url` is an https URL pointing at our own S3 bucket — the only kind of
// external URL that's safe to trust for user-supplied "image URL" fields (e.g. a
// custom avatar), since it rules out SSRF targets like internal/metadata hosts.
export function isOwnS3ImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return (
      parsed.protocol === 'https:' && OWN_S3_HOSTNAME.test(parsed.hostname)
    );
  } catch {
    return false;
  }
}

export function getOptimizedImageUrl(url?: string | null): string | undefined {
  if (!url) return undefined;

  const cdnUrl = process.env.NEXT_PUBLIC_CDN_URL;
  if (!cdnUrl) return url;

  if (isOwnS3ImageUrl(url)) {
    const parsedUrl = new URL(url);
    return `${cdnUrl}${parsedUrl.pathname}`;
  }

  return url;
}

export function ensureHttps(url: string | null | undefined): string {
  if (!url) return '';
  return url.startsWith('http') ? url : `https://${url}`;
}

export function getCanonicalUrl(
  username: string,
  customDomain: string | null | undefined,
  slug?: string,
): string {
  const base = customDomain
    ? `https://${customDomain}`
    : `https://portfoliofy.me/${username}`;
  return slug ? `${base}/${slug}` : base;
}

export function readImageDimensions(
  file: File,
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to read image dimensions'));
    };
    img.src = url;
  });
}
