import { useState, UIEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ExploreSort, useExplore } from '@/hooks/useExplore';
import { getOptimizedImageUrl } from '@/lib/utils';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Twemoji from 'react-twemoji';

interface ExploreSidebarProps {
  onClose: () => void;
}

export function ExploreSidebar({ onClose }: ExploreSidebarProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<ExploreSort>('activity');

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useExplore(query, sort);

  const users = data?.pages.flatMap((page) => page.users) || [];

  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight * 1.5) {
      if (hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    }
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const diffInSeconds = Math.floor(
      (new Date().getTime() - date.getTime()) / 1000,
    );
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    const diffInMonths = Math.floor(diffInDays / 30);

    if (diffInMinutes < 60) {
      if (diffInMinutes <= 0) return 'just now';
      if (diffInMinutes === 1) return 'a minute ago';
      return `${diffInMinutes} minutes ago`;
    }
    if (diffInHours < 24) {
      if (diffInHours === 1) return 'an hour ago';
      return `${diffInHours} hours ago`;
    }
    if (diffInDays <= 99) {
      if (diffInDays === 1) return 'a day ago';
      return `${diffInDays} days ago`;
    }
    if (diffInMonths < 12) {
      if (diffInMonths <= 1) return 'a month ago';
      return `${diffInMonths} months ago`;
    }
    const diffInYears = Math.floor(diffInDays / 365);
    return diffInYears === 1 ? 'a year ago' : `${diffInYears} years ago`;
  };

  const tabs: { id: ExploreSort; label: string }[] = [
    { id: 'activity', label: 'Activity' },
    { id: 'new', label: 'New' },
    { id: 'a-z', label: 'A–Z' },
  ];

  return (
    <div className="flex h-full w-[330px] flex-col border-r border-border-strong bg-surface-1">
      <div className="mx-4 flex flex-col gap-4 border-b border-border-strong pt-8">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              autoFocus
              placeholder="Explore people..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-10 w-full rounded-full bg-surface-2 px-4 text-[14px] text-content-primary outline-none transition-all placeholder:text-content-muted focus:bg-surface-3"
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
                sort === tab.id ? 'text-content-primary' : 'text-content-muted'
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

      <div className="flex-1 overflow-y-auto px-2 py-2" onScroll={handleScroll}>
        {isLoading ? (
          <div className="p-4 text-center text-[13px] text-content-muted">
            Loading...
          </div>
        ) : users?.length === 0 ? (
          <div className="p-4 text-center text-[13px] text-content-muted">
            No results found
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={sort}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col"
            >
              {users?.map((user) => (
                <button
                  key={user.username}
                  onClick={() => router.push(`/${user.username}`)}
                  className={`hover:bg-surface-3/50 mx-2 flex items-start gap-3 px-3 text-left transition-colors ${
                    sort === 'activity'
                      ? 'mb-3 border-b border-border-subtle pb-4 pt-3'
                      : 'rounded-[10px] py-3'
                  }`}
                >
                  <div className="relative h-10 w-10 shrink-0">
                    <div className="relative h-full w-full overflow-hidden rounded-full bg-surface-3">
                      {user.customImage || user.userImage ? (
                        <Image
                          src={getOptimizedImageUrl(user.customImage || user.userImage) || ''}
                          alt={user.name || user.username}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-surface-3 text-[14px] font-medium text-content-secondary">
                          {(user.name || user.username).charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    {sort === 'activity' && user.statusEmoji && (
                      <div className="absolute -bottom-1 -right-2 z-10 flex h-[18px] w-6 items-center justify-center rounded-full border-[0.5px] border-border-strong bg-surface-1 shadow-sm">
                        <Twemoji
                          tag="span"
                          className="flex items-center justify-center text-[9px] leading-none"
                          options={{ className: 'h-[1.2em] w-[1.2em]' }}
                        >
                          {user.statusEmoji}
                        </Twemoji>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[14px] font-medium text-content-primary">
                      {user.name || user.username}
                    </span>
                    {sort === 'new' ? (
                      <span className="mt-0.5 line-clamp-1 text-[13px] leading-tight text-content-muted">
                        Joined {formatRelativeTime(user.createdAt)}
                      </span>
                    ) : sort === 'activity' ? (
                      <>
                        {user.statusText && (
                          <span className="mt-0.5 line-clamp-2 text-[13px] leading-tight text-content-muted">
                            {user.statusText}
                          </span>
                        )}
                        <span className="text-content-muted/60 mt-1.5 text-[12px]">
                          {user.statusUpdatedAt
                            ? formatRelativeTime(user.statusUpdatedAt)
                            : formatRelativeTime(user.updatedAt)}
                        </span>
                      </>
                    ) : (
                      user.shortAbout && (
                        <span className="mt-0.5 line-clamp-2 text-[13px] leading-tight text-content-muted">
                          {user.shortAbout}
                        </span>
                      )
                    )}
                  </div>
                </button>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
        {isFetchingNextPage && (
          <div className="py-4 text-center text-[13px] text-content-muted">
            Loading more...
          </div>
        )}
      </div>
    </div>
  );
}
