import { useQuery } from '@tanstack/react-query';
import { useDebounce } from 'use-debounce';
import { CollaboratorSchemaType } from '@/lib/resume';

export function useCollaboratorSearch(query: string) {
  const [debouncedQuery] = useDebounce(query.trim(), 300);

  return useQuery({
    queryKey: ['collaborator-search', debouncedQuery],
    queryFn: async () => {
      const params = new URLSearchParams({ q: debouncedQuery });
      const response = await fetch(
        `/api/collaborators/search?${params.toString()}`,
      );
      if (!response.ok) {
        throw new Error('Failed to search collaborators');
      }
      const data = await response.json();
      return data.users as CollaboratorSchemaType[];
    },
    enabled: debouncedQuery.length > 0,
  });
}
