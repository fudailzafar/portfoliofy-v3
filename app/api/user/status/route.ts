import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import sql from '@/lib/server/db';
import { revalidateTag } from 'next/cache';

export async function PUT(req: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { status_emoji, status_text } = body;

    // Both fields can be empty/null to clear the status, or provided to update
    await sql`
      UPDATE users 
      SET 
        status_emoji = ${status_emoji || null},
        status_text = ${status_text || null},
        status_updated_at = ${status_text ? new Date().toISOString() : null}
      WHERE id = ${userId}
    `;

    // @ts-expect-error Next.js 16 Canary types require second profile argument
    revalidateTag(`user-${userId}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating status:', error);
    return NextResponse.json(
      { error: 'Failed to update status' },
      { status: 500 },
    );
  }
}
