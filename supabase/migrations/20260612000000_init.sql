-- CommonGround NYC — initial schema.
-- Run this in the Supabase SQL editor (or `supabase db push`) once.
--
-- All application data access happens server-side through the service-role
-- key inside an auth-checked data access layer (lib/db.ts). RLS is enabled
-- on every table with minimal policies so the anon/publishable key cannot
-- read or write application data directly.

-- Mirror of auth.users for queryable registrant emails.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using ((select auth.uid()) = id);

-- Keep profiles in sync with auth.users.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert or update of email on auth.users
  for each row execute function public.handle_new_user();

-- One organization per owner (matches the current product design).
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  owner_user_id uuid not null unique references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.organizations enable row level security;

create policy "Owners can view their organization"
  on public.organizations for select
  using ((select auth.uid()) = owner_user_id);

-- Community events published by organizations. Aggregated library events
-- (NYPL/BPL/QPL) live in application code, not in this table.
create table public.events (
  id text primary key,
  title text not null,
  description text not null,
  date date not null,
  start_time text not null,
  end_time text not null,
  venue_name text not null,
  address text not null,
  borough text not null,
  zip text not null,
  lat double precision not null,
  lng double precision not null,
  -- null means free
  cost numeric,
  category text not null,
  contact_email text,
  is_canceled boolean not null default false,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.events enable row level security;

create index events_organization_id_idx on public.events (organization_id);

-- event_id is text with no FK: users can also register for aggregated
-- library events whose ids (e.g. "nypl-001") only exist in app code.
create table public.registrations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  event_id text not null,
  created_at timestamptz not null default now(),
  canceled_at timestamptz
);

alter table public.registrations enable row level security;

create index registrations_user_id_idx on public.registrations (user_id);
create index registrations_event_id_idx on public.registrations (event_id);

-- At most one active registration per user per event; canceled rows
-- are kept for history and don't block re-registering.
create unique index registrations_active_unique
  on public.registrations (user_id, event_id)
  where canceled_at is null;
