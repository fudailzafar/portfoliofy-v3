import { headers } from 'next/headers';
import { getMainDomainLlmsTxt, getUserLlmsTxt } from '@/lib/server/llmsTxt';
import { classifyHost } from '@/lib/site';

export async function GET() {
  const host = classifyHost((await headers()).get('host'));

  let body: string;
  if (host.kind === 'main') {
    body = await getMainDomainLlmsTxt();
  } else {
    // On a user's subdomain or custom domain, describe just that user.
    const identifier =
      host.kind === 'subdomain' ? host.username : host.hostname;
    body =
      (await getUserLlmsTxt(identifier, `https://${host.hostname}`)) ??
      (await getMainDomainLlmsTxt());
  }

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
