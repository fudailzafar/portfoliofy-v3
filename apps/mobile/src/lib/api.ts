import { createApiClient } from '@portfoliofy/shared/api/client';
import { SITE_URL } from './config';
import { getAccessToken, refreshSession } from './tokens';

export const api = createApiClient({
  baseUrl: SITE_URL,
  getAccessToken,
  // Called when the server answers 401 to a token we thought was good.
  refreshAccessToken: async () => (await refreshSession()) !== null,
});
