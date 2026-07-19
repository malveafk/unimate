-- Run this once in the Supabase SQL Editor to enable the real housing feature:
-- roommate profiles, apartment listings, user-to-user messages and the private
-- storage bucket for ID documents. Idempotent: safe to re-run.
--
-- Visibility model:
--   - Roommate profiles and listings are PUBLIC to read (that's the point of
--     the map), but only while active; owners always see and manage their own.
--   - Messages are private to the two participants.
--   - Uploaded ID documents are private to the owner (admins review them
--     through the service role, which bypasses RLS).

-- ── Shared updated_at trigger ────────────────────────────────────────────────

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ── Roommate profiles (the "Create profile" form) ────────────────────────────

create table if not exists housing_profiles (
  id uuid primary key default gen_random_uuid(),
  -- One profile per account; deleting the account deletes the profile.
  user_id uuid not null unique references auth.users(id) on delete cascade,

  -- Step 1 – Identity
  first_name text not null check (char_length(first_name) between 1 and 60),
  age int check (age between 16 and 99),
  gender text,
  nationality text,
  flag text,
  avatar_color text,

  -- Step 2 – University
  university text,
  programme text,
  study_year int check (study_year between 1 and 8),

  -- Step 3 – Housing needs (lat/lng filled from the city by the app)
  city text not null,
  lat double precision,
  lng double precision,
  budget_min int check (budget_min >= 0),
  budget_max int check (budget_max >= 0),
  move_in_month int check (move_in_month between 1 and 12),
  move_in_year int check (move_in_year between 2024 and 2100),

  -- Step 4 – About you
  bio text check (char_length(bio) <= 1000),
  lifestyle text[] not null default '{}',
  languages text[] not null default '{}',

  -- Step 5 – Looking for
  looking_for text check (char_length(looking_for) <= 500),
  gender_preference text,
  smoking_ok boolean not null default false,
  pets_ok boolean not null default false,

  -- Step 0 – ID verification (path inside the housing-ids bucket)
  id_file_path text,
  -- Set by an admin (service role) after reviewing the ID document.
  verified boolean not null default false,

  -- Lets users hide their profile from the map without deleting it.
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table housing_profiles enable row level security;

drop policy if exists "Active roommate profiles are public" on housing_profiles;
create policy "Active roommate profiles are public"
  on housing_profiles for select
  using (is_active or auth.uid() = user_id);

drop policy if exists "Users create own roommate profile" on housing_profiles;
create policy "Users create own roommate profile"
  on housing_profiles for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users update own roommate profile" on housing_profiles;
create policy "Users update own roommate profile"
  on housing_profiles for update
  using (auth.uid() = user_id)
  -- Verification is granted by admins only, never self-assigned.
  with check (auth.uid() = user_id);

drop policy if exists "Users delete own roommate profile" on housing_profiles;
create policy "Users delete own roommate profile"
  on housing_profiles for delete
  using (auth.uid() = user_id);

drop trigger if exists housing_profiles_updated_at on housing_profiles;
create trigger housing_profiles_updated_at
  before update on housing_profiles
  for each row execute function public.set_updated_at();

create index if not exists housing_profiles_city_idx on housing_profiles (city) where is_active;

-- ── Apartment listings ───────────────────────────────────────────────────────

create table if not exists housing_listings (
  id uuid primary key default gen_random_uuid(),
  -- Keep the listing if the author deletes their account (admins can clean up).
  created_by uuid references auth.users(id) on delete set null,

  title text not null check (char_length(title) between 1 and 120),
  city text not null,
  lat double precision,
  lng double precision,
  price int not null check (price between 0 and 100000),   -- €/month
  rooms int check (rooms between 1 and 20),
  furnished boolean not null default false,
  available_from date,
  description text check (char_length(description) <= 2000),
  -- External source, e.g. "Kamernet", "HousingAnywhere"; null = posted directly.
  platform text,
  link text check (link is null or link ~* '^https?://'),

  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table housing_listings enable row level security;

drop policy if exists "Active listings are public" on housing_listings;
create policy "Active listings are public"
  on housing_listings for select
  using (is_active or auth.uid() = created_by);

drop policy if exists "Users create own listings" on housing_listings;
create policy "Users create own listings"
  on housing_listings for insert
  with check (auth.uid() = created_by);

drop policy if exists "Users update own listings" on housing_listings;
create policy "Users update own listings"
  on housing_listings for update
  using (auth.uid() = created_by)
  with check (auth.uid() = created_by);

drop policy if exists "Users delete own listings" on housing_listings;
create policy "Users delete own listings"
  on housing_listings for delete
  using (auth.uid() = created_by);

drop trigger if exists housing_listings_updated_at on housing_listings;
create trigger housing_listings_updated_at
  before update on housing_listings
  for each row execute function public.set_updated_at();

create index if not exists housing_listings_city_idx on housing_listings (city) where is_active;

-- ── User-to-user messages (replaces the demo Messages page) ──────────────────

create table if not exists housing_conversations (
  id uuid primary key default gen_random_uuid(),
  participant_a uuid not null references auth.users(id) on delete cascade,
  participant_b uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  check (participant_a <> participant_b)
);

-- One conversation per pair, regardless of who started it.
create unique index if not exists housing_conversations_pair_idx
  on housing_conversations (least(participant_a, participant_b), greatest(participant_a, participant_b));

alter table housing_conversations enable row level security;

drop policy if exists "Participants read own conversations" on housing_conversations;
create policy "Participants read own conversations"
  on housing_conversations for select
  using (auth.uid() in (participant_a, participant_b));

drop policy if exists "Users start conversations they take part in" on housing_conversations;
create policy "Users start conversations they take part in"
  on housing_conversations for insert
  with check (auth.uid() in (participant_a, participant_b));

create table if not exists housing_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references housing_conversations(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  content text not null check (char_length(content) between 1 and 2000),
  created_at timestamptz not null default now(),
  read_at timestamptz
);

alter table housing_messages enable row level security;

drop policy if exists "Participants read messages" on housing_messages;
create policy "Participants read messages"
  on housing_messages for select
  using (exists (
    select 1 from housing_conversations c
    where c.id = conversation_id
      and auth.uid() in (c.participant_a, c.participant_b)
  ));

drop policy if exists "Participants send messages as themselves" on housing_messages;
create policy "Participants send messages as themselves"
  on housing_messages for insert
  with check (
    sender_id = auth.uid()
    and exists (
      select 1 from housing_conversations c
      where c.id = conversation_id
        and auth.uid() in (c.participant_a, c.participant_b)
    )
  );

-- Recipients mark messages as read (participants can set read_at).
drop policy if exists "Participants mark messages read" on housing_messages;
create policy "Participants mark messages read"
  on housing_messages for update
  using (exists (
    select 1 from housing_conversations c
    where c.id = conversation_id
      and auth.uid() in (c.participant_a, c.participant_b)
  ));

create index if not exists housing_messages_conversation_idx
  on housing_messages (conversation_id, created_at);

-- ── Private storage bucket for ID documents ──────────────────────────────────
-- Files live at <user_id>/<filename>; only the owner can touch them.
-- Admin review happens through the service role (bypasses RLS).

insert into storage.buckets (id, name, public)
  values ('housing-ids', 'housing-ids', false)
  on conflict (id) do nothing;

drop policy if exists "Users upload own housing ID" on storage.objects;
create policy "Users upload own housing ID"
  on storage.objects for insert
  with check (bucket_id = 'housing-ids' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Users read own housing ID" on storage.objects;
create policy "Users read own housing ID"
  on storage.objects for select
  using (bucket_id = 'housing-ids' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Users replace own housing ID" on storage.objects;
create policy "Users replace own housing ID"
  on storage.objects for update
  using (bucket_id = 'housing-ids' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Users delete own housing ID" on storage.objects;
create policy "Users delete own housing ID"
  on storage.objects for delete
  using (bucket_id = 'housing-ids' and (storage.foldername(name))[1] = auth.uid()::text);
