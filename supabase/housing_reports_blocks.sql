-- ── Reporting a listing, and blocking a person ───────────────────────────────
--
-- Why this file exists.
--
-- The review queue (supabase/housing_listing_review.sql) catches what an admin
-- can see BEFORE a listing goes live. It cannot catch what only shows up
-- afterwards: the "landlord" who asks for a deposit by bank transfer once the
-- conversation moves to WhatsApp, the profile that turns abusive in the inbox.
-- The people who find that out are the students, and until now they had no way
-- to tell anyone or to make it stop.
--
-- Two different problems, so two different mechanisms — this is the whole idea
-- behind the file, and the reason it is not one table:
--
--   REPORT  "this is bad for everyone"   → a signal to an admin, who decides.
--           Slow by nature: somebody has to read it. One report changes
--           nothing on its own, and that is correct — a report is evidence,
--           not a verdict, or any user could take any listing down.
--
--   BLOCK   "this is bad for ME"         → takes effect immediately, decided
--           by the student alone, affects nobody else's view of the site.
--           Nothing to review, so nothing to wait for.
--
-- Collapsing them into one "flag" would force a bad trade: either a student
-- waits for an admin before they can stop being contacted, or a single click
-- hides a listing from everyone. Keeping them apart lets each be as fast or as
-- careful as it needs to be.
--
-- Safe to run more than once.

-- ── Reports ──────────────────────────────────────────────────────────────────
--
-- One table for both kinds of target. A listing report and a profile report
-- carry the same payload (who, why, free text, what the admin decided) and are
-- read in one queue, so splitting them into two tables would mean two of every
-- policy and a UNION in the admin page for no gain. The check constraint below
-- does the work a separate table would have done: exactly one target column is
-- filled, and it matches target_type.

create table if not exists housing_reports (
  id uuid primary key default gen_random_uuid(),

  -- Who is reporting. Deleting the account deletes their reports: an
  -- anonymous accusation nobody can follow up on is not worth keeping.
  reporter_id uuid not null references auth.users(id) on delete cascade,

  target_type text not null,
  listing_id uuid references housing_listings(id) on delete cascade,
  profile_user_id uuid references auth.users(id) on delete cascade,

  reason text not null,
  details text,

  --   open       nobody has looked at it yet
  --   actioned   an admin agreed and did something (rejected the listing…)
  --   dismissed  an admin looked and found nothing wrong
  status text not null default 'open',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Postgres has no ADD CONSTRAINT IF NOT EXISTS, hence the guards. They are
-- separate from the CREATE TABLE above so that a database where the table
-- already exists still gets them.
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'housing_reports_target_type_check') then
    alter table housing_reports add constraint housing_reports_target_type_check
      check (target_type in ('listing', 'profile'));
  end if;

  if not exists (select 1 from pg_constraint where conname = 'housing_reports_reason_check') then
    alter table housing_reports add constraint housing_reports_reason_check
      check (reason in ('scam', 'fake', 'inappropriate', 'spam', 'other'));
  end if;

  if not exists (select 1 from pg_constraint where conname = 'housing_reports_status_check') then
    alter table housing_reports add constraint housing_reports_status_check
      check (status in ('open', 'actioned', 'dismissed'));
  end if;

  if not exists (select 1 from pg_constraint where conname = 'housing_reports_details_length_check') then
    alter table housing_reports add constraint housing_reports_details_length_check
      check (details is null or char_length(details) <= 1000);
  end if;

  -- Exactly one target, and it agrees with target_type.
  if not exists (select 1 from pg_constraint where conname = 'housing_reports_one_target_check') then
    alter table housing_reports add constraint housing_reports_one_target_check
      check (
        (target_type = 'listing' and listing_id is not null and profile_user_id is null)
        or
        (target_type = 'profile' and profile_user_id is not null and listing_id is null)
      );
  end if;

  -- Reporting yourself is always a mistake or a test.
  if not exists (select 1 from pg_constraint where conname = 'housing_reports_not_self_check') then
    alter table housing_reports add constraint housing_reports_not_self_check
      check (profile_user_id is null or profile_user_id <> reporter_id);
  end if;
end $$;

-- One open complaint per person per target. Without this, a grudge is a loop:
-- the same student files the same report fifty times and the queue is useless.
-- Partial indexes because the unused target column is null, and null is not
-- equal to itself for uniqueness purposes.
create unique index if not exists housing_reports_one_per_listing_idx
  on housing_reports (reporter_id, listing_id) where listing_id is not null;
create unique index if not exists housing_reports_one_per_profile_idx
  on housing_reports (reporter_id, profile_user_id) where profile_user_id is not null;

create index if not exists housing_reports_open_idx
  on housing_reports (created_at) where status = 'open';

alter table housing_reports enable row level security;

-- You can see what you reported — so the UI can say "you already reported
-- this" — and nothing else. Reports are not public: a listing that shows its
-- own accusations would hand every competitor a way to smear it.
drop policy if exists "Users read own reports" on housing_reports;
create policy "Users read own reports"
  on housing_reports for select
  using (auth.uid() = reporter_id);

