import { NextResponse } from 'next/server';
import sql from '@/lib/server/db';
import { searchWords } from '@/lib/exploreSearch';

const PAGE_SIZE = 20;
const MAX_SEARCH_OFFSET = 1000;

// "50%" or "a_b" should mean those characters, not LIKE wildcards.
const escapeLike = (value: string) => value.replace(/[\\%_]/g, '\\$&');
const escapeRegex = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

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

    const limit = PAGE_SIZE;
    const words = searchWords(q);
    const header = sql`((r.resume_data#>>'{}')::jsonb)->'header'`;

    // Searching: every word must match name, username, title or location.
    // Results are ordered by how well they match, not by the tab, and paged by
    // offset since that order has no single column to continue from.
    let searchFilter = sql``;
    let searchOrder = sql``;
    let offset = 0;
    if (words.length > 0) {
      for (const word of words) {
        // The word must start a word in the text: at its start or after a
        // character that isn't a letter or digit.
        const atWordStart = `(^|[^[:alnum:]])${escapeRegex(word)}`;
        searchFilter = sql`${searchFilter} AND (
          u.username ~* ${atWordStart}
          OR ${header}->>'name' ~* ${atWordStart}
          OR ${header}->>'shortAbout' ~* ${atWordStart}
          OR ${header}->>'location' ~* ${atWordStart}
        )`;
      }
      const first = escapeLike(words[0]);
      const firstAtStart = `(^|[^[:alnum:]])${escapeRegex(words[0])}`;
      searchOrder = sql`
        CASE
          WHEN u.username ILIKE ${first + '%'} OR ${header}->>'name' ILIKE ${first + '%'} THEN 0
          WHEN u.username ~* ${firstAtStart} OR ${header}->>'name' ~* ${firstAtStart} THEN 1
          WHEN ${header}->>'shortAbout' ~* ${firstAtStart} THEN 2
          ELSE 3
        END,
        LOWER(${header}->>'name'), u.username`;
      orderBy = searchOrder;
      extraFilter = sql``;
      cursorCondition = sql``;
      const parsed = Number.parseInt(cursor ?? '', 10);
      offset = Number.isFinite(parsed)
        ? Math.min(Math.max(parsed, 0), MAX_SEARCH_OFFSET)
        : 0;
    }

    const users = await sql`
      SELECT 
        u.username,
        u.image as user_image,
        u.custom_image,
        ${header}->>'name' as name,
        ${header}->>'shortAbout' as short_about,
        ${header}->>'location' as location,
        u.status_emoji as status_emoji,
        u.status_text as status_text,
        u.status_updated_at as status_updated_at,
        r.updated_at,
        u.created_at
      FROM users u
      JOIN resumes r ON u.id = r.user_id
      WHERE r.status = 'live'
        ${searchFilter}
        ${extraFilter}
        ${cursorCondition}
      ORDER BY ${orderBy}
      LIMIT ${limit + 1} OFFSET ${offset}
    `;

    const hasNextPage = users.length > limit;
    const results = hasNextPage ? users.slice(0, -1) : users;

    let nextCursor = null;
    if (hasNextPage) {
      const lastItem = results[results.length - 1];
      if (words.length > 0) {
        nextCursor = String(offset + limit);
      } else if (sort === 'new') {
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
