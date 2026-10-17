import { getCustomDomainByUserId } from '@/lib/server/dbActions';

export const VERCEL_API_TOKEN = process.env.VERCEL_API_TOKEN;
export const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID;
const TEAM_ID_PARAM = process.env.VERCEL_TEAM_ID
  ? `?teamId=${process.env.VERCEL_TEAM_ID}`
  : '';

export function hasVercelDomainConfig(): boolean {
  return Boolean(VERCEL_API_TOKEN && VERCEL_PROJECT_ID);
}

export async function fetchVercelAPI(
  endpoint: string,
  options: RequestInit = {},
) {
  const url = `https://api.vercel.com${endpoint}${TEAM_ID_PARAM}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${VERCEL_API_TOKEN}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => null);
  return { ok: response.ok, status: response.status, data };
}

// Shared by domain disconnect and account deletion, so a deleted account
// never leaves its domain attached to the project.
export async function releaseUserDomainFromVercel(
  userId: string,
): Promise<void> {
  if (!hasVercelDomainConfig()) return;

  const domain = await getCustomDomainByUserId(userId);
  if (!domain) return;

  await fetchVercelAPI(
    `/v9/projects/${VERCEL_PROJECT_ID}/domains/${encodeURIComponent(domain)}`,
    { method: 'DELETE' },
  );
}
