import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ExploreSort, useExplore } from '@/hooks/useExplore';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';

interface ExploreSidebarProps {
  onClose: () => void;
}

export function ExploreSidebar({ onClose }: ExploreSidebarProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<ExploreSort>('activity');

  const { data: users, isLoading } = useExplore(query, sort);

  const tabs: { id: ExploreSort; label: string }[] = [
    { id: 'activity', label: 'Activity' },
    { id: 'new', label: 'New' },
    { id: 'a-z', label: 'A–Z' },
  ];

  return (
    <div className="flex h-full w-full flex-col border-r border-border-strong bg-surface-1">
      <div className="mx-4 flex flex-col gap-4 border-b border-border-strong pt-6">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Explore people..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-full bg-surface-3 px-4 py-2 text-[14px] text-content-primary outline-none transition-all placeholder:text-content-muted"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-content-muted transition-colors hover:bg-surface-3 hover:text-content-secondary"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-[14px] text-content-primary transition-colors hover:underline hover:underline-offset-2"
          >
            Done
          </button>
        </div>

        <div className="flex items-center gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSort(tab.id)}
              className={`relative cursor-default pb-3 text-[13px] transition-all ${
                sort === tab.id ? 'text-content-primary ' : 'text-content-muted'
              }`}
            >
              {tab.label}
              {sort === tab.id && (
                <motion.div
                  layoutId="exploreTabIndicator"
                  className="absolute -bottom-[1px] left-0 right-0 h-[1px] bg-action-primary"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2">
        {isLoading ? (
          <div className="p-4 text-center text-[13px] text-content-muted">
            Loading...
          </div>
        ) : users?.length === 0 ? (
          <div className="p-4 text-center text-[13px] text-content-muted">
            No results found
          </div>
        ) : (
          <div className="flex flex-col">
            {users?.map((user) => (
              <button
                key={user.username}
                onClick={() => router.push(`/${user.username}`)}
                className="flex items-start gap-3 rounded-[10px] px-3 py-3 text-left transition-colors hover:bg-surface-3/50"
              >
                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-surface-3">
                  {user.customImage || user.userImage ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={user.customImage || user.userImage!}
                      alt={user.name || user.username}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-surface-3 text-[14px] font-medium text-content-secondary">
                      {(user.name || user.username).charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-[14px] font-medium text-content-primary">
                    {user.name || user.username}
                  </span>
                  {user.shortAbout && (
                    <span className="mt-0.5 line-clamp-2 text-[13px] leading-tight text-content-muted">
                      {user.shortAbout}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
