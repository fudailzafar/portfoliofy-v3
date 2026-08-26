import sql from './db';
import { ResumeDataSchema } from '@/lib/resume';
import { z } from 'zod';
import { RESERVED_USERNAMES } from '../routes';
import { sanitizeResumeData } from './sanitize';
import {
  normalizeUsername,
  isValidUsernameFormat,
} from '../validation/username';

const FORBIDDEN_USERNAMES = RESERVED_USERNAMES;

// Define the complete resume schema
const ResumeSchema = z.object({
  status: z.enum(['live', 'draft']).default('draft'),
  resumeData: ResumeDataSchema.nullish(),
});

// Type inference for the resume data
export type ResumeData = z.infer<typeof ResumeDataSchema>;
export type Resume = z.infer<typeof ResumeSchema>;

export async function getResume(userId: string): Promise<Resume | undefined> {
  try {
    const [row] = await sql`
      SELECT status, resume_data as "resumeData"
      FROM resumes
      WHERE user_id = ${userId}
    `;

    if (!row) return undefined;

    // Parse JSON fields if postgres.js returned them as strings
    if (typeof row.resumeData === 'string') {
      try {
        row.resumeData = JSON.parse(row.resumeData);
      } catch (e) {
        console.error('Failed to parse resumeData', e);
      }
    }

    // Run the row through the schema so zod defaults (e.g. `collaborators`/
    // `attachments` arrays defaulting to `[]`) actually apply on read, not
    // just on write — otherwise a legacy row predating a field genuinely has
    // it as `undefined` at runtime, relying on every consumer to individually
    // guard against that. Fall back to the raw cast on failure (rather than
    // throwing) so a row that doesn't perfectly conform doesn't take down the
    // whole profile — same tolerance the old bare-cast behavior had.
    const parsed = ResumeSchema.safeParse(row);
    if (parsed.success) {
      return parsed.data;
    }
    console.error('Resume row failed schema validation on read:', parsed.error);
    return row as Resume;
  } catch (error) {
    console.error('Error retrieving resume:', error);
    throw new Error('Failed to retrieve resume');
  }
}

export async function storeResume(
  userId: string,
  resumeData: Resume,
): Promise<void> {
  try {
    const validatedData = ResumeSchema.parse(resumeData);

    // Strip untrusted markup before it ever reaches the database, so every
    // render path (public profile, print view, editor preview) is safe.
    const safeResumeData = sanitizeResumeData(validatedData.resumeData);

    const resumeDataJson = safeResumeData
      ? JSON.stringify(safeResumeData)
      : null;

    await sql`
      INSERT INTO resumes (user_id, status, resume_data)
      VALUES (
        ${userId},
        ${validatedData.status},
        ${resumeDataJson}::jsonb
      )
      ON CONFLICT (user_id) DO UPDATE SET
        status = EXCLUDED.status,
        resume_data = EXCLUDED.resume_data,
        updated_at = NOW()
    `;

    if (safeResumeData?.header?.name) {
      await sql`
        UPDATE users 
        SET name = ${safeResumeData.header.name}
        WHERE id = ${userId}
      `;
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw error;
    }
    console.error('Error storing resume:', error);
    throw new Error('Failed to store resume');
  }
}

export const createUsernameLookup = async ({
  userId,
  username,
  name,
  email,
  image,
}: {
  userId: string;
  username: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}): Promise<boolean> => {
  const normalized = normalizeUsername(username);
  if (
    !isValidUsernameFormat(normalized) ||
    FORBIDDEN_USERNAMES.includes(normalized)
  ) {
    return false;
  }

  try {
    // Insert into users. If id or username already exists, it will throw a unique constraint error.
    await sql`
      INSERT INTO users (id, username, name, email, image)
      VALUES (${userId}, ${normalized}, ${name || null}, ${email || null}, ${image || null})
    `;
    return true;
  } catch (error: any) {
    // Unique violation (23505) means username or id is taken
    if (error.code === '23505') {
      return false;
    }
    console.error('User creation failed:', error);
    return false;
  }
};

export const getUsernameById = async (
  userId: string,
): Promise<string | null> => {
  try {
    const [row] = await sql`SELECT username FROM users WHERE id = ${userId}`;
    return row?.username || null;
  } catch (error) {
    return null;
  }
};

export const getUserIdByUsername = async (
  username: string,
): Promise<string | null> => {
  try {
    const [row] =
      await sql`SELECT id FROM users WHERE username = ${normalizeUsername(username)}`;
    return row?.id || null;
  } catch (error) {
    return null;
  }
};

