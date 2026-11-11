-- ── Only an admin can grant the "verified" badge ─────────────────────────────
--
-- Why this file exists.
--
-- `verified` on housing_profiles and housing_listings means "we looked at this
-- person's ID document". housing.sql documents the intent next to the column
-- ("Set by an admin (service role) after reviewing the ID document") but never
-- enforces it, because RLS cannot: the policies check WHOSE row it is, not
-- WHICH columns the write touches.
--
--   create policy "Users create own listings" ... with check (auth.uid() = created_by);
--   create policy "Users update own listings" ... using  (auth.uid() = created_by);
--
-- Both hold for a user acting on their own row, so both of these are accepted:
--
--   insert into housing_listings (created_by, verified, ...) values (auth.uid(), true, ...);
--   update housing_listings set verified = true where created_by = auth.uid();
--
-- A WITH CHECK clause cannot fix this: it only sees the NEW row, so it cannot
-- express "verified must not change". It could only demand verified = false
-- always, which would break every legitimately verified user's own edits.
--
-- Same reasoning, and same solution, as enforce_housing_message_readonly_fields()
-- in housing.sql: the rule is per-column, so it belongs in a trigger.
--
-- The partner listings imported from Club House are NOT affected either way:
-- they have created_by = null, and `auth.uid() = null` evaluates to NULL rather
-- than true, so no authenticated user can write to them at all. The risk this
-- file closes is a fake listing wearing a real-looking badge next to theirs.
--
-- Safe to run more than once.

create or replace function public.enforce_housing_verified_admin_only()
returns trigger as $$
begin
  -- Roles that legitimately set the badge: the service-role admin client, and
  -- a human in the Supabase SQL editor. An allowlist rather than a blocklist,
  -- so a client role added in the future is denied by default, not allowed.
  if current_user in ('service_role', 'postgres', 'supabase_admin') then
    return new;
  end if;

  if tg_op = 'INSERT' then
    if new.verified then
      raise exception '%.verified cannot be set on insert; an admin grants it after reviewing the ID',
        tg_table_name;
    end if;
  elsif new.verified is distinct from old.verified then
    raise exception '%.verified can only be changed by an admin', tg_table_name;
  end if;

  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists housing_listings_verified_admin_only on housing_listings;
create trigger housing_listings_verified_admin_only
  before insert or update on housing_listings
  for each row execute function public.enforce_housing_verified_admin_only();

drop trigger if exists housing_profiles_verified_admin_only on housing_profiles;
create trigger housing_profiles_verified_admin_only
  before insert or update on housing_profiles
  for each row execute function public.enforce_housing_verified_admin_only();
