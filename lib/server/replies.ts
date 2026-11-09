// Private replies: sending, inbox, threads, blocking and reports.
// Every rule lives here, not in the database or the UI. Routes only check the
// session and the request shape, then call these functions.

import sql from './db';
import { normalizeUsername } from '../validation/username';
import {
  buildItemContext,
  buildStatusContext,
  isEmojiOnly,
  type ReplyContext,
  type ReplyTarget,
  type ReportReason,
} from '../replies';
import type { ResumeData } from './dbActions';

export const THREAD_PAGE_SIZE = 50;
const INBOX_LIMIT = 50;

/**
 * Why a reply was refused. `not_accepting` covers both "this person turned
 * replies off" and "this person blocked you", so a block is never revealed.
 */
export type ReplyFailure =
  | 'not_found'
  | 'self'
  | 'not_accepting'
  | 'blocked_by_you'
  | 'target_unavailable';

export type SendResult =
  | { ok: true; conversationId: string; messageId: number }
  | { ok: false; reason: ReplyFailure };

interface Person {
  id: string;
  username: string;
  name: string | null;
  image: string | null;
  repliesEnabled: boolean;
  statusEmoji: string | null;
  statusText: string | null;
}

async function findPersonByUsername(username: string): Promise<Person | null> {
  const [row] = await sql`
    SELECT id, username, name, COALESCE(custom_image, image) AS image,
           replies_enabled, status_emoji, status_text
    FROM users
    WHERE username = ${normalizeUsername(username)}
  `;
  return (row as Person | undefined) ?? null;
}

/** Block state between two people, in both directions. */
async function blockState(me: string, other: string) {
  const rows = await sql`
    SELECT blocker_id
    FROM user_blocks
    WHERE (blocker_id = ${me} AND blocked_id = ${other})
       OR (blocker_id = ${other} AND blocked_id = ${me})
  `;
  return {
    blockedByMe: rows.some((row) => row.blockerId === me),
    blockedMe: rows.some((row) => row.blockerId === other),
  };
}

/** Can `senderId` send `recipient` a message right now? */
async function checkCanMessage(
  senderId: string,
  recipient: Pick<Person, 'id' | 'repliesEnabled'>,
): Promise<ReplyFailure | null> {
  if (recipient.id === senderId) return 'self';
  const { blockedByMe, blockedMe } = await blockState(senderId, recipient.id);
  if (blockedMe) return 'not_accepting';
  if (blockedByMe) return 'blocked_by_you';
  if (!recipient.repliesEnabled) return 'not_accepting';
  return null;
}

async function getLiveResumeData(userId: string): Promise<ResumeData | null> {
  const [row] = await sql`
    SELECT status, resume_data AS "resumeData"
    FROM resumes
    WHERE user_id = ${userId}
  `;
  if (!row || row.status !== 'live') return null;
  return typeof row.resumeData === 'string'
    ? JSON.parse(row.resumeData)
    : (row.resumeData as ResumeData);
}

async function resolveContext(
  recipient: Person,
  target: ReplyTarget | undefined,
): Promise<{ ok: true; context: ReplyContext | null } | { ok: false }> {
  if (!target) return { ok: true, context: null };

  if (target.kind === 'status') {
    const context = buildStatusContext(
      recipient.statusEmoji,
      recipient.statusText,
    );
    return context ? { ok: true, context } : { ok: false };
  }

  const resumeData = await getLiveResumeData(recipient.id);
  const context = buildItemContext(resumeData, target.section, target.itemId);
  return context ? { ok: true, context } : { ok: false };
}

/**
 * Stores a message, creating the conversation on first contact. The pair is
 * ordered by the database (least/greatest), the same way its check constraint
 * compares, so the order can't disagree with JavaScript's string comparison.
 */
