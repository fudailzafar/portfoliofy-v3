import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import sql from '@/lib/server/db';

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const idsParam = searchParams.get('ids');

    if (!idsParam) {
      return NextResponse.json({ users: [] });
    }

    const ids = idsParam
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean);

    if (ids.length === 0) {
      return NextResponse.json({ users: [] });
    }

    const users = await sql`
      SELECT
        u.id,
        u.username,
        COALESCE((r.resume_data#>>'{}')::jsonb->'header'->>'name', u.name) as name,
        COALESCE(u.custom_image, u.image) as image
      FROM users u
      LEFT JOIN resumes r ON u.id = r.user_id
      WHERE u.id IN ${sql(ids)}
    `;

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error fetching collaborators info:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
