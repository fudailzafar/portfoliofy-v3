import { auth } from '@/auth';
import { NextRequest, NextResponse } from 'next/server';
import { POST as uploadHandler } from 'next-s3-upload/route';

// Every legitimate caller of this endpoint: avatar photos (EditProfileDialog)
// and section attachments (MediaUploadDialog — accept="image/*,video/mp4,video/quicktime").
// application/pdf is allowed for potential future PDF attachments — the resume
// PDF import flow (ImportDataTab) sends its file directly to /api/resume/parse
// and never touches this endpoint.
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
