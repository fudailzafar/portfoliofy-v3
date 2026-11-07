import {
  getCachedUserProfile,
  getCachedUserIdByUsername,
  getCachedUserIdByCustomDomain,
  getCachedResume,
} from '@/lib/server/cachedFunctions';

export async function getUserData(username: string) {
  let user_id;
  // If the identifier contains a dot, it's a custom domain, not a username
  if (username.includes('.')) {
    user_id = await getCachedUserIdByCustomDomain(username);
  } else {
    user_id = await getCachedUserIdByUsername(username);
  }

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