export const checkUsernameAvailability = async (
  username: string,
): Promise<{
  available: boolean;
}> => {
  const normalized = normalizeUsername(username);
  if (
    !isValidUsernameFormat(normalized) ||
    FORBIDDEN_USERNAMES.includes(normalized)
  ) {
    return { available: false };
  }
  const userId = await getUserIdByUsername(normalized);
  return { available: !userId };
};

export type UpdateUsernameResult =
  | { success: true }
  | { success: false; reason: 'invalid' | 'reserved' | 'taken' | 'error' };

export const updateUsername = async (
  userId: string,
  newUsername: string,
): Promise<UpdateUsernameResult> => {
  const normalized = normalizeUsername(newUsername);
  if (!isValidUsernameFormat(normalized)) {
    return { success: false, reason: 'invalid' };
  }
  if (FORBIDDEN_USERNAMES.includes(normalized)) {
    return { success: false, reason: 'reserved' };
  }

  try {
    const result = await sql`
      UPDATE users
      SET username = ${normalized}
      WHERE id = ${userId}
    `;
    return result.count > 0
      ? { success: true }
      : { success: false, reason: 'error' };
  } catch (error: any) {
    if (error.code === '23505') {
      return { success: false, reason: 'taken' };
    }
    console.error('Username update failed:', error);
    return { success: false, reason: 'error' };
  }
};

export type SetCustomDomainResult =
  | { success: true }
  | { success: false; reason: 'taken' | 'error' };

export const setCustomDomain = async (
  userId: string,
  domain: string,
): Promise<SetCustomDomainResult> => {
  try {
    await sql`
      UPDATE users
      SET custom_domain = ${domain}
      WHERE id = ${userId}
    `;
    return { success: true };
  } catch (error: any) {
    if (error.code === '23505') {
      // users.custom_domain has a UNIQUE constraint — this is the hard
      // backstop against two users racing to claim the same domain.
      return { success: false, reason: 'taken' };
    }
    console.error('Failed to set custom domain:', error);
    return { success: false, reason: 'error' };
  }
};

export const removeCustomDomain = async (userId: string): Promise<boolean> => {
  try {
    await sql`
      UPDATE users 
      SET custom_domain = NULL 
      WHERE id = ${userId}
    `;
    return true;
  } catch (error) {
    console.error('Failed to remove custom domain:', error);
    return false;
  }
};

export const getCustomDomainByUserId = async (
  userId: string,
): Promise<string | null> => {
  try {
    const [row] =
      await sql`SELECT custom_domain FROM users WHERE id = ${userId}`;
    return row?.customDomain || null; // Postgres.js transforms snake_case to camelCase
  } catch (error) {
    return null;
  }
};

export const getUserIdByCustomDomain = async (
  domain: string,
): Promise<string | null> => {
  try {
    const [row] =
      await sql`SELECT id FROM users WHERE custom_domain = ${domain}`;
    return row?.id || null;
  } catch (error) {
    return null;
  }
};

export const recordPageView = async (
  userId: string,
  viaCustomDomain: boolean,
  visitorKey: string | null,
): Promise<void> => {
  try {
    await sql`
      INSERT INTO page_views (user_id, via_custom_domain, visitor_key)
      VALUES (${userId}, ${viaCustomDomain}, ${visitorKey})
      ON CONFLICT (user_id, via_custom_domain, visitor_key, ((viewed_at AT TIME ZONE 'UTC')::date))
      DO NOTHING
    `;
  } catch (error) {
    // Best-effort; a tracking write should never break the page render.
    console.error('Failed to record page view:', error);
  }
};

export type PageViewRange = 'week' | 'month' | 'year' | 'all';

export const getPageViewSeries = async (
  userId: string,
  range: PageViewRange,
  viaCustomDomain: boolean,
): Promise<{ date: string; views: number }[]> => {
  try {
    const startExpr =
      range === 'week'
        ? sql`now() - interval '7 days'`
        : range === 'month'
          ? sql`now() - interval '30 days'`
          : range === 'year'
            ? sql`now() - interval '365 days'`
            : sql`COALESCE((SELECT min(viewed_at) FROM page_views WHERE user_id = ${userId}), now())`;

    const rows = await sql`
      SELECT gs.day::date::text AS date, count(pv.id) AS views
      FROM generate_series((${startExpr})::timestamptz, now(), '1 day') AS gs(day)
      LEFT JOIN page_views pv
        ON pv.user_id = ${userId}
        AND pv.via_custom_domain = ${viaCustomDomain}
        AND date_trunc('day', pv.viewed_at) = date_trunc('day', gs.day)
      GROUP BY gs.day
      ORDER BY gs.day
    `;

    return rows.map((row) => ({
      date: row.date,
      views: Number(row.views),
    }));
  } catch (error) {
    console.error('Failed to get page view series:', error);
    return [];
  }
};
