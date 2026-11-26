-- Removes roommate profiles, ID checks, blocking and the student-to-student
-- chat, and stops listings from being posted from the site.
--
-- From now on an owner emails the details to admin1@4uni.online and the
-- listing is added by hand (SQL editor or service role), already approved.
--
-- IRREVERSIBLE: this deletes every roommate profile, every ID-check record,
-- every block and every housing chat message. Nothing here keeps a copy.
--
-- What stays: housing_listings (partner feeds and listings already posted),
-- their review queue and owners' right to edit, hide or delete their own,
-- housing_reports on listings, and the housing-photos bucket.
--
-- Run it once in the Supabase SQL Editor. It runs as one transaction: if any
-- statement fails, nothing is changed. Safe to re-run (everything is
-- "if exists").
--
-- One thing this file does not do: the files in the private "housing-ids"
-- bucket. Deleting rows from storage.objects in SQL would only remove the
-- records and leave the files themselves in storage, so empty and delete that
-- bucket from the dashboard (Storage → housing-ids → Empty bucket, then
-- Delete bucket).

begin;

-- ── 1. Chat between students ────────────────────────────────────────────────
-- Messages first: they point at the conversations. Dropping the tables takes
-- their policies and triggers with them, including the policies that call
-- housing_blocked_with_me, which is why the chat goes before the blocks.

drop table if exists housing_messages;
drop table if exists housing_conversations;
drop function if exists public.enforce_housing_message_readonly_fields();

-- ── 2. Blocking ─────────────────────────────────────────────────────────────

drop function if exists public.housing_blocked_with_me(uuid);
drop table if exists housing_blocks;

-- ── 3. ID checks ────────────────────────────────────────────────────────────
-- The table takes its own triggers (the guard and the badge sync) with it.
-- The trigger on housing_listings that protects `verified` must go BEFORE the
-- column: it reads new.verified, and once the column is gone every insert or
-- update on a listing would fail inside it.

drop table if exists housing_id_checks;
drop function if exists public.enforce_housing_id_check();
drop function if exists public.sync_housing_verified();

drop trigger if exists housing_listings_verified_admin_only on housing_listings;

alter table housing_listings drop column if exists verified;
alter table housing_listings drop column if exists id_file_path;

-- The review trigger (housing_listing_review.sql) still subtracts 'verified'
-- from the row when it compares edits. Removing a key that isn't there is a
-- no-op in jsonb, so it keeps working unchanged.

-- ── 4. Roommate profiles ────────────────────────────────────────────────────
-- Reports about a person were reports about their roommate profile. With the
-- profiles gone there is nothing left for them to be about.

do $$
begin
  if to_regclass('public.housing_reports') is not null then
    delete from housing_reports where target_type = 'profile';
  end if;
end $$;

drop table if exists housing_profiles;

-- Only now: the profiles table carried a trigger that used this function too,
-- and Postgres refuses to drop a function something still depends on.
drop function if exists public.enforce_housing_verified_admin_only();

-- ── 5. No more posting from the site ────────────────────────────────────────
-- Without the insert policy, RLS refuses every insert from a browser session.
-- Owners can still edit, hide and delete the listings they already have
-- (those policies are untouched), and the service role and the SQL editor are
-- not subject to RLS, so listings added by hand still go in.

drop policy if exists "Users create own listings" on housing_listings;

-- Uploading new listing photos goes with it; deleting your own stays, so an
-- owner who deletes a listing from their account page also removes its photo.
drop policy if exists "Users upload own listing photos" on storage.objects;
drop policy if exists "Users replace own listing photos" on storage.objects;

-- ── 6. ID document storage ──────────────────────────────────────────────────

drop policy if exists "Users upload own housing ID" on storage.objects;
drop policy if exists "Users read own housing ID" on storage.objects;
drop policy if exists "Users replace own housing ID" on storage.objects;
drop policy if exists "Users delete own housing ID" on storage.objects;

commit;

-- ── Check, after running ────────────────────────────────────────────────────
-- Should return no rows:
--
--   select table_name from information_schema.tables
--    where table_schema = 'public'
--      and table_name in ('housing_profiles', 'housing_id_checks', 'housing_blocks',
--                         'housing_conversations', 'housing_messages');
--
--   select column_name from information_schema.columns
--    where table_name = 'housing_listings' and column_name in ('verified', 'id_file_path');
--
--   select policyname from pg_policies where tablename = 'housing_listings' and cmd = 'INSERT';
