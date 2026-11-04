import crypto from 'crypto';
import type { McpServer } from '@modelcontextprotocol/server';
import { revalidateTag } from 'next/cache';
import { z as zod3 } from 'zod';
import { z } from 'zod-v4';
import {
  getResume,
  getUsernameById,
  listResumeHistory,
  ResumeConflictError,
  restoreResumeSnapshot,
  ResumeData,
  setUserStatus,
  storeResume,
  undoLastResumeChange,
} from '@/lib/server/dbActions';
import { checkRateLimit } from '@/lib/server/rateLimit';
import { SITE_URL } from '@/lib/site';
import {
  addItem,
  createDraft,
  EditError,
  formatIssues,
  ITEM_SECTIONS,
  itemFieldNames,
  removeItem,
  reorderSections,
  setPagePublished,
  updateItem,
  updatePage,
} from './profileEdits';
import {
  errorResult,
  jsonResult,
  McpContext,
  requireUser,
} from './toolResults';

const WRITE_SCOPE = 'profile:write';
const WRITE_MAX_REQUESTS = 60;
const WRITE_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_CONTENT_LENGTH = 200_000;

const LIVE_NOTE =
  'Changes go live on the public profile immediately, so show the user the change and get their agreement first.';

const ADDITIVE = {
  readOnlyHint: false,
  destructiveHint: false,
  openWorldHint: false,
};
const DESTRUCTIVE = {
  readOnlyHint: false,
  destructiveHint: true,
  openWorldHint: false,
};

const confirmed = z
  .literal(true)
  .describe('Set to true only after the user has clearly confirmed this.');

const itemSection = z.enum(ITEM_SECTIONS);

const sectionFieldHelp = ITEM_SECTIONS.map(
  (section) => `${section}: ${itemFieldNames(section).join(', ')}`,
).join('\n');

function revalidateResume(userId: string) {
  // @ts-expect-error Next.js 16 Canary types require second profile argument
  revalidateTag(`resume-v2-${userId}`);
}

/** Applies an edit to the latest profile, retrying once if it changes mid-save. */
async function saveEdit(
  userId: string,
  edit: (data: ResumeData) => ResumeData,
): Promise<number> {
  const attempt = async () => {
    const resume = await getResume(userId);
    if (!resume?.resumeData) {
      throw new EditError('This account has no profile yet.');
    }
    return storeResume(
      userId,
      { ...resume, resumeData: edit(resume.resumeData) },
      { snapshotSource: 'mcp' },
    );
  };

  let version: number;
  try {
    version = await attempt();
  } catch (error) {
    if (!(error instanceof ResumeConflictError)) throw error;
    version = await attempt();
  }
  revalidateResume(userId);
  return version;
}

async function savedResult(userId: string, version: number, extra = {}) {
  const username = await getUsernameById(userId);
  return jsonResult({
    saved: true,
    version,
    profileUrl: `${SITE_URL}/${username}`,
    ...extra,
  });
}

/** Common checks for every write tool, and errors the AI can act on. */
async function runWrite<T>(
  ctx: McpContext,
  action: (userId: string) => Promise<T>,
) {
  try {
    const userId = requireUser(ctx, WRITE_SCOPE);
    const { allowed } = await checkRateLimit(
      `mcp-write:${userId}`,
      WRITE_MAX_REQUESTS,
      WRITE_WINDOW_MS,
    );
    if (!allowed) {
      return errorResult('Too many changes. Try again later.');
    }
    return await action(userId);
  } catch (error) {
    if (error instanceof EditError || error instanceof ResumeConflictError) {
      return errorResult(error.message);
    }
    if (error instanceof zod3.ZodError) {
      return errorResult(`Not saved. ${formatIssues(error)}`);
    }
    console.error('Error in MCP write tool:', error);
    return errorResult('Something went wrong, so nothing was saved.');
  }
}

