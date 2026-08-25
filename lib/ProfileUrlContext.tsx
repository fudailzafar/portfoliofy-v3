'use client';

import { createContext, useContext } from 'react';

/**
 * Stores whether the current view is a personal domain/subdomain view.
 * This is a boolean (serializable from Server Components) rather than a function.
 * The URL-building logic lives in useProfileUrl() on the client.
 */
const ProfileUrlContext = createContext<boolean>(false);

export function ProfileUrlProvider({
  isPersonalDomainView,
  children,
}: {
  isPersonalDomainView: boolean;
  children: React.ReactNode;
}) {
  return (
    <ProfileUrlContext.Provider value={isPersonalDomainView}>
      {children}
    </ProfileUrlContext.Provider>
  );
}

/**
 * Returns a function that generates the correct profile URL for the current context:
 * - Personal domain / subdomain → https://username.portfoliofy.me
 * - Main platform               → /username
 */
export function useProfileUrl(): (username: string) => string {
  const isPersonalDomainView = useContext(ProfileUrlContext);
  return (username: string) =>
    isPersonalDomainView
      ? `https://${username}.portfoliofy.me`
      : `/${username}`;
}

/**
 * Whether the current view is already scoped to one profile's own personal
 * domain/subdomain — needed for links to a page *within that same profile*
 * (e.g. an embedded page). On a personal domain, proxy.ts already rewrites
 * `/slug` to `/{username}/slug` internally, so a link built with the
 * `/{username}/slug` prefix (useProfileUrl's shape, meant for cross-profile
 * links) would self-nest into a broken path there instead.
 */
export function usePersonalDomainView(): boolean {
  return useContext(ProfileUrlContext);
}
