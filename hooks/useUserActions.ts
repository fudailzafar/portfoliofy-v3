import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Resume, ResumeData } from '@/lib/server/dbActions';
type PublishStatuses = 'live' | 'draft';
import { ResumeDataSchema } from '@/lib/resume';

// Fetch resume data
const fetchResume = async (): Promise<{
  resume: Resume | undefined;
}> => {
  const response = await fetch('/api/resume');
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch resume');
  }
  return await response.json();
};

const fetchUsername = async (): Promise<{
  username: string;
}> => {
  const response = await fetch('/api/username');
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch username');
  }
  return await response.json();
};

const checkUsernameAvailability = async (
  username: string,
): Promise<{
  available: boolean;
}> => {
  const response = await fetch(
    `/api/check-username?username=${encodeURIComponent(username)}`,
    {
      method: 'POST',
    },
  );
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to check username availability');
  }

  // Artificial delay so the loading spinner is briefly visible
  await new Promise((resolve) => setTimeout(resolve, 600));

  return await response.json();
};

import { useSession } from 'next-auth/react';

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

  const internalResumeUpdate = async (newResume: Resume) => {
    const response = await fetch('/api/resume', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newResume),
    });

    if (!response.ok) {
      const errData = await response.json();
      return Promise.reject(
        new Error(errData.error || 'Unknown error occurred'),
      );
    }
  };

  const internalUsernameUpdate = async (newUsername: string) => {
    const response = await fetch('/api/username', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username: newUsername }),
    });

    if (!response.ok) {
      const error = await response.json();
      return Promise.reject(error);
    }

    return {
      success: true,
    };
  };

  // Mutation for toggling status of publishment
  const toggleStatusMutation = useMutation({
    mutationFn: async (newPublishStatus: PublishStatuses) => {
      if (!resumeQuery.data?.resume) return;
      await internalResumeUpdate({
        ...resumeQuery.data?.resume,
        status: newPublishStatus,
      });
    },
    onSuccess: () => {
      // Invalidate and refetch resume data
      queryClient.invalidateQueries({ queryKey: ['resume'] });
    },
  });

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
    // Validate the resume data using Zod schema
    try {
      // Validate the resume data
      ResumeDataSchema.parse(newResumeData);

      // If validation passes, construct the updated resume
      // Fallback to a default structure if the user doesn't have a resume yet
      const baseResume: Resume = resumeQuery.data?.resume || {
        status: 'live',
      };

      const updatedResume: Resume = {
        ...baseResume,
        resumeData: newResumeData,
      };

      await internalResumeUpdate(updatedResume);

      return { success: true };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Validation failed: ${error.message}`);
      }
      throw error;
    }
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