export function registerWriteTools(server: McpServer) {
  server.registerTool(
    'update_header',
    {
      title: 'Update my header',
      description: `Updates the profile header. Only the fields given change. ${LIVE_NOTE}`,
      inputSchema: z.object({
        name: z.string().min(1).max(48).optional(),
        shortAbout: z.string().max(36).optional().describe('What you do'),
        location: z.string().max(24).optional(),
        pronouns: z.string().max(12).optional(),
        website: z.string().max(96).optional(),
        skills: z
          .array(z.string().max(60))
          .max(100)
          .optional()
          .describe('The complete list of skills; replaces the current one.'),
      }),
      annotations: DESTRUCTIVE,
    },
    async (args, ctx) =>
      runWrite(ctx, async (userId) => {
        const fields = Object.fromEntries(
          Object.entries(args).filter(([, value]) => value !== undefined),
        );
        const version = await saveEdit(userId, (data) => ({
          ...data,
          header: { ...data.header, ...fields },
        }));
        return savedResult(userId, version);
      }),
  );

  server.registerTool(
    'update_about',
    {
      title: 'Update my About text',
      description: `Replaces the About text on the profile. Accepts simple HTML. ${LIVE_NOTE}`,
      inputSchema: z.object({ about: z.string().max(10_000) }),
      annotations: DESTRUCTIVE,
    },
    async ({ about }, ctx) =>
      runWrite(ctx, async (userId) => {
        const version = await saveEdit(userId, (data) => ({
          ...data,
          summary: about,
        }));
        return savedResult(userId, version);
      }),
  );

  server.registerTool(
    'add_item',
    {
      title: 'Add a profile item',
      description: `Adds an item, such as a job, to a section. ${LIVE_NOTE} Fields for each section:\n${sectionFieldHelp}`,
      inputSchema: z.object({
        section: itemSection,
        fields: z.record(z.string(), z.unknown()),
      }),
      annotations: ADDITIVE,
    },
    async ({ section, fields }, ctx) =>
      runWrite(ctx, async (userId) => {
        const itemId = crypto.randomUUID();
        const version = await saveEdit(userId, (data) =>
          addItem(data, section, fields, itemId),
        );
        return savedResult(userId, version, { itemId });
      }),
  );

  server.registerTool(
    'update_item',
    {
      title: 'Update a profile item',
      description: `Changes fields on an item. Only the fields given change. Get the id from get_my_profile. ${LIVE_NOTE}`,
      inputSchema: z.object({
        section: itemSection,
        itemId: z.string(),
        fields: z.record(z.string(), z.unknown()),
      }),
      annotations: DESTRUCTIVE,
    },
    async ({ section, itemId, fields }, ctx) =>
      runWrite(ctx, async (userId) => {
        const version = await saveEdit(userId, (data) =>
          updateItem(data, section, itemId, fields),
        );
        return savedResult(userId, version);
      }),
  );

  server.registerTool(
    'remove_item',
    {
      title: 'Remove a profile item',
      description: `Removes an item from a section. ${LIVE_NOTE}`,
      inputSchema: z.object({
        section: itemSection,
        itemId: z.string(),
        confirmed,
      }),
      annotations: DESTRUCTIVE,
    },
    async ({ section, itemId }, ctx) =>
      runWrite(ctx, async (userId) => {
        const version = await saveEdit(userId, (data) =>
          removeItem(data, section, itemId),
        );
        return savedResult(userId, version);
      }),
  );

  server.registerTool(
    'reorder_sections',
    {
      title: 'Reorder profile sections',
      description: `Sets the order sections appear in. Sections left out keep their place after those named. ${LIVE_NOTE}`,
      inputSchema: z.object({ order: z.array(z.string()).min(1).max(20) }),
      annotations: DESTRUCTIVE,
    },
    async ({ order }, ctx) =>
      runWrite(ctx, async (userId) => {
        const version = await saveEdit(userId, (data) =>
          reorderSections(data, order),
        );
        return savedResult(userId, version);
      }),
  );

  server.registerTool(
    'set_status',
    {
      title: 'Set my status',
      description: `Sets the short status shown on the profile, or clears it if text is left out. Undo does not cover this. ${LIVE_NOTE}`,
      inputSchema: z.object({
        text: z.string().max(280).optional(),
        emoji: z.string().max(16).optional(),
      }),
      annotations: DESTRUCTIVE,
    },
    async ({ text, emoji }, ctx) =>
      runWrite(ctx, async (userId) => {
        await setUserStatus(userId, emoji ?? null, text ?? null);
        return jsonResult({ saved: true });
      }),
  );

  server.registerTool(
    'create_draft',
    {
      title: 'Create a draft page',
      description:
        'Creates an unpublished page or post. Nobody else can see it until it is published. Content is simple HTML.',
      inputSchema: z.object({
        title: z.string().min(1).max(200),
        content: z.string().max(MAX_CONTENT_LENGTH),
      }),
      annotations: ADDITIVE,
    },
    async ({ title, content }, ctx) =>
      runWrite(ctx, async (userId) => {
        const pageId = crypto.randomUUID();
        const version = await saveEdit(userId, (data) =>
          createDraft(data, { title, content }, pageId, new Date()),
        );
        return savedResult(userId, version, { pageId, published: false });
      }),
  );

  server.registerTool(
    'update_page',
    {
      title: 'Update a page',
      description: `Changes the title or content of a page. If the page is published, ${LIVE_NOTE}`,
      inputSchema: z.object({
        pageId: z.string(),
        title: z.string().min(1).max(200).optional(),
        content: z.string().max(MAX_CONTENT_LENGTH).optional(),
      }),
      annotations: DESTRUCTIVE,
    },
    async ({ pageId, title, content }, ctx) =>
      runWrite(ctx, async (userId) => {
        const version = await saveEdit(userId, (data) =>
          updatePage(data, pageId, { title, content }),
        );
        return savedResult(userId, version);
      }),
  );

  server.registerTool(
    'set_page_published',
    {
      title: 'Publish or unpublish a page',
      description:
        'Makes a page public, or returns it to a draft. Only do this when the user has asked for this specific page.',
      inputSchema: z.object({
        pageId: z.string(),
        published: z.boolean(),
        confirmed,
      }),
      annotations: DESTRUCTIVE,
    },
    async ({ pageId, published }, ctx) =>
      runWrite(ctx, async (userId) => {
        const version = await saveEdit(userId, (data) =>
          setPagePublished(data, pageId, published),
        );
        return savedResult(userId, version, { published });
      }),
  );

  server.registerTool(
    'list_history',
    {
      title: 'List saved versions',
      description:
        'Lists the versions saved before each AI change, newest first. Use an id with restore_version.',
      inputSchema: z.object({}),
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async (_args, ctx) =>
      runWrite(ctx, async (userId) =>
        jsonResult(await listResumeHistory(userId)),
      ),
  );

  server.registerTool(
    'undo_last_change',
    {
      title: 'Undo the last AI change',
      description:
        'Puts the profile back to how it was before the most recent AI change. It refuses if the profile has been edited since, so nothing newer is lost.',
      inputSchema: z.object({}),
      annotations: DESTRUCTIVE,
    },
    async (_args, ctx) =>
      runWrite(ctx, async (userId) => {
        const result = await undoLastResumeChange(userId);
        if ('error' in result) return errorResult(result.error);
        revalidateResume(userId);
        return savedResult(userId, result.version, { undone: true });
      }),
  );

  server.registerTool(
    'restore_version',
    {
      title: 'Restore an older version',
      description:
        'Replaces the whole profile with a saved version from list_history, losing anything since. The current profile is saved first, so this can be undone.',
      inputSchema: z.object({ historyId: z.string(), confirmed }),
      annotations: DESTRUCTIVE,
    },
    async ({ historyId }, ctx) =>
      runWrite(ctx, async (userId) => {
        const result = await restoreResumeSnapshot(userId, historyId);
        if ('error' in result) return errorResult(result.error);
        revalidateResume(userId);
        return savedResult(userId, result.version, { restored: true });
      }),
  );
}
