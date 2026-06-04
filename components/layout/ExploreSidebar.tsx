import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ExploreSort, useExplore } from '@/hooks/useExplore';
import { X, Search } from 'lucide-react';
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
    <div className="flex h-full w-full flex-col bg-white border-r border-[#E5E5E5]">
      <div className="flex flex-col gap-4 mx-4 pt-6 border-b border-[#E5E5E5]">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Explore people..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-full bg-[#F2F2F2] px-4 py-2 text-[14px] text-gray-900 placeholder:text-gray-400 outline-none transition-all"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-700"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-[14px] text-black transition-colors hover:underline hover:underline-offset-2"
          >
            Done
          </button>
        </div>

        <div className="flex items-center gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSort(tab.id)}
              className={`relative pb-3 text-[13px] transition-all cursor-default ${
                sort === tab.id
                  ? 'text-black'
                  : 'text-gray-400'
              }`}
            >
              {tab.label}
              {sort === tab.id && (
                <motion.div
                  layoutId="exploreTabIndicator"
                  className="absolute -bottom-[1px] left-0 right-0 h-[1px] bg-black"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2">
        {isLoading ? (
          <div className="p-4 text-center text-[13px] text-gray-400">Loading...</div>
        ) : users?.length === 0 ? (
          <div className="p-4 text-center text-[13px] text-gray-400">No results found</div>
        ) : (
          <div className="flex flex-col">
            {users?.map((user) => (
              <button
                key={user.username}
                onClick={() => router.push(`/${user.username}`)}
                className="flex items-start gap-3 rounded-[10px] px-3 py-3 text-left transition-colors hover:bg-gray-200/50"
              >
                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-gray-200">
                  {user.customImage || user.userImage ? (
                    <img
                      src={user.customImage || user.userImage!}
                      alt={user.name || user.username}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gray-300 text-[14px] font-medium text-gray-600">
                      {(user.name || user.username).charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-[14px] font-medium text-gray-900">
                    {user.name || user.username}
                  </span>
                  {user.shortAbout && (
                    <span className="line-clamp-2 text-[13px] leading-tight text-gray-500 mt-0.5">
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
