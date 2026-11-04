import type { McpServer } from '@modelcontextprotocol/server';
import { z } from 'zod-v4';
import type { AttachmentSchemaType } from '@/lib/resume';
import {
  getPageViewSeries,
  getResume,
  getUsernameById,
} from '@/lib/server/dbActions';
import { toOwnerResume } from '@/lib/server/pagePasswords';
import { SITE_URL } from '@/lib/site';

const READ_ONLY = { readOnlyHint: true, openWorldHint: false };

// Tool context carries the verified token; withMcpAuth guarantees it exists.
function userIdFrom(ctx: {
  http?: { authInfo?: { extra?: unknown } };
}): string {
  const extra = ctx.http?.authInfo?.extra as { userId?: string } | undefined;
  if (!extra?.userId) throw new Error('Not signed in');
  return extra.userId;
}

function jsonResult(data: unknown) {
  return {
    content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
  };
}

function errorResult(message: string) {
  return { content: [{ type: 'text' as const, text: message }], isError: true };
}

function pageSummary(
  page: AttachmentSchemaType & { passwordProtected?: boolean },
) {
  return {
    id: page.id,
    title: page.title,
    slug: page.slug,
    published: !page.hidden,
    passwordProtected: !!page.passwordProtected,
    date: page.createdAt,
  };
}

async function loadOwnerResume(userId: string) {
  const resume = await getResume(userId);
  return resume?.resumeData
    ? { resume, resumeData: toOwnerResume(resume.resumeData) }
    : null;
}

export function registerReadTools(server: McpServer) {
  server.registerTool(
    'get_my_profile',
    {
      title: 'Get my profile',
      description:
        "Reads the signed-in user's full Portfoliofy profile: header, sections and a summary of their pages. Call this before suggesting changes.",
      inputSchema: z.object({}),
      annotations: READ_ONLY,
    },
    async (_args, ctx) => {
      const userId = userIdFrom(ctx);
      const [loaded, username] = await Promise.all([
        loadOwnerResume(userId),
        getUsernameById(userId),
      ]);
      if (!loaded) return errorResult('This account has no profile yet.');

      const { pages = [], ...profile } = loaded.resumeData;
      return jsonResult({
        username,
        url: `${SITE_URL}/${username}`,
        status: loaded.resume.status,
        version: loaded.resume.version,
        profile,
        pages: pages.map(pageSummary),
      });
    },
  );

  server.registerTool(
    'list_my_pages',
    {
      title: 'List my pages',
      description:
        "Lists the signed-in user's pages and posts, including drafts, without their content.",
      inputSchema: z.object({}),
      annotations: READ_ONLY,
    },
    async (_args, ctx) => {
      const loaded = await loadOwnerResume(userIdFrom(ctx));
      return jsonResult((loaded?.resumeData.pages ?? []).map(pageSummary));
    },
  );

  server.registerTool(
    'get_my_page',
    {
      title: 'Get one of my pages',
      description:
        "Reads the full content of one of the signed-in user's pages. Get the id from list_my_pages.",
      inputSchema: z.object({ pageId: z.string() }),
      annotations: READ_ONLY,
    },
    async ({ pageId }, ctx) => {
      const loaded = await loadOwnerResume(userIdFrom(ctx));
      const page = loaded?.resumeData.pages?.find((p) => p.id === pageId);
      if (!page) return errorResult('No page with that id.');
      return jsonResult({ ...pageSummary(page), content: page.content });
    },
  );

  server.registerTool(
    'get_my_insights',
    {
      title: 'Get my profile views',
      description:
        "Reads how many people viewed the signed-in user's profile, as a total and per day.",
      inputSchema: z.object({
        range: z.enum(['week', 'month', 'year', 'all']).default('week'),
      }),
      annotations: READ_ONLY,
    },
    async ({ range }, ctx) => {
      const series = await getPageViewSeries(userIdFrom(ctx), range, false);
      return jsonResult({
        range,
        total: series.reduce((sum, day) => sum + day.views, 0),
        series,
      });
    },
  );
}
