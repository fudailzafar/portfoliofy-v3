-- Following: who follows whom, when you last looked at new followers, and who
-- may reply to you. Apply after 001_replies.sql. Safe to run twice. It adds a
-- table and two columns with defaults to users; it changes no existing data
-- except copying "replies off" into the new setting.
-- Apply to staging first. Production only once the feature ships.

-- A follows B. Follower lists are private: only the person themselves sees
-- who follows them, as on read.cv, so there are no public counts.
create table if not exists public.follows (
  follower_id text not null references public.users (id) on delete cascade,
  followee_id text not null references public.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, followee_id),
  constraint follows_not_self check (follower_id <> followee_id)
);
create index if not exists follows_followee_idx
  on public.follows (followee_id, created_at desc);

-- When the user last opened their Following page. New followers after this
-- light the dot in the sidebar.
alter table public.users
  add column if not exists following_seen_at timestamptz;

-- Who may start or continue a conversation with this user, as on read.cv:
-- 'everyone', 'following' (only people this user follows) or 'nobody'.
-- replies_enabled stays and is kept in step ('nobody' = false) so older code
-- keeps working.
alter table public.users
  add column if not exists replies_from text not null default 'everyone';
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'users_replies_from_check'
  ) then
    alter table public.users
      add constraint users_replies_from_check
      check (replies_from in ('everyone', 'following', 'nobody'));
  end if;
end $$;
update public.users
  set replies_from = 'nobody'
  where replies_enabled = false and replies_from = 'everyone';

-- Same as the other tables: the server connects as the owner, and RLS with no
-- policies keeps the public API keys out.
alter table public.follows enable row level security;
