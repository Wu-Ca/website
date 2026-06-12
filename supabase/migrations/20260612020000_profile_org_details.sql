-- Profile details, organization contact details, and calendar feed tokens.

alter table public.profiles
  add column phone text,
  add column borough text,
  add column bio text,
  add column calendar_token uuid not null default gen_random_uuid();

create unique index profiles_calendar_token_idx
  on public.profiles (calendar_token);

alter table public.organizations
  add column website text,
  add column phone text,
  add column email text,
  add column address text,
  add column calendar_token uuid not null default gen_random_uuid();

create unique index organizations_calendar_token_idx
  on public.organizations (calendar_token);
