'use client';

import { createContext, useContext } from 'react';

/**
 * Provides a context-aware function for generating profile URLs.
 *
 * - On portfoliofy.me/username  → relative path  (/username)
 * - On subdomain or custom domain → absolute subdomain URL (https://username.portfoliofy.me)
 */
export const ProfileUrlContext = createContext<(username: string) => string>(
  // Default: relative path (correct for the main platform)
  (username: string) => `/${username}`,
);

export function useProfileUrl() {
  return useContext(ProfileUrlContext);
}
