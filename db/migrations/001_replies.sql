-- Private replies: conversations, messages, blocks and reports.
-- Apply after db/schema.sql. Safe to run twice. It adds new tables and one
-- column with a default to users; it changes no existing data.
-- Apply to staging first. Production only once the feature ships.

-- Whether other people may start or continue a conversation with this user.
-- Defaults to on, like read.cv's "Everyone". Turning it off never stops the
-- user from replying to others.
alter table public.users
  add column if not exists replies_enabled boolean not null default true;

-- One conversation per pair of users. The pair is stored in a fixed order
-- (user_a < user_b) so the same two people can never have two conversations.
create table if not exists public.conversations (
  id uuid primary key default uuid_generate_v4(),
  user_a text not null references public.users (id) on delete cascade,
  user_b text not null references public.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  last_message_at timestamptz,
  constraint conversations_pair_order check (user_a < user_b),
  constraint conversations_pair_unique unique (user_a, user_b)
);
create index if not exists conversations_user_b_idx
  on public.conversations (user_b);

-- Per-person state of a conversation: what they have read, and whether they
-- removed it from their inbox. Two rows per conversation.
create table if not exists public.conversation_members (
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  user_id text not null references public.users (id) on delete cascade,
  last_read_at timestamptz not null default now(),
  hidden_at timestamptz,
  primary key (conversation_id, user_id)
);
create index if not exists conversation_members_user_idx
  on public.conversation_members (user_id, hidden_at);

-- A message is text, emoji, or both. context is a frozen copy of the profile
-- item being replied to (section, title, excerpt, year), so later edits to the
-- profile don't rewrite the conversation. Null for a plain message.
create table if not exists public.messages (
  id bigint generated always as identity primary key,
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id text not null references public.users (id) on delete cascade,
  body text not null,
  is_emoji_only boolean not null default false,
  context jsonb,
  created_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint messages_body_length check (char_length(btrim(body)) between 1 and 2000),
  constraint messages_context_size check (context is null or pg_column_size(context) <= 8192)
);
create index if not exists messages_conversation_idx
  on public.messages (conversation_id, id desc);
create index if not exists messages_sender_idx
  on public.messages (sender_id);

-- A blocks B: B can no longer start or continue a conversation with A.
create table if not exists public.user_blocks (
  blocker_id text not null references public.users (id) on delete cascade,
  blocked_id text not null references public.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  constraint user_blocks_not_self check (blocker_id <> blocked_id)
);
create index if not exists user_blocks_blocked_idx
  on public.user_blocks (blocked_id);

-- Reports go here for review. message_id survives message deletion as null.
create table if not exists public.reply_reports (
  id bigint generated always as identity primary key,
  reporter_id text not null references public.users (id) on delete cascade,
  reported_user_id text not null references public.users (id) on delete cascade,
  conversation_id uuid references public.conversations (id) on delete set null,
  message_id bigint references public.messages (id) on delete set null,
  reason text not null,
  details text,
  status text not null default 'open',
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  constraint reply_reports_reason check (
    reason in ('spam', 'harassment', 'inappropriate', 'impersonation', 'other')
  ),
  constraint reply_reports_status check (status in ('open', 'actioned', 'dismissed')),
  constraint reply_reports_details_length check (details is null or char_length(details) <= 1000),
  constraint reply_reports_not_self check (reporter_id <> reported_user_id)
);
create index if not exists reply_reports_status_idx
  on public.reply_reports (status, created_at desc);

-- The server connects as the table owner, so RLS with no policies blocks the
-- public API keys and leaves the app unaffected, as on every other table.
alter table public.conversations enable row level security;
alter table public.conversation_members enable row level security;
alter table public.messages enable row level security;
alter table public.user_blocks enable row level security;
alter table public.reply_reports enable row level security;
