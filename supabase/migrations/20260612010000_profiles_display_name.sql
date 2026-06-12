-- Profile editing support + backfill.

alter table public.profiles
  add column if not exists display_name text;

-- Backfill profiles for any auth users created before the
-- on_auth_user_created trigger existed.
insert into public.profiles (id, email)
select id, email from auth.users
on conflict (id) do nothing;

create policy "Users can update their own profile"
  on public.profiles for update
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);
