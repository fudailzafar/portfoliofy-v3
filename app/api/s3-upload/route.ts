import { auth } from '@/auth';
import { NextRequest, NextResponse } from 'next/server';
import { POST as uploadHandler } from 'next-s3-upload/route';
import { checkRateLimit } from '@/lib/server/rateLimit';

const UPLOAD_MAX_REQUESTS = 20;
const UPLOAD_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

const ALLOWED_FILE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'video/mp4',
  'video/quicktime',
  'application/pdf',
]);

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { allowed, retryAfterMs } = await checkRateLimit(
    `s3-upload:${session.user.id}`,
    UPLOAD_MAX_REQUESTS,
    UPLOAD_WINDOW_MS,
  );
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many uploads — please try again shortly.' },
      {
        status: 429,
        headers: { 'Retry-After': String(Math.ceil(retryAfterMs / 1000)) },
      },
    );
  }

  const body = await request
    .clone()
    .json()
    .catch(() => null);
  const filetype = typeof body?.filetype === 'string' ? body.filetype : '';
  if (!ALLOWED_FILE_TYPES.has(filetype)) {
    return NextResponse.json(
      { error: 'Unsupported file type' },
      { status: 400 },
    );
  }

  const userId = session.user.id;
  const handler = uploadHandler.configure({
    key: (_req, filename) => {
      const safeFilename = filename
        .replace(/[^a-zA-Z0-9._-]/g, '-')
        .slice(-120);
      return `next-s3-uploads/${userId}/${crypto.randomUUID()}-${safeFilename}`;
    },
  });

  return handler(request);
}
