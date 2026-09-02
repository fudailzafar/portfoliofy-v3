import { headers } from 'next/headers';
import { getUserData } from '@/app/[username]/utils';
import { estimateReadMinutes } from '@/lib/resume';
import { SITE_URL } from '@/lib/site';

function stripHtml(html?: string): string {
  return html ? html.replace(/<[^>]*>?/gm, '').trim() : '';
}

function getMainDomainLlmsTxt(): string {
  return `# Portfoliofy

> Portfoliofy is a drag-and-drop portfolio builder for professionals. It provides a clean, minimal, and accessible interface for building and sharing resumes, portfolios, and contact information.

## System Guidelines

This site is designed to be easily read by AI systems.
- The main entry point is at ${SITE_URL}
- User profiles are located at ${SITE_URL}/{username}
- Each user's own writing lives at ${SITE_URL}/{username}/{slug}

## Pages

- [Home](${SITE_URL}): Explore Portfoliofy and its users.
- [FAQ](${SITE_URL}/faq): Frequently asked questions about Portfoliofy.

## Contact

Support: support@portfoliofy.me
`;
}

// A subdomain (username.portfoliofy.me) or a connected custom domain
// (fudailzafar.com): the host itself identifies the one user this
// llms.txt describes, same scoping as app/sitemap.ts's single-user branch.
async function getSingleUserLlmsTxt(
  identifier: string,
  baseUrl: string,
): Promise<string> {
  const { resume } = await getUserData(identifier);
  if (!resume?.resumeData) return getMainDomainLlmsTxt();

  const { header, summary, pages } = resume.resumeData;
  const bio = stripHtml(summary).slice(0, 300);

  let out = `# ${header.name}\n`;
  if (header.shortAbout) out += `\n> ${header.shortAbout}\n`;
  if (bio) out += `\n${bio}\n`;

  const publishedPosts = (pages || [])
    .filter((p) => !p.hidden)
    .map((p) => ({
      ...p,
      parsedDate: p.createdAt ? new Date(p.createdAt) : null,
    }))
    .sort(
      (a, b) => (b.parsedDate?.getTime() || 0) - (a.parsedDate?.getTime() || 0),
    );

  if (publishedPosts.length > 0) {
    out += `\n## Writing\n\n`;
    for (const post of publishedPosts) {
      const url = `${baseUrl}/${post.slug || post.id}`;
      const readTime = `${estimateReadMinutes(post.content || '')} min read`;
      out += `- [${post.title || 'Untitled'}](${url}): ${readTime}\n`;
    }
  }

  return out;
}

export async function GET() {
  const headersList = await headers();
  const hostHeader = headersList.get('host') || '';
  const hostname = hostHeader.split(':')[0];

  const isMainDomain =
    hostname === 'portfoliofy.me' ||
    hostname === 'www.portfoliofy.me' ||
    hostname === 'localhost' ||
    hostname.endsWith('.vercel.app');

  let body: string;
  if (isMainDomain || !hostname) {
    body = getMainDomainLlmsTxt();
  } else {
    const isSubdomain =
      (hostname.endsWith('.portfoliofy.me') &&
        hostname !== 'www.portfoliofy.me') ||
      (hostname.endsWith('.localhost') && hostname !== 'localhost');

    const identifier = isSubdomain
      ? hostname.replace('.portfoliofy.me', '').replace('.localhost', '')
      : hostname;

    body = await getSingleUserLlmsTxt(identifier, `https://${hostname}`);
  }

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
