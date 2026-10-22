import sql from '@/lib/server/db';
import { getUserData } from '@/app/[username]/utils';
import { estimateReadMinutes, getAllPageAttachments } from '@/lib/resume';
import { SITE_URL } from '@/lib/site';

function stripHtml(html?: string): string {
  return html ? html.replace(/<[^>]*>?/gm, '').trim() : '';
}

// One line, safe inside a Markdown list item.
function oneLine(text?: string): string {
  return (text || '').replace(/\s+/g, ' ').trim();
}

export async function getMainDomainLlmsTxt(): Promise<string> {
  let profiles = '';
  try {
    const rows = await sql`
      SELECT u.username, r.resume_data as "resumeData"
      FROM users u
      JOIN resumes r ON u.id = r.user_id
      WHERE r.status = 'live'
      ORDER BY u.username
    `;
    for (const row of rows ?? []) {
      const resumeData =
        typeof row.resumeData === 'string'
          ? JSON.parse(row.resumeData)
          : row.resumeData;
      const name = oneLine(resumeData?.header?.name) || row.username;
      const about = oneLine(resumeData?.header?.shortAbout);
      profiles += `- [${name}](${SITE_URL}/${row.username})${about ? `: ${about}` : ''}\n`;
    }
  } catch (error) {
    console.error('Failed to list profiles for llms.txt:', error);
  }

  return `# Portfoliofy

> Portfoliofy is a drag-and-drop portfolio builder for professionals. Each person gets a profile with their work, education and writing, at ${SITE_URL}/{username} or on their own domain.

## How the site is organized

- Profiles: ${SITE_URL}/{username}
- A person's writing: ${SITE_URL}/{username}/{slug}
- A plain-text summary of one person: ${SITE_URL}/{username}/llms.txt

## Pages

- [Home](${SITE_URL}): What Portfoliofy is.
- [FAQ](${SITE_URL}/faq): Frequently asked questions about Portfoliofy.
${profiles ? `\n## Profiles\n\n${profiles}` : ''}
## Contact

Support: fudail.zafar@gmail.com
`;
}

// Describes one person: their headline, bio and published writing. Only
// pages the public can read are listed (no drafts, hidden or locked pages).
export async function getUserLlmsTxt(
  identifier: string,
  baseUrl: string,
): Promise<string | null> {
  const { resume } = await getUserData(identifier);
  if (!resume?.resumeData) return null;

  const { header, summary } = resume.resumeData;
  const bio = stripHtml(summary).slice(0, 300);

  let out = `# ${oneLine(header.name)}\n`;
  if (header.shortAbout) out += `\n> ${oneLine(header.shortAbout)}\n`;
  if (bio) out += `\n${bio}\n`;
  out += `\nProfile: ${baseUrl}\n`;

  const posts = getAllPageAttachments(resume.resumeData)
    .map((p) => ({
      ...p,
      parsedDate: p.createdAt ? new Date(p.createdAt) : null,
    }))
    .sort(
      (a, b) => (b.parsedDate?.getTime() || 0) - (a.parsedDate?.getTime() || 0),
    );

  if (posts.length > 0) {
    out += `\n## Writing\n\n`;
    for (const post of posts) {
      const readTime = `${estimateReadMinutes(post.content || '')} min read`;
      out += `- [${oneLine(post.title) || 'Untitled'}](${baseUrl}/${post.slug}): ${readTime}\n`;
    }
  }

  return out;
}
