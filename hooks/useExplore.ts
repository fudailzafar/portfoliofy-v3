import { useQuery } from '@tanstack/react-query';
import { useDebounce } from 'use-debounce';

export type ExploreUser = {
  username: string;
  userImage: string | null;
  customImage: string | null;
  name: string | null;
  shortAbout: string | null;
  updatedAt: string;
  createdAt: string;
};

export type ExploreSort = 'activity' | 'new' | 'a-z';

export function useExplore(query: string, sort: ExploreSort) {
  // Debounce the query to avoid spamming the API while typing
  const [debouncedQuery] = useDebounce(query, 300);

  return useQuery({
    queryKey: ['explore', debouncedQuery, sort],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (debouncedQuery) params.set('q', debouncedQuery);
      if (sort) params.set('sort', sort);

      const response = await fetch(`/api/explore?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch explore data');
      }
      
      const data = await response.json();
      return data.users as ExploreUser[];
    },
  });
}
