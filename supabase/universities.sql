-- Run this once in the Supabase SQL Editor to create the university catalogue:
-- universities, their bachelor programmes and the courses inside each bachelor.
-- Idempotent: safe to re-run.
--
-- How the data gets in and out:
--   - `seed.ts` populates these tables from app/data/universities.ts using the
--     SERVICE ROLE key, which bypasses RLS — so there are no write policies for
--     regular users here.
--   - The site reads them with the anon key via utils/universities.ts, so every
--     table is PUBLIC to read. If Supabase is unreachable the app falls back to
--     the static data in app/data/universities.ts.
--
-- Text-column note: `languages` and `strengths` are stored as a single string
-- with values joined by ", " (e.g. "English, Dutch"); the app splits them back
-- into an array on read.

-- ── Universities ─────────────────────────────────────────────────────────────

create table if not exists universities (
  -- Human-readable slug, e.g. "maastricht" (matches the URL and the static data).
  id text primary key,
  name text not null,
  city text not null,
  country text not null,
  flag text,                       -- emoji flag, e.g. "🇳🇱"
  tuition text,                    -- free text, e.g. "€2,601/anno"
  living_cost text,                -- free text, e.g. "€900–€1,100/mese"
  teaching text,
  languages text,                  -- ", "-joined, e.g. "English, Dutch"
  strengths text,                  -- ", "-joined
  description text,
  city_vibe text,                  -- nullable
  website text,
  ranking text,                    -- nullable, e.g. "Top 250 QS (#239, 2026)"
  created_at timestamptz not null default now()
);

alter table universities enable row level security;

drop policy if exists "Universities are public" on universities;
create policy "Universities are public"
  on universities for select
  using (true);

-- ── Bachelor programmes ──────────────────────────────────────────────────────

create table if not exists bachelors (
  -- Composite id "<university_id>__<bachelor_id>", e.g.
  -- "maastricht__international-business" (kept unique across universities).
  id text primary key,
  university_id text not null references universities(id) on delete cascade,
  name text not null,
  duration text,                   -- free text, e.g. "3 years"
  language text,
  description text,
  created_at timestamptz not null default now()
);

alter table bachelors enable row level security;

drop policy if exists "Bachelors are public" on bachelors;
create policy "Bachelors are public"
  on bachelors for select
  using (true);

create index if not exists bachelors_university_idx
  on bachelors (university_id);

-- ── Courses (inside a bachelor) ──────────────────────────────────────────────

create table if not exists courses (
  -- Id "<bachelor_id>__c<index>", e.g.
  -- "maastricht__international-business__c0".
  id text primary key,
  -- References the raw (un-stripped) bachelor id.
  bachelor_id text not null references bachelors(id) on delete cascade,
  name text not null,
  credits text,                    -- nullable, e.g. "6 ECTS"
  year int check (year between 1 and 5),   -- nullable
  created_at timestamptz not null default now()
);

alter table courses enable row level security;

drop policy if exists "Courses are public" on courses;
create policy "Courses are public"
  on courses for select
  using (true);

create index if not exists courses_bachelor_idx
  on courses (bachelor_id);
