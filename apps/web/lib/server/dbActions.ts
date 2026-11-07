import { revalidateTag } from 'next/cache';
import sql from './db';
import { ResumeDataSchema, migrateEmbeddedPages } from '@/lib/resume';
import { z } from 'zod';
import { RESERVED_USERNAMES } from '../routes';
import { sanitizeResumeData } from './sanitize';
import { hashPagePassword, withStoredPagePasswords } from './pagePasswords';
import {
  normalizeUsername,
  isValidUsernameFormat,
} from '../validation/username';

const FORBIDDEN_USERNAMES = RESERVED_USERNAMES;

// Define the complete resume schema
const ResumeSchema = z.object({
  status: z.enum(['live', 'draft']).default('draft'),
  resumeData: ResumeDataSchema.nullish(),
  // Increases on every save; see storeResume.
  version: z.number().int().optional(),
});

// Older snapshots beyond this many are dropped, per user.
const RESUME_HISTORY_LIMIT = 50;

export type ResumeHistorySource = 'mcp';

/** The profile changed after this copy of it was loaded. */
export class ResumeConflictError extends Error {
  constructor() {
    super(
      'Your profile changed somewhere else, so this save was stopped. Refresh to get the latest version.',
    );
    this.name = 'ResumeConflictError';
  }
}

// Type inference for the resume data
export type ResumeData = z.infer<typeof ResumeDataSchema>;
export type Resume = z.infer<typeof ResumeSchema>;

