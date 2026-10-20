import { auth } from '@/auth';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { revalidateTag } from 'next/cache';
import { setPagePassword } from '@/lib/server/dbActions';
import { checkRateLimit } from '@/lib/server/rateLimit';
import {
  PAGE_PASSWORD_MAX_LENGTH,
  PAGE_PASSWORD_MIN_LENGTH,
} from '@/lib/server/pagePasswords';

const MAX_REQUESTS = 20;
const WINDOW_MS = 60 * 60 * 1000; // 1 hour

const BodySchema = z.object({
  // null removes the password.
  password: z
    .string()
    .min(PAGE_PASSWORD_MIN_LENGTH)
    .max(PAGE_PASSWORD_MAX_LENGTH)
    .nullable(),
});

export type PagePasswordResponse =
  | { passwordProtected: boolean }
  | { error: string };

export async function POST(
  request: Request,
  { params }: { params: Promise<{ pageId: string }> },
): Promise<NextResponse<PagePasswordResponse>> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { allowed, retryAfterMs } = await checkRateLimit(
    `page-password:${session.user.id}`,
    MAX_REQUESTS,
    WINDOW_MS,
  );
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many changes — please try again shortly.' },
      {
        status: 429,
        headers: { 'Retry-After': String(Math.ceil(retryAfterMs / 1000)) },
      },
    );
  }

  let body: z.infer<typeof BodySchema>;
  try {
    body = BodySchema.parse(await request.json());
  } catch {
    return NextResponse.json(
      {
        error: `Passwords must be ${PAGE_PASSWORD_MIN_LENGTH}–${PAGE_PASSWORD_MAX_LENGTH} characters.`,
      },
      { status: 400 },
    );
  }

  try {
    const { pageId } = await params;
    const found = await setPagePassword(session.user.id, pageId, body.password);
    if (!found) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }
    // @ts-expect-error Next.js 16 Canary types require second profile argument
    revalidateTag(`resume-v2-${session.user.id}`);
    return NextResponse.json({ passwordProtected: body.password !== null });
  } catch (error) {
    console.error('Error in POST /api/pages/[pageId]/password:', error);
    return NextResponse.json(
      { error: 'Failed to update the page password' },
      { status: 500 },
    );
  }
}
