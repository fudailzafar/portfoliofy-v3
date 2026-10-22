import { getUserLlmsTxt } from '@/lib/server/llmsTxt';
import { SITE_URL } from '@/lib/site';

// portfoliofy.me/{username}/llms.txt: one person, for agents that land on
// the main domain rather than a personal one.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ username: string }> },
) {
  const { username } = await params;
  const body = username.includes('.')
    ? null
    : await getUserLlmsTxt(username, `${SITE_URL}/${username}`);

  if (!body) return new Response('Not found', { status: 404 });

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
