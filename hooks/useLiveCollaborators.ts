import { useQuery } from '@tanstack/react-query';
import { CollaboratorSchemaType } from '@/lib/resume';

export function useLiveCollaborators(
  collaborators: CollaboratorSchemaType[] | undefined,
  enabled: boolean = true,
) {
  const ids = collaborators?.map((c) => c.id).join(',') || '';

  return useQuery({
    queryKey: ['collaborators-info', ids],
    queryFn: async () => {
      if (!ids) return [];
      const response = await fetch(`/api/collaborators/info?ids=${ids}`);
      if (!response.ok) {
        throw new Error('Failed to fetch collaborators info');
      }
      const data = await response.json();
      return data.users as CollaboratorSchemaType[];
    },
    enabled: enabled && ids.length > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
