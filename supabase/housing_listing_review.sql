-- ── Publishing a listing is a request, not an action ─────────────────────────
--
-- Why this file exists.
--
-- Until now the "Post an apartment" form published straight onto the map. The
-- insert policy only asks WHOSE row it is:
--
--   create policy "Users create own listings" ... with check (auth.uid() = created_by);
--
-- so any signed-in student could put a flat in front of every visitor with
-- nobody having looked at it. The product rule is the opposite: a student
-- PROPOSES a flat, an admin reads it, and only then does it go live.
--
-- The state does not belong in `is_active`, which already means something
-- else — "the owner has hidden this". Reusing it would hand the owner the
-- publish button: hide, un-hide, live. So this adds a separate column.
--
--   pending    waiting for an admin (where every student listing starts)
--   approved   on the map
--   rejected   reviewed and refused; kept rather than deleted, so there is a
--              record of the decision and the owner can see what happened
--
-- The column DEFAULTS to 'approved' and the trigger forces 'pending' for
-- ordinary users. That reads backwards and is deliberate. A default of
-- 'pending' would also apply to every row that already exists when this file
-- runs, and to the Club House partner feed — scripts/clubhouse/import.ts
-- upserts a fixed column list and never mentions status — so the entire map
-- would go dark until somebody remembered to run an UPDATE. The default
-- therefore describes rows WE insert; the trigger describes rows USERS insert.
--
-- Fail-closed, so that inversion can't bite: the insert policy ALSO demands
-- status = 'pending'. If the trigger is ever dropped, the default takes over,
-- the policy refuses the insert, and posting a flat breaks loudly — rather
-- than quietly publishing unreviewed listings. Two independent mechanisms,
-- and losing either one fails safe.
--
-- Safe to run more than once.

-- ── The column ───────────────────────────────────────────────────────────────

alter table housing_listings
  add column if not exists status text not null default 'approved';

-- Postgres has no ADD CONSTRAINT IF NOT EXISTS, hence the guard.
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'housing_listings_status_check') then
    alter table housing_listings
      add constraint housing_listings_status_check
      check (status in ('pending', 'approved', 'rejected'));
  end if;
end $$;

-- ── The rule ─────────────────────────────────────────────────────────────────

create or replace function public.enforce_housing_listing_review()
returns trigger as $$
begin
  -- Not security definer, on purpose. CURRENT_USER "also changes during the
  -- execution of functions with the attribute SECURITY DEFINER" (PostgreSQL
  -- docs): it would read as this function's OWNER — postgres, for anything
  -- created in the SQL editor — which is in the allowlist below, so every
  -- caller would take the admin path and this file would protect nothing.
  -- PostgREST impersonates the caller with SET ROLE, and the impersonated role
  -- is what an INVOKER function sees here.
  if current_user in ('service_role', 'postgres', 'supabase_admin') then
    return new;
  end if;

  if tg_op = 'INSERT' then
    -- Whatever the client sent, a student listing starts in the queue.
    new.status := 'pending';
    return new;
  end if;

  -- Only an admin moves a listing between states.
  if new.status is distinct from old.status then
    raise exception 'housing_listings.status is set by an admin review, not by the owner';
  end if;

  -- An edit to an approved listing sends it back to the queue, otherwise the
  -- review decides nothing: post an innocuous flat, wait for the approval,
  -- then rewrite it into whatever you actually wanted to publish.
  --
  -- Compared as jsonb rather than field by field, so this keeps holding as
  -- columns are added to the table (the partner migration added nine, and not
  -- every database here has them). is_active is excluded deliberately —
  -- hiding and un-hiding your own listing is not a content change and must not
  -- cost you your approval. status and verified are excluded because they are
  -- the admin's own fields, handled above and in housing_verified_admin_only.
  if old.status = 'approved'
     and (to_jsonb(new) - 'status' - 'verified' - 'is_active' - 'updated_at')
         is distinct from
         (to_jsonb(old) - 'status' - 'verified' - 'is_active' - 'updated_at')
  then
    new.status := 'pending';
  end if;

  return new;
end;
$$ language plpgsql set search_path = public;

drop trigger if exists housing_listings_review on housing_listings;
create trigger housing_listings_review
  before insert or update on housing_listings
  for each row execute function public.enforce_housing_listing_review();

-- ── Who sees what ────────────────────────────────────────────────────────────

-- Dropping the old policy BY ITS OLD NAME is the load-bearing line here:
-- permissive policies are OR-ed together, so leaving "Active listings are
-- public" in place would keep every pending listing public no matter what the
-- new policy says.
drop policy if exists "Active listings are public" on housing_listings;
drop policy if exists "Approved listings are public" on housing_listings;
create policy "Approved listings are public"
  on housing_listings for select
  using ((is_active and status = 'approved') or auth.uid() = created_by);

-- The second half of the fail-closed check described at the top.
drop policy if exists "Users create own listings" on housing_listings;
create policy "Users create own listings"
  on housing_listings for insert
  with check (auth.uid() = created_by and status = 'pending');

create index if not exists housing_listings_review_queue_idx
  on housing_listings (created_at) where status = 'pending';

-- ── Reviewing, from the SQL editor ───────────────────────────────────────────
-- The editor connects as postgres, which the trigger treats as an admin, so
-- these three statements are the whole admin surface for now. No app screen
-- yet — same arrangement as the ID documents, which are reviewed through the
-- service role.
--
--   -- the queue, oldest first
--   select id, created_at, created_by, city, price, title, description, link
--     from housing_listings where status = 'pending' order by created_at;
--
--   -- decide
--   update housing_listings set status = 'approved' where id = '<uuid>';
--   update housing_listings set status = 'rejected' where id = '<uuid>';
