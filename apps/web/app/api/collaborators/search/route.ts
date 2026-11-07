import { auth } from '@/auth';
import { NextResponse } from 'next/server';
import sql from '@/lib/server/db';

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.trim() || '';

    if (!q) {
      return NextResponse.json({ users: [] });
    }

    const searchQuery = `%${q}%`;
    const limit = 10;

    const users = await sql`
      SELECT
        u.id,
        u.username,
        COALESCE((r.resume_data#>>'{}')::jsonb->'header'->>'name', u.name) as name,
        COALESCE(u.custom_image, u.image) as image
      FROM users u
      LEFT JOIN resumes r ON u.id = r.user_id
      WHERE u.id != ${session.user.id}
        AND u.username IS NOT NULL
        AND (
          u.username ILIKE ${searchQuery}
          OR COALESCE((r.resume_data#>>'{}')::jsonb->'header'->>'name', u.name) ILIKE ${searchQuery}
        )
      ORDER BY name ASC
      LIMIT ${limit}
    `;

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error searching collaborators:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
