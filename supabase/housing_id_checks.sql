-- ── ID checks: one review per person, done by an admin ──────────────────────
--
-- Why this file exists.
--
-- Until now an uploaded ID document was just a file path on the row that
-- asked for it: housing_profiles.id_file_path for a roommate profile,
-- housing_listings.id_file_path for each apartment listing. Nobody looked at
-- the file, so `verified` stayed false forever, while the roommate profile
-- went on the map the moment it was created.
--
-- Three product rules replace that (decided 14 Nov 2026):
--
--   1. The ID is checked for the PERSON, not for each thing they publish.
--      Like KYC at a bank, which verifies the customer once rather than every
--      account they open: one review covers their roommate profile and every
--      listing, including listings published before the review.
--   2. A roommate profile is hidden until its owner is verified. Publishing a
--      profile is a request, the same rule housing_listing_review.sql applies
--      to apartments.
--   3. Once an admin has decided, the document is deleted. Only the outcome
--      and its date are kept (data minimisation): a file we no longer hold
--      cannot leak.
--
-- How the pieces fit.
--
--   housing_id_checks              one row per user: the file waiting for
--                                  review, its status, when it was decided
--   enforce_housing_id_check       BEFORE trigger: a student can submit or
--                                  resubmit a document, never decide on it
--   sync_housing_verified          AFTER trigger: copies the decision onto
--                                  housing_profiles.verified and
--                                  housing_listings.verified, so the badge
--                                  on the map can never disagree with it
--   enforce_housing_verified_admin_only   (redefined from
--                                  housing_verified_admin_only.sql) new rows
--                                  read their badge from housing_id_checks
--   "Verified roommate profiles are public"   replaces the old SELECT policy
--
-- The admin decides from the /admin page (app/admin/actions.ts), which uses
-- the service role. The SQL editor works too: see the bottom of this file.
--
-- Run once in the Supabase SQL Editor. Safe to run more than once. It
-- includes everything housing_verified_admin_only.sql did, so it does not
-- matter whether that file was run before.

-- ── The table ────────────────────────────────────────────────────────────────

create table if not exists housing_id_checks (
  user_id uuid primary key references auth.users(id) on delete cascade,
  -- Path inside the private housing-ids bucket. Null once an admin has
  -- decided and the file has been deleted.
  file_path text,
  status text not null default 'pending'
    check (status in ('pending', 'verified', 'rejected')),
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  -- A path must sit in the owner's own folder. Without this a user could
  -- point their row at somebody else's uploaded document: the admin would
  -- review a stranger's ID under their name, and deleting "their" file after
  -- the decision would delete the stranger's.
  constraint housing_id_checks_own_folder
    check (file_path is null or file_path like user_id::text || '/%')
);

alter table housing_id_checks enable row level security;

-- Students see and submit their own row. Nobody else reads it except the
-- service role, which bypasses RLS.
drop policy if exists "Users read own ID check" on housing_id_checks;
create policy "Users read own ID check"
  on housing_id_checks for select
  using (auth.uid() = user_id);

-- Fail-closed, as in housing_listing_review.sql: the trigger below forces
-- 'pending' anyway, but if it were ever dropped this policy still refuses a
-- student who tries to insert an already-verified row.
drop policy if exists "Users submit own ID" on housing_id_checks;
create policy "Users submit own ID"
  on housing_id_checks for insert
  with check (auth.uid() = user_id and status = 'pending');

drop policy if exists "Users resubmit own ID" on housing_id_checks;
create policy "Users resubmit own ID"
  on housing_id_checks for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists housing_id_checks_queue_idx
  on housing_id_checks (submitted_at) where status = 'pending';

-- ── Rule 1: only an admin decides ────────────────────────────────────────────

create or replace function public.enforce_housing_id_check()
returns trigger as $$
begin
  -- Security INVOKER on purpose: under SECURITY DEFINER, current_user would
  -- read as the function's owner (postgres), which is in the allowlist, and
  -- every student would take the admin path. Same reasoning as
  -- housing_listing_review.sql.
  if current_user in ('service_role', 'postgres', 'supabase_admin') then
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.status := 'pending';
    new.submitted_at := now();
    new.reviewed_at := null;
    return new;
  end if;

  -- A new document is a new request: back to the queue, whatever the old
  -- outcome was. That includes a verified student replacing their ID, who
  -- loses the badge until the new one is checked; otherwise "verified" would
  -- describe a document nobody has seen.
  if new.file_path is not null and new.file_path is distinct from old.file_path then
    new.status := 'pending';
    new.submitted_at := now();
    new.reviewed_at := null;
    return new;
  end if;

  if new.status is distinct from old.status
     or new.reviewed_at is distinct from old.reviewed_at
     or new.submitted_at is distinct from old.submitted_at then
    raise exception 'housing_id_checks: the outcome of an ID check is set by an admin';
  end if;

  return new;
end;
$$ language plpgsql set search_path = public;

