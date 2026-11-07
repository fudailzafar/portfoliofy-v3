import { createUsernameLookup, storeResume } from '@/lib/server/dbActions';
import {
  ResumeDataSchemaType,
  ResumeDataSchema,
} from '@portfoliofy/shared/resume';
import { revalidateTag } from 'next/cache';
import { normalizeUsername } from '@portfoliofy/shared/validation/username';
import { checkRateLimit } from '@/lib/server/rateLimit';

const CLAIM_MAX_REQUESTS = 10;
const CLAIM_WINDOW_MS = 60 * 60 * 1000; // 1 hour

export interface ClaimInput {
  userId: string;
  email?: string | null;
  image?: string | null;
  username: string;
  displayName: string;
}

export type ClaimResult =
  | { success: true; error?: undefined }
  | { success?: undefined; error: string };

/** Claims a username for a new user and gives them an empty profile. */
export async function claimUsernameAndInitProfile({
  userId,
  email,
  image,
  username,
  displayName,
}: ClaimInput): Promise<ClaimResult> {
  const { allowed } = await checkRateLimit(
    `claim-username:${userId}`,
    CLAIM_MAX_REQUESTS,
    CLAIM_WINDOW_MS,
  );
  if (!allowed) {
    return { error: 'Too many attempts — please try again later.' };
  }

  // 1. Claim username
  const success = await createUsernameLookup({
    userId,
    username,
    name: displayName,
    email,
    image,
  });
  if (!success) {
    return { error: 'Username is not available or invalid' };
  }

  // 2. Initialize empty resume profile
  const emptyResumeData: ResumeDataSchemaType = ResumeDataSchema.parse({
    header: {
      name: displayName,
      shortAbout: '',
      location: '',
      skills: [],
    },
    summary: '',
    workExperience: [],
    education: [],
    projects: [],
    sideProjects: [],
    speaking: [],
    writing: [],
    exhibitions: [],
    features: [],
    volunteering: [],
    awards: [],
    certifications: [],
    contacts: [],
  });

  await storeResume(userId, {
    status: 'live',
    resumeData: emptyResumeData,
  });

  // @ts-expect-error Next.js 16 Canary types
  revalidateTag(`username-${normalizeUsername(username)}`);
  // @ts-expect-error Next.js 16 Canary types
  revalidateTag(`resume-v2-${userId}`);
  // @ts-expect-error Next.js 16 Canary types
  revalidateTag(`user-${userId}`);

  return { success: true };
}