export async function getResume(userId: string): Promise<Resume | undefined> {
  try {
    const [row] = await sql`
      SELECT status, resume_data as "resumeData", version
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

    // Parse on read so schema defaults apply to old rows; fall back to the raw
    // row rather than failing the whole profile.
    const parsed = ResumeSchema.safeParse(row);
    if (parsed.success) {
      // Move page objects embedded by older saves into resume.pages.
      return {
        ...parsed.data,
        resumeData: migrateEmbeddedPages(parsed.data.resumeData),
      };
    }
    console.error('Resume row failed schema validation on read:', parsed.error);
    return row as Resume;
  } catch (error) {
    console.error('Error retrieving resume:', error);
    throw new Error('Failed to retrieve resume');
  }
}

/** Saves the profile as it is now, so a change made after this can be undone. */
async function snapshotResume(
  userId: string,
  source: ResumeHistorySource,
): Promise<void> {
  await sql`
    INSERT INTO resume_history (user_id, version, status, resume_data, source)
    SELECT user_id, version, status, resume_data, ${source}
    FROM resumes
    WHERE user_id = ${userId}
  `;
  await sql`
    DELETE FROM resume_history
    WHERE user_id = ${userId}
      AND id NOT IN (
        SELECT id FROM resume_history
        WHERE user_id = ${userId}
        ORDER BY created_at DESC, id DESC
        LIMIT ${RESUME_HISTORY_LIMIT}
      )
  `;
}

export interface ResumeHistoryEntry {
  id: string;
  version: number;
  source: string;
  createdAt: Date;
}

export async function listResumeHistory(
  userId: string,
): Promise<ResumeHistoryEntry[]> {
  const rows = await sql`
    SELECT id, version, source, created_at
    FROM resume_history
    WHERE user_id = ${userId}
    ORDER BY created_at DESC, id DESC
    LIMIT ${RESUME_HISTORY_LIMIT}
  `;
  return rows.map((row) => ({
    id: String(row.id),
    version: row.version,
    source: row.source,
    createdAt: row.createdAt,
  }));
}

type RestoreResult = { version: number } | { error: string };

function parseSnapshotData(resumeData: unknown) {
  return typeof resumeData === 'string' ? JSON.parse(resumeData) : resumeData;
}

/**
 * Restores the profile from before the latest AI change, then forgets that
 * snapshot. Only runs if that change is still the newest thing on the profile,
 * so it can never wipe edits made afterwards.
 */
export async function undoLastResumeChange(
  userId: string,
): Promise<RestoreResult> {
  const [snapshot] = await sql`
    SELECT id, version, status, resume_data as "resumeData"
    FROM resume_history
    WHERE user_id = ${userId}
    ORDER BY created_at DESC, id DESC
    LIMIT 1
  `;
  if (!snapshot) return { error: 'There is no AI change to undo.' };

  const current = await getResume(userId);
  if (!current || current.version !== snapshot.version + 1) {
    return {
      error:
        'The profile has changed since the last AI change, so undoing it could lose newer edits. Use list_history and restore_version if the user wants an older version.',
    };
  }

  const version = await storeResume(userId, {
    status: snapshot.status,
    resumeData: parseSnapshotData(snapshot.resumeData),
    version: current.version,
  });
  await sql`DELETE FROM resume_history WHERE id = ${snapshot.id}`;
  return { version };
}

/** Replaces the profile with a saved version, saving the current one first. */
export async function restoreResumeSnapshot(
  userId: string,
  historyId: string,
): Promise<RestoreResult> {
  const [snapshot] = /^\d+$/.test(historyId)
    ? await sql`
        SELECT status, resume_data as "resumeData"
        FROM resume_history
        WHERE id = ${historyId}::bigint AND user_id = ${userId}
      `
    : [];
  if (!snapshot) return { error: 'No saved version has that id.' };

  const current = await getResume(userId);
  const version = await storeResume(
    userId,
    {
      status: snapshot.status,
      resumeData: parseSnapshotData(snapshot.resumeData),
      version: current?.version,
    },
    { snapshotSource: 'mcp' },
  );
  return { version };
}

/**
 * Saves the profile and returns its new version. When `resumeData.version` is
 * set, the save only applies if the stored profile is still at that version;
 * otherwise it throws ResumeConflictError rather than overwrite newer changes.
 */
export async function storeResume(
  userId: string,
  resumeData: Resume,
  {
    keepStoredPagePasswords = true,
    bumpVersion = true,
    snapshotSource,
  }: {
    keepStoredPagePasswords?: boolean;
    bumpVersion?: boolean;
    snapshotSource?: ResumeHistorySource;
  } = {},
): Promise<number> {
  try {
    const validatedData = ResumeSchema.parse(resumeData);

    // Defensive: heal any embedded-page-in-attachments data a stale client
    // might still send, so a save always persists the current shape.
    let migratedResumeData = migrateEmbeddedPages(validatedData.resumeData);

    // Page passwords change only through setPagePassword; an ordinary save
    // keeps whatever is stored, whatever the client sent.
    if (keepStoredPagePasswords) {
      const stored = await getResume(userId);
      migratedResumeData = withStoredPagePasswords(
        migratedResumeData,
        stored?.resumeData,
      );
    }

    // Strip untrusted markup before it ever reaches the database, so every
    // render path (public profile, print view, editor preview) is safe.
    const safeResumeData = sanitizeResumeData(migratedResumeData);

    const resumeDataJson = safeResumeData
      ? JSON.stringify(safeResumeData)
      : null;

    if (snapshotSource) await snapshotResume(userId, snapshotSource);

    const expectedVersion = validatedData.version ?? null;
    const [saved] = await sql`
      INSERT INTO resumes (user_id, status, resume_data)
      VALUES (
        ${userId},
        ${validatedData.status},
        ${resumeDataJson}::jsonb
      )
      ON CONFLICT (user_id) DO UPDATE SET
        status = EXCLUDED.status,
        resume_data = EXCLUDED.resume_data,
        updated_at = NOW(),
        version = resumes.version + ${bumpVersion ? 1 : 0}
      WHERE ${expectedVersion}::int IS NULL
        OR resumes.version = ${expectedVersion}::int
      RETURNING version
    `;
    if (!saved) throw new ResumeConflictError();

    if (safeResumeData?.header?.name) {
      await sql`
        UPDATE users 
        SET name = ${safeResumeData.header.name}
        WHERE id = ${userId}
      `;
    }

    return saved.version;
  } catch (error) {
    if (error instanceof z.ZodError || error instanceof ResumeConflictError) {
      throw error;
    }
    console.error('Error storing resume:', error);
    throw new Error('Failed to store resume');
  }
}

// Sets (or, with null, removes) a page's password. Returns false if the
// page doesn't exist.
export async function setPagePassword(
  userId: string,
  pageId: string,
  password: string | null,
): Promise<boolean> {
  const passwordHash = password ? hashPagePassword(password) : undefined;
  const attempt = async (): Promise<boolean> => {
    const stored = await getResume(userId);
    const pages = stored?.resumeData?.pages;
    if (!stored?.resumeData || !pages?.some((p) => p.id === pageId)) {
      return false;
    }
    await storeResume(
      userId,
      {
        ...stored,
        resumeData: {
          ...stored.resumeData,
          pages: pages.map((p) =>
            p.id === pageId ? { ...p, passwordHash } : p,
          ),
        },
      },
      // Ordinary saves keep stored passwords, so an open editor doesn't need
      // to treat this as a newer version of the profile.
      { keepStoredPagePasswords: false, bumpVersion: false },
    );
    return true;
  };

  try {
    return await attempt();
  } catch (error) {
    if (error instanceof ResumeConflictError) return attempt();
    throw error;
  }
}

// Empty text clears the status.
export async function setUserStatus(
  userId: string,
  emoji: string | null | undefined,
  text: string | null | undefined,
): Promise<void> {
  await sql`
    UPDATE users
    SET
      status_emoji = ${emoji || null},
      status_text = ${text || null},
      status_updated_at = ${text ? new Date().toISOString() : null}
    WHERE id = ${userId}
  `;
  // @ts-expect-error Next.js 16 Canary types require second profile argument
  revalidateTag(`user-${userId}`);
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
