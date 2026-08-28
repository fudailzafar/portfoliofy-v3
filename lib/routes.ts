// Route path prefixes that require an authenticated session — checked in
// proxy.ts middleware. Do NOT add page routes here (e.g. 'terms', 'faq') or
// they'll be auth-gated and become unreachable while signed out.
export const PRIVATE_ROUTES = ['api'];

// Usernames that can't be claimed because they'd collide with a real route,
// or a name we want to keep unambiguous — checked in lib/server/dbActions.ts.
// This is a separate list from PRIVATE_ROUTES on purpose: reusing one array
// for both used to mean expanding this list would have silently auth-gated
// public marketing pages.
export const RESERVED_USERNAMES = [
  'api',
  'auth',
  'privacy',
  'faq',
  'terms',
  'www',
  'explore',
  'press',
  'about',
];
