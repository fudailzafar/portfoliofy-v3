-- Full schema of the Portfoliofy database, no data. Generated from production on
-- 2026-11-09 for building a staging database. Run it once on an empty Postgres.
-- Production already has all of this, so never run it there.
-- The app connects as the table owner, so Row Level Security is on with no
-- policies: that blocks the public API keys and leaves the server unaffected.

create extension if not exists pgcrypto;
create extension if not exists "uuid-ossp";

create table public.users (
  id text primary key,
  username text not null unique,
  custom_domain text unique,
  name text,
  email text,
  image text,
  custom_image text,
  created_at timestamptz default now(),
  status_emoji text,
  status_text text,
  status_updated_at timestamptz
);
create index users_lower_email_idx on public.users (lower(email));

create table public.resumes (
  id uuid primary key default uuid_generate_v4(),
  user_id text unique references public.users (id) on delete cascade,
  status text default 'draft',
  resume_data jsonb not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  version integer not null default 1
);

create table public.resume_history (
  id bigint generated always as identity primary key,
  user_id text not null references public.users (id) on delete cascade,
  version integer not null,
  status text not null,
  resume_data jsonb,
  source text not null,
  created_at timestamptz not null default now()
);
create index resume_history_user_created_idx
  on public.resume_history (user_id, created_at desc);

create table public.page_views (
  id bigserial primary key,
  user_id text not null references public.users (id) on delete cascade,
  viewed_at timestamptz not null default now(),
  via_custom_domain boolean not null default false,
  visitor_key text
);
create index idx_page_views_user_id_viewed_at
  on public.page_views (user_id, viewed_at);
create unique index page_views_daily_visitor_unique_idx
  on public.page_views (
    user_id,
    via_custom_domain,
    visitor_key,
    (((viewed_at at time zone 'UTC')::date))
  );

create table public.login_tokens (
  token_hash text primary key,
  email text not null,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);
create index login_tokens_email_created_idx
  on public.login_tokens (email, created_at desc);

create table public.oauth_clients (
  client_id text primary key,
  client_name text not null,
  redirect_uris text[] not null,
  created_at timestamptz not null default now()
);

create table public.oauth_codes (
  code_hash text primary key,
  client_id text not null references public.oauth_clients (client_id) on delete cascade,
  user_id text not null references public.users (id) on delete cascade,
  redirect_uri text not null,
  code_challenge text not null,
  scope text not null,
  resource text,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.oauth_tokens (
  id bigint generated always as identity primary key,
  access_hash text not null unique,
  refresh_hash text not null unique,
  client_id text not null references public.oauth_clients (client_id) on delete cascade,
  user_id text not null references public.users (id) on delete cascade,
  scope text not null,
  resource text,
  access_expires_at timestamptz not null,
  refresh_expires_at timestamptz not null,
  revoked_at timestamptz,
  last_used_at timestamptz,
  created_at timestamptz not null default now()
);
create index oauth_tokens_user_idx on public.oauth_tokens (user_id);

alter table public.users enable row level security;
alter table public.resumes enable row level security;
alter table public.resume_history enable row level security;
alter table public.page_views enable row level security;
alter table public.login_tokens enable row level security;
alter table public.oauth_clients enable row level security;
alter table public.oauth_codes enable row level security;
alter table public.oauth_tokens enable row level security;