async function deliver(args: {
  senderId: string;
  recipientId: string;
  body: string;
  context: ReplyContext | null;
}): Promise<{ conversationId: string; messageId: number }> {
  const { senderId, recipientId, context } = args;
  const body = args.body.trim();
  const contextJson = context ? JSON.stringify(context) : null;

  const result = await sql.begin(async (tx) => {
    const [conversation] = await tx`
      INSERT INTO conversations (user_a, user_b)
      VALUES (
        LEAST(${senderId}::text, ${recipientId}::text),
        GREATEST(${senderId}::text, ${recipientId}::text)
      )
      ON CONFLICT (user_a, user_b) DO UPDATE SET user_a = EXCLUDED.user_a
      RETURNING id
    `;
    const conversationId = conversation.id as string;

    // Both people see the conversation again, even if they had hidden it.
    // What the sender just wrote counts as read for them. A recipient who is
    // new to the conversation starts with nothing read (the epoch), so this
    // first message is unread; an existing one keeps their read position.
    await tx`
      INSERT INTO conversation_members (conversation_id, user_id, last_read_at)
      VALUES (${conversationId}, ${senderId}, clock_timestamp())
      ON CONFLICT (conversation_id, user_id)
      DO UPDATE SET hidden_at = NULL, last_read_at = clock_timestamp()
    `;
    await tx`
      INSERT INTO conversation_members (conversation_id, user_id, last_read_at)
      VALUES (${conversationId}, ${recipientId}, 'epoch'::timestamptz)
      ON CONFLICT (conversation_id, user_id) DO UPDATE SET hidden_at = NULL
    `;

    // clock_timestamp() (not NOW()) so two writes in one transaction still
    // get distinct times, and unread is judged by when the message was stored.
    const [message] = await tx`
      INSERT INTO messages (conversation_id, sender_id, body, is_emoji_only, context, created_at)
      VALUES (
        ${conversationId},
        ${senderId},
        ${body},
        ${isEmojiOnly(body)},
        ${contextJson}::jsonb,
        clock_timestamp()
      )
      RETURNING id
    `;

    await tx`
      UPDATE conversations SET last_message_at = clock_timestamp()
      WHERE id = ${conversationId}
    `;

    return { conversationId, messageId: Number(message.id) };
  });

  return result;
}

/** First contact, or a reply to a profile item or status. */
export async function sendReply(args: {
  senderId: string;
  recipientUsername: string;
  body: string;
  target?: ReplyTarget;
}): Promise<SendResult> {
  const recipient = await findPersonByUsername(args.recipientUsername);
  if (!recipient) return { ok: false, reason: 'not_found' };

  const refusal = await checkCanMessage(args.senderId, recipient);
  if (refusal) return { ok: false, reason: refusal };

  // Replies are for profiles people can see.
  if (!(await getLiveResumeData(recipient.id))) {
    return { ok: false, reason: 'not_found' };
  }

  const resolved = await resolveContext(recipient, args.target);
  if (!resolved.ok) return { ok: false, reason: 'target_unavailable' };

  const sent = await deliver({
    senderId: args.senderId,
    recipientId: recipient.id,
    body: args.body,
    context: resolved.context,
  });
  return { ok: true, ...sent };
}

async function loadMembership(userId: string, conversationId: string) {
  const [row] = await sql`
    SELECT o.id AS other_id, o.username, o.name,
           COALESCE(o.custom_image, o.image) AS image,
           o.replies_enabled, me.last_read_at
    FROM conversations c
    JOIN conversation_members me
      ON me.conversation_id = c.id AND me.user_id = ${userId}
    JOIN users o
      ON o.id = CASE WHEN c.user_a = ${userId} THEN c.user_b ELSE c.user_a END
    WHERE c.id = ${conversationId}
  `;
  return row as
    | {
        otherId: string;
        username: string;
        name: string | null;
        image: string | null;
        repliesEnabled: boolean;
        lastReadAt: Date;
      }
    | undefined;
}

/** A plain message inside a conversation the sender already belongs to. */
export async function sendInConversation(args: {
  senderId: string;
  conversationId: string;
  body: string;
}): Promise<SendResult> {
  const member = await loadMembership(args.senderId, args.conversationId);
  if (!member) return { ok: false, reason: 'not_found' };

  const refusal = await checkCanMessage(args.senderId, {
    id: member.otherId,
    repliesEnabled: member.repliesEnabled,
  });
  if (refusal) return { ok: false, reason: refusal };

  const sent = await deliver({
    senderId: args.senderId,
    recipientId: member.otherId,
    body: args.body,
    context: null,
  });
  return { ok: true, ...sent };
}

