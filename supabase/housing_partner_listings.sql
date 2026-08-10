-- Migration: partner-listing fields on housing_listings
-- ---------------------------------------------------------------------------
-- Adds the columns needed to store apartment listings that come from an
-- external partner feed (e.g. a consenting housing platform) alongside the
-- listings students post directly. Every column is nullable so existing
-- user-posted rows (source = null) keep working unchanged.
--
-- Idempotent: every statement uses IF NOT EXISTS, so it is safe to re-run.
-- Run once in the Supabase SQL Editor AFTER reviewing it. Does NOT touch data.

alter table housing_listings
  -- Provenance of the row. null / "user" = posted directly by a student;
  -- "demo" = fictitious placeholder data; "clubhouse-student" (etc.) = a
  -- specific partner. Keeps partner rows distinguishable from ours and from
  -- other future partners.
  add column if not exists source      text,
  -- Link back to the partner's own site (for attribution). null when N/A.
  add column if not exists source_url  text check (source_url is null or source_url ~* '^https?://'),
  -- The listing's unique id ON THE SOURCE, so re-syncs update in place
  -- instead of creating duplicates. Unique per source (see index below).
  add column if not exists source_id   text,
  -- Photo URLs. text[] (not a single text) to hold a gallery; mirrors the
  -- text[] arrays already used on housing_profiles (lifestyle, languages).
  add column if not exists image       text[] not null default '{}',
  add column if not exists address     text,
  add column if not exists bathrooms   int     check (bathrooms is null or bathrooms between 0 and 20),
  add column if not exists size_sqm    numeric check (size_sqm is null or size_sqm between 0 and 10000),
  add column if not exists available_to date;

-- One row per (source, source_id) so the seed/sync script can UPSERT with
-- onConflict: "source,source_id". Postgres treats NULLs as distinct, so the
-- many user-posted rows (both columns null) never collide with each other.
create unique index if not exists housing_listings_source_uid
  on housing_listings (source, source_id);

-- Handy for filtering a single partner's active rows on the map.
create index if not exists housing_listings_source_idx
  on housing_listings (source) where is_active;
