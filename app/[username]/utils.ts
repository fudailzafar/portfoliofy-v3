import {
  getCachedUserProfile,
  getCachedUserIdByUsername,
  getCachedResume,
  UserProfile,
} from '@/lib/server/cachedFunctions';

export async function getUserData(username: string) {
  const user_id = await getCachedUserIdByUsername(username);
  if (!user_id)
    return { user_id: undefined, resume: undefined, userProfile: undefined };

  const [resume, userProfile] = await Promise.all([
    getCachedResume(user_id),
    getCachedUserProfile(user_id),
  ]);

  if (!resume?.resumeData || resume.status !== 'live') {
    return { user_id, resume: undefined, userProfile: undefined };
  }

  return { user_id, resume, userProfile };
}
