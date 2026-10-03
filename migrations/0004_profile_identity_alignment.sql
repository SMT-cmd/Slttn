alter table if exists profiles
  add column if not exists id text,
  add column if not exists user_id text;

-- Older app migrations keyed profiles by user_id; the Supabase schema keyed
-- the same row by id. Keep both populated so either historical shape upgrades
-- without breaking the first signed-in request.
update profiles
set
  id = coalesce(id, user_id),
  user_id = coalesce(user_id, id)
where id is null or user_id is null;

create unique index if not exists profiles_id_unique_idx on profiles (id);
create unique index if not exists profiles_user_id_unique_idx on profiles (user_id);
