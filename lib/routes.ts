// Path prefixes that require a session (checked in proxy.ts). Don't add page
// routes here, or they become unreachable when signed out.
export const PRIVATE_ROUTES = ['api'];

// Usernames that can't be claimed because they'd collide with a route. Kept
// separate from PRIVATE_ROUTES so adding one never auth-gates a page.
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
