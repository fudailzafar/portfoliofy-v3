import { NextResponse } from 'next/server';
import sql from '@/lib/server/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    const sort = searchParams.get('sort') || 'activity';

    let orderBy = sql`r.updated_at DESC`;
    if (sort === 'new') {
      orderBy = sql`u.created_at DESC`;
    } else if (sort === 'a-z') {
      orderBy = sql`LOWER(((r.resume_data#>>'{}')::jsonb)->'header'->>'name') ASC`;
    }

    const searchQuery = `%${q}%`;

    const users = await sql`
      SELECT 
        u.username,
        u.image as user_image,
        u.custom_image,
        ((r.resume_data#>>'{}')::jsonb)->'header'->>'name' as name,
        ((r.resume_data#>>'{}')::jsonb)->'header'->>'shortAbout' as short_about,
        r.updated_at,
        u.created_at
      FROM users u
      JOIN resumes r ON u.id = r.user_id
      WHERE r.status = 'live'
        AND (
          u.username ILIKE ${searchQuery}
          OR (((r.resume_data#>>'{}')::jsonb)->'header'->>'name') ILIKE ${searchQuery}
          OR (((r.resume_data#>>'{}')::jsonb)->'header'->>'shortAbout') ILIKE ${searchQuery}
        )
      ORDER BY ${orderBy}
      LIMIT 50
    `;

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error fetching explore data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
