import { NextResponse } from 'next/server';
import sql from '@/lib/server/db';

// Deliberately public, no auth check: this resolves collaborator avatars
// (username/name/image) rendered on a public profile via AvatarStack ->
// useLiveCollaborators, which anonymous visitors hit on every page view.
// Requiring auth here breaks that for anyone not logged in. The data
// returned is exactly what's already public the moment a user is tagged as
// a collaborator on any live profile, so this isn't a new disclosure — it's
// just a batch lookup by id instead of by username. MAX_IDS bounds it so a
// single request can't be used to scrape the user table wholesale.
const MAX_IDS = 50;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const idsParam = searchParams.get('ids');

    if (!idsParam) {
      return NextResponse.json({ users: [] });
    }

    const ids = idsParam
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean)
      .slice(0, MAX_IDS);

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
