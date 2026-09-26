create table if not exists profiles (
  user_id text primary key,
  full_name text,
  email text,
  deriv_cr text,
  deriv_tagged boolean not null default false,
  deriv_linked_at timestamptz,
  role text not null default 'member',
  banned boolean not null default false,
  tos_accepted_at timestamptz,
  age_confirmed_at timestamptz,
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists books (
  id serial primary key,
  slug text not null unique,
  title text not null,
  subtitle text not null,
  author text not null,
  category text not null,
  description text not null,
  cover_url text not null,
  series_no text not null,
  size text not null,
  launch_mode text not null default 'prelaunch',
  online_price_cents integer not null,
  download_prelaunch_cents integer not null default 6900,
  download_public_cents integer not null default 9900,
  archived boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists book_pages (
  id serial primary key,
  book_id integer not null references books(id) on delete cascade,
  page_index integer not null,
  heading text not null,
  body text not null,
  note_tone text,
  note_title text,
  note_text text,
  bullets text,
  unique (book_id, page_index)
);

create table if not exists coupons (
  id serial primary key,
  code text not null unique,
  user_id text,
  book_id integer references books(id) on delete set null,
  kind text not null,
  paid_cents integer not null default 0,
  uses_remaining integer not null default 1,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists purchases (
  id serial primary key,
  user_id text not null,
  book_id integer references books(id) on delete set null,
  kind text not null,
  amount_cents integer not null,
  currency text not null default 'USD',
  provider text not null,
  status text not null default 'paid',
  created_at timestamptz not null default now()
);

create table if not exists reading_logs (
  id serial primary key,
  user_id text not null,
  book_id integer not null references books(id) on delete cascade,
  page_index integer not null,
  created_at timestamptz not null default now()
);

create table if not exists subscriptions (
  id serial primary key,
  user_id text not null,
  plan text not null,
  status text not null default 'active',
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists site_settings (
  key text primary key,
  value text not null
);

create table if not exists rate_limits (
  key text primary key,
  hits integer not null default 0,
  window_started_at timestamptz not null default now()
);

create index if not exists purchases_user_idx on purchases (user_id);
create index if not exists coupons_user_idx on coupons (user_id);
create index if not exists reading_logs_user_idx on reading_logs (user_id, book_id);
create index if not exists books_slug_idx on books (slug);
