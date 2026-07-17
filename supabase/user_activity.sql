-- Run this once in the Supabase SQL Editor to enable user activity tracking.
-- This is the foundation of the chatbot's "memory": it records what a
-- logged-in user has looked at (e.g. which universities) so the assistant
-- can reference it later. RLS restricts every user to their own rows; the
-- service role (used server-side by the chatbot) can still read everything.

create table if not exists user_activity (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  -- What kind of activity this is, e.g. 'university_view'. Kept generic so
  -- new memory signals can reuse the same table.
  activity_type text not null,
  -- Identifier of the thing the user interacted with (e.g. the university id).
  target_id text not null,
  -- Human-friendly label (e.g. the university name) for chatbot context.
  target_label text,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  -- De-duplication: one row per user + activity + target. Re-opening the same
  -- university just refreshes last_seen_at instead of inserting a duplicate.
  unique (user_id, activity_type, target_id)
);

alter table user_activity enable row level security;

-- Each user can only read and write their own activity rows.
create policy "Users can view own activity"
  on user_activity for select
  using (auth.uid() = user_id);

create policy "Users can insert own activity"
  on user_activity for insert
  with check (auth.uid() = user_id);

-- Needed so the de-duplicating upsert can refresh last_seen_at on conflict.
create policy "Users can update own activity"
  on user_activity for update
  using (auth.uid() = user_id);
