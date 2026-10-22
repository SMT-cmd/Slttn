-- Safe, additive compatibility for databases originally built from
-- migrations/0002_schema.sql. The newer Supabase schema intentionally lacks
-- these legacy columns and is left unchanged.
--
-- Older books had required publisher-era fields that the current editor no
-- longer writes. These defaults are only applied when those columns exist.
do $$
begin
  if to_regclass('public.books') is null then
    return;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'books' and column_name = 'author'
  ) then
    execute 'alter table public.books alter column author set default ''O.J. Alonge''';
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'books' and column_name = 'description'
  ) then
    execute 'alter table public.books alter column description set default ''''';
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'books' and column_name = 'series_no'
  ) then
    execute 'alter table public.books alter column series_no set default ''''';
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'books' and column_name = 'online_price_cents'
  ) then
    execute 'alter table public.books alter column online_price_cents set default 0';
  end if;
end
$$;

-- Legacy book_pages has required page_index, heading and body fields. The
-- current page-image uploader writes page_number + image_url instead.
-- Translate the new layout to old required fields only for legacy tables,
-- preserving the existing unique(book_id, page_index) invariant.
create or replace function public.slt_fill_legacy_book_page_fields()
returns trigger language plpgsql as $$
begin
  new.page_index := greatest(new.page_number - 1, 0);
  new.heading := coalesce(new.heading, '');
  new.body := coalesce(new.body, '');
  return new;
end
$$;

do $$
begin
  if to_regclass('public.book_pages') is null then
    return;
  end if;

  if (
    select count(*) from information_schema.columns
    where table_schema='public' and table_name='book_pages'
      and column_name in ('page_index', 'heading', 'body', 'page_number')
  ) = 4 then
    execute 'drop trigger if exists slt_legacy_page_fields on public.book_pages';
    execute 'create trigger slt_legacy_page_fields before insert or update of page_number
      on public.book_pages for each row execute function public.slt_fill_legacy_book_page_fields()';
  end if;
end
$$;
