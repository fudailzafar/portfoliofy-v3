-- Undoes 002_follows.sql. Deletes every follow. Only run it on staging, or to
-- back the feature out before launch.
drop table if exists public.follows;
alter table public.users drop constraint if exists users_replies_from_check;
alter table public.users drop column if exists replies_from;
alter table public.users drop column if exists following_seen_at;
