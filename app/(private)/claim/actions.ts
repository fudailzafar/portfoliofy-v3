'use server';

import { auth } from '@/auth';
import { createUsernameLookup, storeResume } from '@/lib/server/dbActions';
import { ResumeDataSchemaType, ResumeDataSchema } from '@/lib/resume';

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
    contacts: [],
  });

  await storeResume(userId, {
    status: 'live',
    file: null,
    fileContent: null,
    resumeData: emptyResumeData,
  });

  return { success: true };
}
