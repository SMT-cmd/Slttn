-- Admin database audit for SLT Trade Hub.
-- Run this against the same Postgres database the app uses.
-- It is read-only: no writes, deletes, or schema changes.

-- 1) Required tables
with required_tables(table_name) as (
  values
    ('user'),
    ('session'),
    ('account'),
    ('verification'),
    ('profiles'),
    ('books'),
    ('book_pages'),
    ('coupons'),
    ('purchases'),
    ('reading_logs'),
    ('subscriptions'),
    ('site_settings'),
    ('rate_limits')
)
select
  rt.table_name,
  case when t.table_name is null then 'missing' else 'present' end as status
from required_tables rt
left join information_schema.tables t
  on t.table_schema = current_schema()
 and t.table_name = rt.table_name
order by rt.table_name;

-- 2) Required columns
with required_columns(table_name, column_name) as (
  values
    ('profiles', 'user_id'),
    ('profiles', 'email'),
    ('profiles', 'role'),
    ('profiles', 'banned'),
    ('profiles', 'deriv_cr'),
    ('profiles', 'deriv_tagged'),
    ('profiles', 'deriv_client_id'),
    ('profiles', 'is_tagged'),
    ('profiles', 'deriv_linked_at'),
    ('profiles', 'tos_accepted_at'),
    ('profiles', 'age_confirmed_at'),
    ('profiles', 'created_at'),
    ('books', 'id'),
    ('books', 'slug'),
    ('books', 'title'),
    ('books', 'subtitle'),
    ('books', 'category'),
    ('books', 'size'),
    ('books', 'launch_mode'),
    ('books', 'cover_url'),
    ('books', 'blurb'),
    ('books', 'published'),
    ('books', 'sort_order'),
    ('books', 'created_at'),
    ('books', 'updated_at'),
    ('book_pages', 'id'),
    ('book_pages', 'book_id'),
    ('book_pages', 'page_number'),
    ('book_pages', 'image_url'),
    ('book_pages', 'created_at'),
    ('coupons', 'id'),
    ('coupons', 'code'),
    ('coupons', 'user_id'),
    ('coupons', 'book_id'),
    ('coupons', 'kind'),
    ('coupons', 'uses_remaining'),
    ('coupons', 'paid_cents'),
    ('coupons', 'created_at'),
    ('coupons', 'expires_at'),
    ('purchases', 'id'),
    ('purchases', 'user_id'),
    ('purchases', 'book_id'),
    ('purchases', 'kind'),
    ('purchases', 'amount_cents'),
    ('purchases', 'provider'),
    ('purchases', 'status'),
    ('purchases', 'reference'),
    ('purchases', 'gateway_url'),
    ('purchases', 'created_at'),
    ('reading_logs', 'user_id'),
    ('reading_logs', 'book_id'),
    ('reading_logs', 'page_index'),
    ('reading_logs', 'created_at'),
    ('subscriptions', 'user_id'),
    ('subscriptions', 'plan'),
    ('subscriptions', 'status'),
    ('subscriptions', 'expires_at'),
    ('site_settings', 'key'),
    ('site_settings', 'value')
)
select
  rc.table_name,
  rc.column_name,
  case when c.column_name is null then 'missing' else 'present' end as status
from required_columns rc
left join information_schema.columns c
  on c.table_schema = current_schema()
 and c.table_name = rc.table_name
 and c.column_name = rc.column_name
where c.column_name is null
order by rc.table_name, rc.column_name;

-- 3) Admin/auth alignment
select
  p.user_id,
  p.email,
  p.role,
  p.banned,
  p.created_at
from profiles p
where p.role = 'admin'
order by p.created_at asc, p.email asc nulls last;

select
  u.id as auth_user_id,
  u.email as auth_email,
  p.user_id as profile_user_id,
  p.role as profile_role,
  case
    when p.user_id is null then 'missing_profile'
    when p.user_id <> u.id then 'email_match_user_id_mismatch'
    else 'ok'
  end as status
from "user" u
left join profiles p
  on lower(coalesce(p.email, '')) = lower(coalesce(u.email, ''))
order by status desc, auth_email asc;

select
  p.user_id as profile_user_id,
  p.email as profile_email,
  p.role,
  u.id as auth_user_id
from profiles p
left join "user" u on u.id = p.user_id
where u.id is null
order by p.role desc, p.email asc nulls last;

-- Replace the email below with the admin account you are trying to use.
select
  u.id as auth_user_id,
  u.email as auth_email,
  p.user_id as profile_user_id,
  p.role as profile_role,
  p.banned as profile_banned,
  p.created_at as profile_created_at
from "user" u
left join profiles p
  on p.user_id = u.id
  or lower(coalesce(p.email, '')) = lower(coalesce(u.email, ''))
where lower(u.email) = lower('admin@example.com');

-- 4) Data completeness checks for the admin desk
select id, slug, title, published, sort_order, updated_at
from books
where cover_url is null
   or blurb is null
   or published is null
   or sort_order is null
   or updated_at is null
order by id;

select id, book_id, page_number, image_url, created_at
from book_pages
where page_number is null
   or image_url is null
   or created_at is null
order by book_id, id;

select id, user_id, provider, status, reference, gateway_url, created_at
from purchases
where (status = 'pending' and provider in ('stripe', 'paystack') and gateway_url is null)
   or created_at is null
order by created_at desc nulls last;

-- 5) One-line summary
with missing_columns as (
  with required_columns(table_name, column_name) as (
    values
      ('profiles', 'deriv_client_id'),
      ('profiles', 'is_tagged'),
      ('books', 'blurb'),
      ('books', 'published'),
      ('books', 'sort_order'),
      ('books', 'updated_at'),
      ('book_pages', 'page_number'),
      ('book_pages', 'image_url'),
      ('book_pages', 'created_at'),
      ('purchases', 'reference'),
      ('purchases', 'gateway_url')
  )
  select count(*) as count_missing
  from required_columns rc
  left join information_schema.columns c
    on c.table_schema = current_schema()
   and c.table_name = rc.table_name
   and c.column_name = rc.column_name
  where c.column_name is null
)
select
  (select count(*) from profiles where role = 'admin') as admin_profile_count,
  (select count(*) from "user") as auth_user_count,
  (select count(*) from books) as book_count,
  (select count(*) from book_pages) as book_page_count,
  (select count_missing from missing_columns) as missing_column_count;

-- Optional follow-up:
-- If the missing-column query returns rows, apply the repo migration:
--   migrations/0003_admin_schema_alignment.sql
