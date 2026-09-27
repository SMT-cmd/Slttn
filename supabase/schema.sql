create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Better Auth keeps its own auth tables in the same Supabase Postgres database.
-- The application tables below use the Better Auth user id as `profiles.id`.

create table if not exists public.profiles (
  id text primary key,
  email text,
  full_name text,
  cr_number text,
  is_tagged boolean not null default false,
  role text not null default 'member' check (role in ('admin', 'member')),
  banned boolean not null default false,
  tos_accepted_at timestamptz,
  age_confirmed_at timestamptz,
  deriv_linked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.books (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  subtitle text not null default '',
  category text not null,
  size text not null check (size in ('short', 'medium', 'full')),
  launch_mode text not null default 'prelaunch' check (launch_mode in ('prelaunch', 'public')),
  cover_url text,
  blurb text not null default '',
  published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.book_pages (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.books(id) on delete cascade,
  page_number integer not null check (page_number > 0),
  image_url text not null,
  created_at timestamptz not null default now(),
  unique (book_id, page_number)
);

create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  user_id text references public.profiles(id) on delete set null,
  book_id uuid references public.books(id) on delete cascade,
  scope text not null default 'global' check (scope in ('global', 'book')),
  kind text not null default 'promo',
  used boolean not null default false,
  uses_remaining integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.purchases (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public.profiles(id) on delete cascade,
  book_id uuid references public.books(id) on delete set null,
  type text not null check (type in ('online', 'download', 'subscription', 'coupon5')),
  amount numeric(10, 2) not null,
  provider text not null,
  provider_reference text,
  status text not null default 'pending',
  expires_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.reading_logs (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public.profiles(id) on delete cascade,
  book_id uuid not null references public.books(id) on delete cascade,
  page_number integer not null check (page_number > 0),
  created_at timestamptz not null default now()
);

create index if not exists idx_books_published_sort on public.books (published, sort_order, created_at desc);
create index if not exists idx_book_pages_book_id_page_number on public.book_pages (book_id, page_number);
create index if not exists idx_coupons_user_id on public.coupons (user_id);
create index if not exists idx_purchases_user_id on public.purchases (user_id, created_at desc);
create index if not exists idx_reading_logs_user_book on public.reading_logs (user_id, book_id, created_at desc);

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists trg_books_updated_at on public.books;
create trigger trg_books_updated_at
before update on public.books
for each row execute function public.set_updated_at();

drop trigger if exists trg_coupons_updated_at on public.coupons;
create trigger trg_coupons_updated_at
before update on public.coupons
for each row execute function public.set_updated_at();

drop trigger if exists trg_purchases_updated_at on public.purchases;
create trigger trg_purchases_updated_at
before update on public.purchases
for each row execute function public.set_updated_at();

insert into public.settings (key, value)
values
  ('global_prelaunch', 'true'::jsonb),
  ('telegram_link', to_jsonb('https://t.me/slttradehub'::text)),
  ('whatsapp_link', to_jsonb('https://chat.whatsapp.com/slttradehub'::text)),
  (
    'community_links',
    jsonb_build_object(
      'telegram', 'https://t.me/slttradehub',
      'whatsapp', 'https://chat.whatsapp.com/slttradehub'
    )
  )
on conflict (key) do nothing;