export interface InboxItem {
  conversationId: string;
  other: {
    id: string;
    username: string;
    name: string | null;
    image: string | null;
  };
  lastMessage: {
    body: string;
    mine: boolean;
    emojiOnly: boolean;
    createdAt: Date;
  } | null;
  unread: number;
  lastMessageAt: Date | null;
}

export async function listInbox(userId: string): Promise<InboxItem[]> {
  const rows = await sql`
    SELECT c.id, c.last_message_at,
           o.id AS other_id, o.username AS other_username,
           o.name AS other_name, COALESCE(o.custom_image, o.image) AS other_image,
           lm.body AS last_body, lm.sender_id AS last_sender_id,
           lm.is_emoji_only AS last_emoji_only, lm.created_at AS last_created_at,
           (
             SELECT COUNT(*) FROM messages m
             WHERE m.conversation_id = c.id
               AND m.sender_id <> ${userId}
               AND m.deleted_at IS NULL
               AND m.created_at > me.last_read_at
           )::int AS unread
    FROM conversations c
    JOIN conversation_members me
      ON me.conversation_id = c.id AND me.user_id = ${userId}
    JOIN users o
      ON o.id = CASE WHEN c.user_a = ${userId} THEN c.user_b ELSE c.user_a END
    LEFT JOIN LATERAL (
      SELECT body, sender_id, is_emoji_only, created_at
      FROM messages m
      WHERE m.conversation_id = c.id AND m.deleted_at IS NULL
      ORDER BY m.id DESC
      LIMIT 1
    ) lm ON TRUE
    WHERE (c.user_a = ${userId} OR c.user_b = ${userId})
      AND (me.hidden_at IS NULL OR c.last_message_at > me.hidden_at)
    ORDER BY c.last_message_at DESC NULLS LAST
    LIMIT ${INBOX_LIMIT}
  `;

  return rows.map((row) => ({
    conversationId: row.id as string,
    other: {
      id: row.otherId,
      username: row.otherUsername,
      name: row.otherName,
      image: row.otherImage,
    },
    lastMessage: row.lastBody
      ? {
          body: row.lastBody,
          mine: row.lastSenderId === userId,
          emojiOnly: row.lastEmojiOnly,
          createdAt: row.lastCreatedAt,
        }
      : null,
    unread: row.unread,
    lastMessageAt: row.lastMessageAt,
  }));
}

/** Conversations with something unread, for the dot on the nav icon. */
export async function countUnreadConversations(
  userId: string,
): Promise<number> {
  const [row] = await sql`
    SELECT COUNT(*)::int AS n
    FROM conversations c
    JOIN conversation_members me
      ON me.conversation_id = c.id AND me.user_id = ${userId}
    WHERE (me.hidden_at IS NULL OR c.last_message_at > me.hidden_at)
      AND EXISTS (
        SELECT 1 FROM messages m
        WHERE m.conversation_id = c.id
          AND m.sender_id <> ${userId}
          AND m.deleted_at IS NULL
          AND m.created_at > me.last_read_at
      )
  `;
  return row?.n ?? 0;
}

export interface ThreadMessage {
  id: number;
  mine: boolean;
  body: string;
  emojiOnly: boolean;
  context: ReplyContext | null;
  createdAt: Date;
}

export interface Thread {
  /** The signed-in user, for their avatar beside their own messages. */
  you: {
    id: string;
    username: string;
    name: string | null;
    image: string | null;
  };
  other: {
    id: string;
    username: string;
    name: string | null;
    image: string | null;
  };
  messages: ThreadMessage[]; // oldest first
  hasMore: boolean;
  canReply: boolean;
  blockedByYou: boolean;
}

