-- Run this once in the Supabase SQL Editor to enable user profiles.
-- Requires DDL access (Personal Access Token or the SQL Editor itself);
-- the app's anon/service-role keys alone cannot create tables.

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

-- Automatically create a profile row whenever a new user signs up
-- (email/password or OAuth), so `profiles` never gets out of sync
-- with `auth.users`.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
