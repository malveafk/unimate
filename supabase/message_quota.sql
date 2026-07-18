-- Run this once in the Supabase SQL Editor to enable the DAILY free-message cap.
-- The counter automatically resets at midnight (UTC): rows carry the date of
-- their last update, and the first message of a new day restarts the count at 1.
-- Only the service role (used server-side in /api/chat via consume_message_quota)
-- can read or write; RLS blocks anon/authenticated client access entirely.

create table if not exists message_quota (
  -- Identifier for the quota bucket: the logged-in user's id, or the IP
  -- address for anonymous visitors.
  identifier text primary key,
  messages_used int not null default 0,
  -- Reserved for a future Premium tier: when true, the cap is skipped.
  -- Not enforced yet — always false for now.
  is_premium boolean not null default false,
  updated_at timestamptz not null default now()
);

alter table message_quota enable row level security;

-- Atomically increment the counter and report whether the message is allowed.
-- The upsert with ON CONFLICT runs as a single statement, so concurrent
-- requests for the same identifier cannot race past the cap.
-- Returns true when the message is allowed, false when the cap is reached.
-- Parameters are prefixed with p_ so they never collide with column names
-- (a same-named param would make `on conflict (identifier)` ambiguous).
drop function if exists public.consume_message_quota(text, int);

create function public.consume_message_quota(p_identifier text, p_max_messages int)
returns boolean as $$
declare
  new_count int;
  premium boolean;
begin
  insert into public.message_quota as q (identifier, messages_used, updated_at)
    values (p_identifier, 1, now())
  on conflict (identifier) do update
    -- New day → restart the count at 1; same day → increment.
    set messages_used = case
          when q.updated_at::date < current_date then 1
          else q.messages_used + 1
        end,
        updated_at = now()
  returning q.messages_used, q.is_premium into new_count, premium;

  -- Premium users are never capped (flag not set by anything yet).
  if premium then
    return true;
  end if;

  return new_count <= p_max_messages;
end;
$$ language plpgsql security definer set search_path = public;
