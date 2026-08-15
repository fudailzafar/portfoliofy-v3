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
