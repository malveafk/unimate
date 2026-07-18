-- Run this once in the Supabase SQL Editor to enable action logging.
-- Only the service role (used server-side in /api/log and the OAuth
-- callback) can write; RLS blocks anon/client access entirely.

create table if not exists logs (
  id bigint generated always as identity primary key,
  action text not null,
  ip text,
  created_at timestamptz not null default now()
);

alter table logs enable row level security;
