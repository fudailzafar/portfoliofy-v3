-- Magic-link sign-in tokens. Applied to Supabase as the migration
-- "add_login_tokens_for_email_magic_link"; kept here so the schema is visible.
create table if not exists public.login_tokens (
  token_hash text primary key,
  email text not null,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists login_tokens_email_created_idx
  on public.login_tokens (email, created_at desc);

-- The app connects with the service connection string, so RLS with no
-- policies blocks every other client.
alter table public.login_tokens enable row level security;

-- Magic-link sign-in looks users up by email.
create index if not exists users_lower_email_idx
  on public.users (lower(email));
