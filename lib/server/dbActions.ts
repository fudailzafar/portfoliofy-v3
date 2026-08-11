import sql from './db';
import { ResumeDataSchema } from '@/lib/resume';
import { z } from 'zod';
import { PRIVATE_ROUTES } from '../routes';
import { sanitizeResumeData } from './sanitize';

const FORBIDDEN_USERNAMES = PRIVATE_ROUTES;

// Define the file schema
const FileSchema = z.object({
  name: z.string(),
  url: z.string().nullish(),
  size: z.number(),
  bucket: z.string(),
  key: z.string(),
});

// Define the complete resume schema
const ResumeSchema = z.object({
  status: z.enum(['live', 'draft']).default('draft'),
  file: FileSchema.nullish(),
  fileContent: z.string().nullish(),
  resumeData: ResumeDataSchema.nullish(),
});

// Type inference for the resume data
export type ResumeData = z.infer<typeof ResumeDataSchema>;
export type Resume = z.infer<typeof ResumeSchema>;

export async function getResume(userId: string): Promise<Resume | undefined> {
  try {
    const [row] = await sql`
      SELECT status, file, file_content as "fileContent", resume_data as "resumeData"
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
    if (typeof row.file === 'string') {
      try {
        row.file = JSON.parse(row.file);
      } catch (e) {
        console.error('Failed to parse file JSON', e);
      }
    }

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

    // We stringify the JSON parts
    const fileJson = validatedData.file
      ? JSON.stringify(validatedData.file)
      : null;
    const resumeDataJson = safeResumeData
      ? JSON.stringify(safeResumeData)
      : null;

    await sql`
      INSERT INTO resumes (user_id, status, file, file_content, resume_data)
      VALUES (
        ${userId}, 
        ${validatedData.status}, 
        ${fileJson}::jsonb, 
        ${validatedData.fileContent || null}, 
        ${resumeDataJson}::jsonb
      )
      ON CONFLICT (user_id) DO UPDATE SET
        status = EXCLUDED.status,
        file = EXCLUDED.file,
        file_content = EXCLUDED.file_content,
        resume_data = EXCLUDED.resume_data,
        updated_at = NOW()
    `;
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
  if (FORBIDDEN_USERNAMES.includes(username.toLowerCase())) {
    return false;
  }

  try {
    // Insert into users. If id or username already exists, it will throw a unique constraint error.
    await sql`
      INSERT INTO users (id, username, name, email, image)
      VALUES (${userId}, ${username}, ${name || null}, ${email || null}, ${image || null})
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
    const [row] = await sql`SELECT id FROM users WHERE username = ${username}`;
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
  if (FORBIDDEN_USERNAMES.includes(username.toLowerCase())) {
    return { available: false };
  }
  const userId = await getUserIdByUsername(username);
  return { available: !userId };
};

export const deleteUser = async (opts: {
  userId?: string;
  username?: string;
}): Promise<boolean> => {
  try {
    let result;
    if (opts.userId) {
      result = await sql`DELETE FROM users WHERE id = ${opts.userId}`;
    } else if (opts.username) {
      result = await sql`DELETE FROM users WHERE username = ${opts.username}`;
    } else {
      return false;
    }
    return result.count > 0;
  } catch (error) {
    console.error('User deletion failed:', error);
    return false;
  }
};

export const updateUsername = async (
  userId: string,
  newUsername: string,
): Promise<boolean> => {
  if (FORBIDDEN_USERNAMES.includes(newUsername.toLowerCase())) {
    return false;
  }

  try {
    const result = await sql`
      UPDATE users 
      SET username = ${newUsername} 
      WHERE id = ${userId}
    `;
    return result.count > 0;
  } catch (error: any) {
    if (error.code === '23505') {
      // Username already taken
      return false;
    }
    console.error('Username update failed:', error);
    return false;
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