drop policy if exists "Users file own reports" on housing_reports;
create policy "Users file own reports"
  on housing_reports for insert
  with check (auth.uid() = reporter_id);

-- Deliberately no UPDATE or DELETE policy for users. `status` is the admin's
-- verdict, and a reporter who could withdraw a report could also be pressured
-- into withdrawing it. Admins write through the service role, which bypasses
-- RLS entirely — the same arrangement the review queue already uses.

drop trigger if exists housing_reports_updated_at on housing_reports;
create trigger housing_reports_updated_at
  before update on housing_reports
  for each row execute function public.set_updated_at();

-- ── Blocks ───────────────────────────────────────────────────────────────────
--
-- Directed, not mutual: the row records who did the blocking. The EFFECT is
-- symmetric (neither side can message the other), but the fact is one-sided,
-- so unblocking only undoes your own decision and cannot undo theirs.

create table if not exists housing_blocks (
  blocker_id uuid not null references auth.users(id) on delete cascade,
  blocked_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id)
);

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'housing_blocks_not_self_check') then
    alter table housing_blocks add constraint housing_blocks_not_self_check
      check (blocker_id <> blocked_id);
  end if;
end $$;

alter table housing_blocks enable row level security;

-- You see the blocks YOU made (the account page lists them so they can be
-- undone). You never see who blocked you — see the note on the function below.
drop policy if exists "Users read own blocks" on housing_blocks;
create policy "Users read own blocks"
  on housing_blocks for select
  using (auth.uid() = blocker_id);

drop policy if exists "Users create own blocks" on housing_blocks;
create policy "Users create own blocks"
  on housing_blocks for insert
  with check (auth.uid() = blocker_id);

drop policy if exists "Users remove own blocks" on housing_blocks;
create policy "Users remove own blocks"
  on housing_blocks for delete
  using (auth.uid() = blocker_id);

-- ── Why the block check needs a SECURITY DEFINER function ────────────────────
--
-- The obvious way to enforce a block is a subquery on housing_blocks inside
-- the housing_messages policy. It does not work, and the way it fails is
-- silent, which is worse than failing loudly.
--
-- Row security applies to a table wherever it is referenced, INCLUDING inside
-- another policy's expression, and it is evaluated as the user running the
-- query. So a subquery on housing_blocks run by the blocked person sees only
-- the rows WHERE blocker_id = their own id — and the row that blocks them
-- (blocker_id = the other person) is filtered out before the check ever
-- compares it. The policy would read as "no block exists", and the messages
-- would go through: exactly the case the block is for.
--
-- A SECURITY DEFINER function runs as its owner, so RLS does not hide the row
-- from it. It takes only the other participant and answers solely about the
-- caller — it cannot be used to probe whether two strangers have blocked each
-- other. The blocked person can still infer the block from a refused message,
-- which is unavoidable: any enforcement is observable by the person it stops.

create or replace function public.housing_blocked_with_me(other uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from housing_blocks
    where (blocker_id = auth.uid() and blocked_id = other)
       or (blocker_id = other and blocked_id = auth.uid())
  );
$$;

revoke all on function public.housing_blocked_with_me(uuid) from public;
grant execute on function public.housing_blocked_with_me(uuid) to authenticated, service_role;

-- ── The block, enforced ──────────────────────────────────────────────────────
--
-- In the database, not in the UI. Hiding the send button stops the polite;
-- these policies stop everyone, including a script posting straight at
-- PostgREST with a stolen session.
--
-- Reading old messages is left alone on purpose. A block stops what comes
-- next; it does not rewrite what already happened, and a student may well need
-- the earlier messages as evidence for the report they just filed.
--
-- NOTE: both policies below replace ones that supabase/housing.sql creates
-- without the block check. Re-running housing.sql after this file silently
-- puts the unrestricted versions back and every block stops working, with no
-- error anywhere. If you ever re-run it, run this file again afterwards.

drop policy if exists "Participants send messages as themselves" on housing_messages;
create policy "Participants send messages as themselves"
  on housing_messages for insert
  with check (
    sender_id = auth.uid()
    and exists (
      select 1 from housing_conversations c
      where c.id = conversation_id
        and auth.uid() in (c.participant_a, c.participant_b)
        and not public.housing_blocked_with_me(
          case when c.participant_a = auth.uid() then c.participant_b else c.participant_a end
        )
    )
  );

-- And no starting a fresh conversation to get around a block on the old one.
drop policy if exists "Users start conversations they take part in" on housing_conversations;
create policy "Users start conversations they take part in"
  on housing_conversations for insert
  with check (
    auth.uid() in (participant_a, participant_b)
    and not public.housing_blocked_with_me(
      case when participant_a = auth.uid() then participant_b else participant_a end
    )
  );

-- ── Reviewing, from the SQL editor ───────────────────────────────────────────
-- The admin page at /admin reads and decides these. The equivalent by hand:
--
--   select r.created_at, r.target_type, r.reason, r.details,
--          l.title, l.city, l.price
--     from housing_reports r
--     left join housing_listings l on l.id = r.listing_id
--    where r.status = 'open'
--    order by r.created_at;
--
--   update housing_reports set status = 'dismissed' where id = '<uuid>';
