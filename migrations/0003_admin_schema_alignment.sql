alter table if exists profiles
  add column if not exists deriv_client_id text,
  add column if not exists is_tagged boolean not null default false;

update profiles
set is_tagged = coalesce(is_tagged, deriv_tagged, false)
where coalesce(is_tagged, deriv_tagged, false) is distinct from is_tagged;

alter table if exists books
  add column if not exists blurb text not null default '',
  add column if not exists published boolean not null default true,
  add column if not exists sort_order integer not null default 0,
  add column if not exists updated_at timestamptz not null default now();

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = current_schema()
      and table_name = 'books'
      and column_name = 'description'
  ) then
    execute $sql$
      update books
      set blurb = coalesce(nullif(blurb, ''), description, '')
      where coalesce(nullif(blurb, ''), '') is distinct from coalesce(description, '')
    $sql$;
  end if;
end
$$;

alter table if exists book_pages
  add column if not exists page_number integer,
  add column if not exists image_url text,
  add column if not exists created_at timestamptz not null default now();

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = current_schema()
      and table_name = 'book_pages'
      and column_name = 'page_index'
  ) then
    execute $sql$
      update book_pages
      set page_number = coalesce(page_number, page_index + 1)
      where page_number is null
    $sql$;
  end if;
end
$$;

alter table if exists purchases
  add column if not exists reference text,
  add column if not exists gateway_url text;

create index if not exists profiles_role_idx on profiles (role);
create index if not exists books_published_sort_idx on books (published, sort_order, created_at desc);
create index if not exists book_pages_book_page_number_idx on book_pages (book_id, page_number);
