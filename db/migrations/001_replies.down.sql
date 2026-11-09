-- Undoes 001_replies.sql. Deletes every conversation, message, block and
-- report. Only run it on staging, or to back the feature out before launch.
drop table if exists public.reply_reports;
drop table if exists public.user_blocks;
drop table if exists public.messages;
drop table if exists public.conversation_members;
drop table if exists public.conversations;
alter table public.users drop column if exists replies_enabled;
