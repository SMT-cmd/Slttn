create table if not exists public.anonymous_messages (
  id text primary key,
  public_id text not null unique,
  author_key_hash text not null,
  message text not null,
  context text,
  status text not null default 'new' check (status in ('new', 'read', 'archived')),
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists anonymous_messages_created_idx on public.anonymous_messages(created_at desc);
create index if not exists anonymous_messages_author_idx on public.anonymous_messages(author_key_hash, created_at desc);