drop trigger if exists housing_id_checks_guard on housing_id_checks;
create trigger housing_id_checks_guard
  before insert or update on housing_id_checks
  for each row execute function public.enforce_housing_id_check();

-- ── Rule 2: the badge follows the decision ───────────────────────────────────

create or replace function public.sync_housing_verified()
returns trigger as $$
declare
  is_verified boolean := (new.status = 'verified');
begin
  -- SECURITY DEFINER here IS the point, unlike the two guards. A student who
  -- resubmits a document moves their own row back to 'pending', and that has
  -- to take the badge off their profile and listings. Those columns are
  -- protected by enforce_housing_verified_admin_only(), which only lets the
  -- admin roles through; running as the owner (postgres) is what lets this
  -- one narrow write pass. It is safe because the value written is not chosen
  -- by the caller: it is derived from housing_id_checks.status, which the
  -- guard above only lets an admin set.
  update housing_profiles
     set verified = is_verified
   where user_id = new.user_id
     and verified is distinct from is_verified;

  update housing_listings
     set verified = is_verified
   where created_by = new.user_id
     and verified is distinct from is_verified;

  return new;
end;
$$ language plpgsql security definer set search_path = public;

-- Plain "after update", not "after update of status": the OF form only fires
-- when status appears in the statement's SET list, and a resubmission changes
-- status inside the guard trigger instead. The function only touches rows
-- whose badge actually differs, so firing on every update costs nothing.
drop trigger if exists housing_id_checks_sync on housing_id_checks;
create trigger housing_id_checks_sync
  after insert or update on housing_id_checks
  for each row execute function public.sync_housing_verified();

-- ── Nobody else writes the badge ─────────────────────────────────────────────
-- Redefines the function from housing_verified_admin_only.sql. The only change
-- is where a NEW row gets its badge from: the person's ID check, instead of
-- their roommate profile (a listing) or always-false (a profile). A verified
-- student who deletes and recreates their profile keeps the badge; one who
-- only ever posted listings gets it on their first profile.

create or replace function public.enforce_housing_verified_admin_only()
returns trigger as $$
declare
  owner_id uuid;
begin
  -- Must NOT be security definer: see housing_verified_admin_only.sql.
  if current_user in ('service_role', 'postgres', 'supabase_admin') then
    return new;
  end if;

  if tg_op = 'INSERT' then
    -- Two branches rather than one CASE: plpgsql resolves new.created_by
    -- when it plans the expression, and housing_profiles has no such column.
    if tg_table_name = 'housing_listings' then
      owner_id := new.created_by;
    else
      owner_id := new.user_id;
    end if;
    new.verified := coalesce(
      (select c.status = 'verified' from public.housing_id_checks c where c.user_id = owner_id),
      false
    );
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

-- ── Rule 3: unverified profiles stay off the map ─────────────────────────────
-- Dropping the old policy by its old name matters: permissive policies are
-- OR-ed, so leaving it would keep every unverified profile public.

drop policy if exists "Active roommate profiles are public" on housing_profiles;
drop policy if exists "Verified roommate profiles are public" on housing_profiles;
create policy "Verified roommate profiles are public"
  on housing_profiles for select
  using ((is_active and verified) or auth.uid() = user_id);

-- ── Carry over the documents already uploaded ────────────────────────────────
-- Runs as postgres, so the guard keeps the status given here. Profiles first:
-- for a person with both, the profile's document is the one to review.

insert into housing_id_checks (user_id, file_path, status, submitted_at)
select p.user_id,
       p.id_file_path,
       case when p.verified then 'verified' else 'pending' end,
       coalesce(p.updated_at, p.created_at)
  from housing_profiles p
 where p.id_file_path is not null
   and p.id_file_path like p.user_id::text || '/%'
on conflict (user_id) do nothing;

insert into housing_id_checks (user_id, file_path, status, submitted_at)
select distinct on (l.created_by)
       l.created_by,
       l.id_file_path,
       'pending',
       l.created_at
  from housing_listings l
 where l.created_by is not null
   and l.id_file_path is not null
   and l.id_file_path like l.created_by::text || '/%'
 order by l.created_by, l.created_at desc
on conflict (user_id) do nothing;

-- The old per-row paths now live in housing_id_checks, which owns the file's
-- lifecycle. Clearing them stops anything from deleting or showing a document
-- through a stale pointer once the admin has decided and the file is gone.
-- The columns stay, so older code reading them still runs.
update housing_profiles set id_file_path = null where id_file_path is not null;
update housing_listings set id_file_path = null where id_file_path is not null;

-- ── Reviewing from the SQL editor (the /admin page does the same) ────────────
--
--   -- the queue, oldest first
--   select user_id, file_path, submitted_at from housing_id_checks
--    where status = 'pending' order by submitted_at;
--
--   -- decide (then delete the file from the housing-ids bucket in Storage)
--   update housing_id_checks
--      set status = 'verified', reviewed_at = now(), file_path = null
--    where user_id = '<uuid>';
