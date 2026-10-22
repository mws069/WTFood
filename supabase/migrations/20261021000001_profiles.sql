-- Profiles: one row per account, created automatically on sign-up.
-- Restrictions are health-related data and may only be stored after consent.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text check (char_length(display_name) <= 40),
  restrictions text[] not null default '{}',
  health_consent_at timestamptz,
  role text not null default 'user' check (role in ('user', 'team')),
  created_at timestamptz not null default now(),
  constraint restrictions_need_consent
    check (cardinality(restrictions) = 0 or health_consent_at is not null)
);

alter table public.profiles enable row level security;

-- Users see and edit only their own profile.
create policy "profiles: read own" on public.profiles
  for select to authenticated
  using (id = (select auth.uid()));

create policy "profiles: update own" on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- Users may change these columns only; role and created_at stay server-side.
revoke insert, update, delete on public.profiles from anon, authenticated;
grant update (display_name, restrictions, health_consent_at) on public.profiles to authenticated;

-- Create the profile when an account is created. The optional nickname
-- comes from the sign-up form (user metadata "display_name").
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    nullif(left(trim(new.raw_user_meta_data ->> 'display_name'), 40), '')
  );
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
