// Where the API lives. A development build can point at a preview deployment
// by setting EXPO_PUBLIC_API_URL when it is built.
export const SITE_URL = (
  process.env.EXPO_PUBLIC_API_URL ?? 'https://portfoliofy.site'
).replace(/\/+$/, '');

// Our own app's built-in OAuth client; the server knows it by this id.
export const OAUTH_CLIENT_ID = 'portfoliofy-android';
export const OAUTH_SCOPE = 'app';
// Where the server sends the browser back to the app. Must match the server.
export const OAUTH_REDIRECT_URI = 'com.portfoliofy.app:/oauth/callback';

export const OAUTH_DISCOVERY = {
  authorizationEndpoint: `${SITE_URL}/oauth/authorize`,
  tokenEndpoint: `${SITE_URL}/oauth/token`,
};

// The public address people share, whatever API a build talks to.
export const PUBLIC_SITE_URL = 'https://portfoliofy.site';
