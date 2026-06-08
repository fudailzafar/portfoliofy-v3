import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getOptimizedImageUrl(url?: string | null): string | undefined {
  if (!url) return undefined;
  
  const cdnUrl = process.env.NEXT_PUBLIC_CDN_URL;
  if (!cdnUrl) return url;

  // Check if it's an S3 URL from our bucket
  // next-s3-upload format: https://portfoliofy.s3.amazonaws.com/path OR https://portfoliofy.s3.us-east-1.amazonaws.com/path
  if (url.includes('.s3.') && url.includes('amazonaws.com')) {
    try {
      const parsedUrl = new URL(url);
      return `${cdnUrl}${parsedUrl.pathname}`;
    } catch {
      return url;
    }
  }

  return url;
}
