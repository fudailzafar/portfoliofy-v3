'use client';

import { createContext, useContext } from 'react';
import { SITE_HOST, SITE_URL, SUBDOMAINS_ENABLED } from '@/lib/site';

// True when the page is served from a user's own subdomain or custom domain.
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
 * Builds a link to another user's profile: relative on the main site;
 * absolute (their subdomain, or main-site path) from a personal domain.
 */
export function useProfileUrl(): (username: string) => string {
  const isPersonalDomainView = useContext(ProfileUrlContext);
  return (username: string) => {
    if (!isPersonalDomainView) return `/${username}`;
    return SUBDOMAINS_ENABLED
      ? `https://${username}.${SITE_HOST}`
      : `${SITE_URL}/${username}`;
  };
}

// On a personal domain, links within the same profile omit the username:
// `/slug` already maps to `/{username}/slug` there.
export function usePersonalDomainView(): boolean {
  return useContext(ProfileUrlContext);
}
