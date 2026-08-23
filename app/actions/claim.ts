'use server';

import { auth } from '@/auth';
import { createUsernameLookup, storeResume } from '@/lib/server/dbActions';
import { ResumeDataSchemaType, ResumeDataSchema } from '@/lib/resume';
import { revalidateTag } from 'next/cache';
import { normalizeUsername } from '@/lib/validation/username';

export async function claimUsernameAndInitProfile(
  username: string,
  displayName: string,
) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    throw new Error('Unauthorized');
  }

  // 1. Claim username
  const success = await createUsernameLookup({
    userId,
    username,
    name: session?.user?.name,
    email: session?.user?.email,
    image: session?.user?.image,
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
    file: null,
    fileContent: null,
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
