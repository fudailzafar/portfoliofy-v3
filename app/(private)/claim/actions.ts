'use server';

import { auth } from '@clerk/nextjs/server';
import { createUsernameLookup, storeResume } from '@/lib/server/redisActions';
import { ResumeDataSchemaType } from '@/lib/resume';

export async function claimUsernameAndInitProfile(username: string, displayName: string) {
  const { userId, getToken } = await auth();
  if (!userId) {
    throw new Error('Unauthorized');
  }

  // 1. Claim username
  const success = await createUsernameLookup({ userId, username });
  if (!success) {
    return { error: 'Username is not available or invalid' };
  }

  // 2. Initialize empty resume profile
  const emptyResumeData: ResumeDataSchemaType = {
    header: {
      name: displayName,
      shortAbout: '',
      location: '',
      contacts: {},
      skills: [],
    },
    summary: '',
    workExperience: [],
    education: [],
  };

  await storeResume(userId, {
    status: 'live',
    file: null,
    fileContent: null,
    resumeData: emptyResumeData,
  });

  return { success: true };
}
