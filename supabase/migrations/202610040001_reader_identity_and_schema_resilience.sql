-- Align every historical database shape used by the account, reader, coupons,
-- and purchase flows. All statements are additive/idempotent for safe rollout.
alter table if exists profiles
  add column if not exists id text,
  add column if not exists user_id text,
  add column if not exists full_name text,
  add column if not exists email text,
  add column if not exists deriv_cr text,
  add column if not exists deriv_client_id text,
  add column if not exists deriv_tagged boolean not null default false,
  add column if not exists is_tagged boolean not null default false,
  add column if not exists deriv_linked_at timestamptz,
  add column if not exists role text not null default 'member',
  add column if not exists banned boolean not null default false,
  add column if not exists tos_accepted_at timestamptz,
  add column if not exists age_confirmed_at timestamptz,
  add column if not exists created_at timestamptz not null default now();

do $$
begin
  if exists (select 1 from information_schema.columns where table_schema=current_schema() and table_name='profiles' and column_name='cr_number') then
    execute 'update profiles set deriv_cr = coalesce(deriv_cr, cr_number) where deriv_cr is null';
  end if;
end $$;

update profiles set id=coalesce(id,user_id), user_id=coalesce(user_id,id),
  is_tagged=coalesce(is_tagged,deriv_tagged,false), deriv_tagged=coalesce(deriv_tagged,is_tagged,false)
where id is null or user_id is null or is_tagged is distinct from deriv_tagged;

create unique index if not exists profiles_id_resilient_idx on profiles(id);
create unique index if not exists profiles_user_id_resilient_idx on profiles(user_id);

create or replace function sync_profile_identity_columns() returns trigger language plpgsql as $$
begin
  new.id := coalesce(new.id,new.user_id);
  new.user_id := coalesce(new.user_id,new.id);
  if new.id is null then raise exception 'profile identity is required'; end if;
  new.deriv_tagged := coalesce(new.deriv_tagged,new.is_tagged,false);
  new.is_tagged := coalesce(new.is_tagged,new.deriv_tagged,false);
  return new;
end $$;
drop trigger if exists profiles_identity_alignment on profiles;
create trigger profiles_identity_alignment before insert or update on profiles
for each row execute function sync_profile_identity_columns();

alter table if exists coupons
  add column if not exists paid_cents integer not null default 0,
  add column if not exists expires_at timestamptz,
  add column if not exists uses_remaining integer not null default 1,
  add column if not exists kind text not null default 'promo';

alter table if exists purchases
  add column if not exists amount_cents integer not null default 0,
  add column if not exists kind text,
  add column if not exists reference text,
  add column if not exists gateway_url text,
  add column if not exists status text not null default 'pending';

alter table if exists reading_logs
  add column if not exists page_index integer not null default 0;

do $$
begin
  if exists (select 1 from information_schema.columns where table_schema=current_schema() and table_name='reading_logs' and column_name='page_number') then
    execute 'update reading_logs set page_index=greatest(coalesce(page_number,1)-1,0) where page_index=0';
  end if;
  if exists (select 1 from information_schema.columns where table_schema=current_schema() and table_name='purchases' and column_name='type') then
    execute 'update purchases set kind=coalesce(kind,type) where kind is null';
  end if;
  if exists (select 1 from information_schema.columns where table_schema=current_schema() and table_name='purchases' and column_name='amount') then
    execute 'update purchases set amount_cents=round(amount*100)::integer where amount_cents=0 and amount is not null';
  end if;
end $$;
