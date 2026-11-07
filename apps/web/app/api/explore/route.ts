import { NextResponse } from 'next/server';
import sql from '@/lib/server/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    const sort = searchParams.get('sort') || 'activity';
    const cursor = searchParams.get('cursor');

    let orderBy = sql`u.status_updated_at DESC`;
    let cursorCondition = sql``;
    let extraFilter = sql`AND u.status_text IS NOT NULL`;

    if (sort === 'new') {
      orderBy = sql`u.created_at DESC`;
      extraFilter = sql``;
      if (cursor) {
        cursorCondition = sql`AND u.created_at < ${cursor}`;
      }
    } else if (sort === 'a-z') {
      orderBy = sql`LOWER(((r.resume_data#>>'{}')::jsonb)->'header'->>'name') ASC`;
      extraFilter = sql``;
      if (cursor) {
        cursorCondition = sql`AND LOWER(((r.resume_data#>>'{}')::jsonb)->'header'->>'name') > ${cursor}`;
      }
    } else {
      // default 'activity'
      if (cursor) {
        cursorCondition = sql`AND u.status_updated_at < ${cursor}`;
      }
    }

    const searchQuery = `%${q}%`;
    const limit = 20;

    const users = await sql`
      SELECT 
        u.username,
        u.image as user_image,
        u.custom_image,
        ((r.resume_data#>>'{}')::jsonb)->'header'->>'name' as name,
        ((r.resume_data#>>'{}')::jsonb)->'header'->>'shortAbout' as short_about,
        u.status_emoji as status_emoji,
        u.status_text as status_text,
        u.status_updated_at as status_updated_at,
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
        ${extraFilter}
        ${cursorCondition}
      ORDER BY ${orderBy}
      LIMIT ${limit + 1}
    `;

    const hasNextPage = users.length > limit;
    const results = hasNextPage ? users.slice(0, -1) : users;

    let nextCursor = null;
    if (hasNextPage) {
      const lastItem = results[results.length - 1];
      if (sort === 'new') {
        nextCursor = lastItem.createdAt;
      } else if (sort === 'a-z') {
        nextCursor = lastItem.name?.toLowerCase();
      } else {
        nextCursor = lastItem.statusUpdatedAt;
      }
    }

    return NextResponse.json({ users: results, nextCursor });
  } catch (error) {
    console.error('Error fetching explore data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
