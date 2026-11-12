-- ── The database decides who is verified, not the client ─────────────────────
--
-- Why this file exists.
--
-- `verified` on housing_profiles and housing_listings means "we reviewed this
-- person's ID document". housing.sql documents that intent next to the column
-- ("Set by an admin (service role) after reviewing the ID document") but never
-- enforces it, because RLS cannot: the policies check WHOSE row it is, not
-- WHICH columns the write touches.
--
--   create policy "Users create own listings" ... with check (auth.uid() = created_by);
--   create policy "Users update own listings" ... using  (auth.uid() = created_by);
--
-- Both hold for a user acting on their own row, so both of these were accepted
-- from an ordinary authenticated user:
--
--   insert into housing_listings (created_by, verified, ...) values (auth.uid(), true, ...);
--   update housing_listings set verified = true where created_by = auth.uid();
--
-- A WITH CHECK clause cannot express the rule, since it only sees the NEW row
-- and so cannot say "verified must not change". It belongs in a trigger, the
-- same way enforce_housing_message_readonly_fields() in housing.sql closes the
-- same class of hole on housing_messages.
--
-- On INSERT the trigger DERIVES the value instead of validating it.
--
-- saveApartmentListing() in utils/housing.ts carries a verification forward:
-- a user already verified through their roommate profile does not re-upload an
-- ID to post a listing. That behaviour is intended, but it is currently decided
-- in the browser — the client reads its own `verified` flag and posts it back,
-- so a crafted request can simply assert true. Rejecting a true value here
-- would close the hole and break the legitimate case with it.
--
-- So the trigger ignores whatever the client sent and reads the answer from
-- housing_profiles itself, which is the same source utils/housing.ts consults.
-- A genuinely verified user keeps the badge with no code change; a forged
-- `true` is silently rewritten to that user's real status. The client's own
-- `verified` field in the insert payload is now redundant but harmless.
--
-- The Club House partner listings are unaffected either way: they have
-- created_by = null, which no authenticated user can write to under the
-- existing policies. What this closes is a fake listing wearing a real-looking
-- badge beside theirs.
--
-- Safe to run more than once.

create or replace function public.enforce_housing_verified_admin_only()
returns trigger as $$
begin
  -- Roles that legitimately set the badge: the service-role admin client, and
  -- a human in the Supabase SQL editor. An allowlist rather than a blocklist,
  -- so a client role added later is denied by default.
  --
  -- This function must NOT be security definer, even though reading another
  -- table from a trigger looks like a case for it. CURRENT_USER "also changes
  -- during the execution of functions with the attribute SECURITY DEFINER"
  -- (PostgreSQL docs, session information functions) — it becomes the function
  -- OWNER, which for anything created in the SQL editor is postgres, which is
  -- in the allowlist below. The guard would return new for every caller and
  -- silently protect nothing. Under PostgREST, which impersonates the caller
  -- with SET ROLE, a security INVOKER function reads the real role here:
  -- authenticated, anon or service_role.
  --
  -- Invoker is also enough for the lookup further down: a user reading their
  -- own housing_profiles row satisfies that table's own SELECT policy.
  if current_user in ('service_role', 'postgres', 'supabase_admin') then
    return new;
  end if;

  if tg_op = 'INSERT' then
    if tg_table_name = 'housing_listings' then
      -- Mirrors getExistingIdVerification() in utils/housing.ts, which also
      -- reads housing_profiles — but here the client cannot influence it.
      new.verified := coalesce(
        (select p.verified from public.housing_profiles p where p.user_id = new.created_by),
        false
      );
    else
      -- A roommate profile is never born verified; an admin grants it later.
      new.verified := false;
    end if;
    return new;
  end if;

  if new.verified is distinct from old.verified then
    raise exception '%.verified can only be changed by an admin', tg_table_name;
  end if;

  return new;
end;
$$ language plpgsql set search_path = public;

drop trigger if exists housing_listings_verified_admin_only on housing_listings;
create trigger housing_listings_verified_admin_only
  before insert or update on housing_listings
  for each row execute function public.enforce_housing_verified_admin_only();

drop trigger if exists housing_profiles_verified_admin_only on housing_profiles;
create trigger housing_profiles_verified_admin_only
  before insert or update on housing_profiles
  for each row execute function public.enforce_housing_verified_admin_only();
