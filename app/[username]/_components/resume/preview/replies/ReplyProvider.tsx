'use client';

import { createContext, useContext, type ReactNode } from 'react';

interface ReplyContextValue {
  /** Whether visitors can reply on this page at all. */
  enabled: boolean;
  /** The profile being viewed, who replies are sent to. */
  username: string;
  name: string;
}

const ReplyContext = createContext<ReplyContextValue | null>(null);

export function ReplyProvider({
  value,
  children,
}: {
  value: ReplyContextValue;
  children: ReactNode;
}) {
  return (
    <ReplyContext.Provider value={value}>{children}</ReplyContext.Provider>
  );
}

/** Null outside a profile page, where nothing can be replied to. */
export function useReplyProfile() {
  return useContext(ReplyContext);
}
