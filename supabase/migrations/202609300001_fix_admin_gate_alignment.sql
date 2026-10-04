create table if not exists public.settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb
);

create table if not exists public.profiles (
  id text primary key,
  user_id text,
  email text,
  full_name text,
  role text not null default 'member',
  banned boolean not null default false,
  created_at timestamptz not null default now()
);

alter table if exists public.profiles
  add column if not exists id text,
  add column if not exists user_id text,
  add column if not exists email text,
  add column if not exists full_name text,
  add column if not exists role text default 'member',
  add column if not exists banned boolean default false;

update public.profiles
set
  id = coalesce(id, user_id),
  user_id = coalesce(user_id, id)
where id is null or user_id is null;

create table if not exists public.purchases (
  id text primary key,
  user_id text,
  book_id text,
  type text,
  amount numeric,
  provider text,
  status text,
  provider_ref text,
  created_at timestamptz not null default now(),
  amount_cents integer,
  kind text,
  currency text,
  reference text,
  metadata jsonb,
  paid_at timestamptz,
  gateway_url text
);

alter table if exists public.purchases
  add column if not exists user_id text,
  add column if not exists book_id text,
  add column if not exists type text,
  add column if not exists amount numeric,
  add column if not exists provider text,
  add column if not exists status text,
  add column if not exists provider_ref text,
  add column if not exists created_at timestamptz default now(),
  add column if not exists amount_cents integer,
  add column if not exists kind text,
  add column if not exists currency text,
  add column if not exists reference text,
  add column if not exists metadata jsonb,
  add column if not exists paid_at timestamptz,
  add column if not exists gateway_url text;

create table if not exists public.coupons (
  id text primary key,
  user_id text,
  book_id text,
  code text,
  kind text,
  uses_remaining integer,
  created_at timestamptz not null default now()
);

alter table if exists public.coupons
  add column if not exists user_id text,
  add column if not exists book_id text;

create table if not exists public.reading_logs (
  user_id text,
  book_id text,
  page_index integer not null default 0,
  created_at timestamptz not null default now()
);

alter table if exists public.reading_logs
  add column if not exists user_id text,
  add column if not exists book_id text;

create unique index if not exists profiles_user_id_idx on public.profiles (user_id);
create index if not exists profiles_lower_email_idx on public.profiles (lower(email));
create index if not exists profiles_role_idx on public.profiles (role);
