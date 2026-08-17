import { auth } from '@/auth';
import sql from '@/lib/server/db';
import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';

// POST /api/user/avatar — save the S3 URL (uploaded client-side via next-s3-upload) to Postgres
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { url } = await request.json();
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    const userId = session.user.id;

    await sql`
      UPDATE users 
      SET custom_image = ${url}
      WHERE id = ${userId}
    `;

    revalidateTag(`user-${userId}`, 'max' as any);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Avatar save failed:', error);
    return NextResponse.json(
      { error: 'Failed to save avatar' },
      { status: 500 },
    );
  }
}

// DELETE /api/user/avatar — remove custom profile picture, fall back to Google photo
export async function DELETE() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    await sql`
      UPDATE users 
      SET custom_image = NULL
      WHERE id = ${userId}
    `;

    revalidateTag(`user-${userId}`, 'max' as any);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Avatar removal failed:', error);
    return NextResponse.json(
      { error: 'Failed to remove image' },
      { status: 500 },
    );
  }
}
