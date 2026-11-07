import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { createApiClient } from '@portfoliofy/shared/api/client';
import { saveResumeData } from '@portfoliofy/shared/api/saveResume';
import type { ResumeData } from '@portfoliofy/shared/resume';

// The website talks to its own origin and is signed in by its session cookie.
const api = createApiClient();

const fetchResume = async () => ({ resume: await api.getResume() });

const fetchUsername = async () => ({ username: await api.getUsername() });

const checkUsernameAvailability = async (username: string) => {
  const result = await api.checkUsername(username);

  // Artificial delay so the loading spinner is briefly visible
  await new Promise((resolve) => setTimeout(resolve, 600));

  return result;
};

export function useUserActions() {
  const queryClient = useQueryClient();
  const { status } = useSession();

  // Query for fetching resume data
  const resumeQuery = useQuery({
    queryKey: ['resume'],
    queryFn: fetchResume,
    enabled: status === 'authenticated',
  });

  const usernameQuery = useQuery({
    queryKey: ['username'],
    queryFn: fetchUsername,
    enabled: status === 'authenticated',
  });

  const internalUsernameUpdate = async (newUsername: string) => {
    await api.setUsername(newUsername);
    return { success: true };
  };

  // mutation to allow editing a username for a user_id, if it fails means that username is already taken
  const updateUsernameMutation = useMutation({
    mutationFn: internalUsernameUpdate,
    onSuccess: () => {
      // Invalidate and refetch username data
      queryClient.invalidateQueries({ queryKey: ['username'] });
    },
    throwOnError: false,
  });

  // Mutation for checking username availability
  const checkUsernameMutation = useMutation({
    mutationFn: checkUsernameAvailability,
    onSuccess: () => {
      // Invalidate and refetch username availability data
      queryClient.invalidateQueries({ queryKey: ['username-availability'] });
    },
  });

  // Function to save resume data changes
  const saveResumeDataChanges = async (newResumeData: ResumeData) => {
    // Validates, saves against the version we last saw, and records the new one.
    // Without a resume loaded yet (a new user) it is saved as live.
    const saved = await saveResumeData(
      api,
      newResumeData,
      resumeQuery.data?.resume,
    );
    // Update the cache now, so the next save can't race the refetch below.
    queryClient.setQueryData(['resume'], { resume: saved });

    return { success: true };
  };

  // Mutation for saving resume data changes
  const saveResumeDataMutation = useMutation({
    mutationFn: saveResumeDataChanges,
    onSuccess: () => {
      // Invalidate and refetch resume data
      queryClient.invalidateQueries({ queryKey: ['resume'] });
    },
  });

  return {
    resumeQuery,
    usernameQuery,
    updateUsernameMutation,
    checkUsernameMutation,
    saveResumeDataMutation,
  };
}