/** Null when the conversation doesn't exist or isn't the user's. */
export async function getThread(
  userId: string,
  conversationId: string,
  before?: number,
): Promise<Thread | null> {
  const member = await loadMembership(userId, conversationId);
  if (!member) return null;

  const [{ blockedByMe, blockedMe }, [you]] = await Promise.all([
    blockState(userId, member.otherId),
    sql`
      SELECT id, username, name, COALESCE(custom_image, image) AS image
      FROM users
      WHERE id = ${userId}
    `,
  ]);

  const rows = await sql`
    SELECT id, sender_id, body, is_emoji_only, context, created_at
    FROM messages
    WHERE conversation_id = ${conversationId}
      AND deleted_at IS NULL
      ${before ? sql`AND id < ${before}` : sql``}
    ORDER BY id DESC
    LIMIT ${THREAD_PAGE_SIZE + 1}
  `;
  const hasMore = rows.length > THREAD_PAGE_SIZE;

  const messages = rows
    .slice(0, THREAD_PAGE_SIZE)
    .reverse()
    .map((row) => ({
      id: Number(row.id),
      mine: row.senderId === userId,
      body: row.body as string,
      emojiOnly: row.isEmojiOnly as boolean,
      context:
        typeof row.context === 'string'
          ? (JSON.parse(row.context) as ReplyContext)
          : ((row.context as ReplyContext | null) ?? null),
      createdAt: row.createdAt as Date,
    }));

  return {
    you: you as Thread['you'],
    other: {
      id: member.otherId,
      username: member.username,
      name: member.name,
      image: member.image,
    },
    messages,
    hasMore,
    canReply: !blockedByMe && !blockedMe && member.repliesEnabled,
    blockedByYou: blockedByMe,
  };
}

export async function markConversationRead(
  userId: string,
  conversationId: string,
): Promise<boolean> {
  const result = await sql`
    UPDATE conversation_members SET last_read_at = NOW()
    WHERE conversation_id = ${conversationId} AND user_id = ${userId}
  `;
  return result.count > 0;
}

/** Removes it from this person's inbox only; it returns on a new message. */
export async function hideConversation(
  userId: string,
  conversationId: string,
): Promise<boolean> {
  const result = await sql`
    UPDATE conversation_members SET hidden_at = NOW()
    WHERE conversation_id = ${conversationId} AND user_id = ${userId}
  `;
  return result.count > 0;
}

export type BlockResult =
  | { ok: true }
  | { ok: false; reason: 'not_found' | 'self' };

export async function setBlocked(
  blockerId: string,
  username: string,
  blocked: boolean,
): Promise<BlockResult> {
  const target = await findPersonByUsername(username);
  if (!target) return { ok: false, reason: 'not_found' };
  if (target.id === blockerId) return { ok: false, reason: 'self' };

  if (blocked) {
    await sql`
      INSERT INTO user_blocks (blocker_id, blocked_id)
      VALUES (${blockerId}, ${target.id})
      ON CONFLICT DO NOTHING
    `;
  } else {
    await sql`
      DELETE FROM user_blocks
      WHERE blocker_id = ${blockerId} AND blocked_id = ${target.id}
    `;
  }
  return { ok: true };
}

export type ReportResult =
  | { ok: true }
  | { ok: false; reason: 'not_found' | 'invalid_message' };

export async function reportConversation(args: {
  reporterId: string;
  conversationId: string;
  messageId?: number;
  reason: ReportReason;
  details?: string;
}): Promise<ReportResult> {
  const member = await loadMembership(args.reporterId, args.conversationId);
  if (!member) return { ok: false, reason: 'not_found' };

  if (args.messageId !== undefined) {
    // Only the other person's messages in this conversation can be reported.
    const [message] = await sql`
      SELECT id FROM messages
      WHERE id = ${args.messageId}
        AND conversation_id = ${args.conversationId}
        AND sender_id = ${member.otherId}
    `;
    if (!message) return { ok: false, reason: 'invalid_message' };
  }

  await sql`
    INSERT INTO reply_reports
      (reporter_id, reported_user_id, conversation_id, message_id, reason, details)
    VALUES (
      ${args.reporterId},
      ${member.otherId},
      ${args.conversationId},
      ${args.messageId ?? null},
      ${args.reason},
      ${args.details ?? null}
    )
  `;
  return { ok: true };
}

export async function getRepliesEnabled(userId: string): Promise<boolean> {
  const [row] = await sql`
    SELECT replies_enabled FROM users WHERE id = ${userId}
  `;
  return row ? (row.repliesEnabled as boolean) : true;
}

export async function setRepliesEnabled(
  userId: string,
  enabled: boolean,
): Promise<void> {
  await sql`UPDATE users SET replies_enabled = ${enabled} WHERE id = ${userId}`;
}
