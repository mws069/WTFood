-- The optional nickname becomes a required, unique username that can be
-- used to log in. Stored in lower case: 3–20 letters, numbers, _ or .
-- Accounts without a valid username are asked to pick one in the app.

alter table public.profiles rename column display_name to username;

-- Keep existing nicknames only if they already fit the rules.
update public.profiles set username = lower(username);
update public.profiles set username = null where username !~ '^[a-z0-9_.]{3,20}$';
update public.profiles p set username = null
  where username is not null
    and exists (select 1 from public.profiles q where q.username = p.username and q.created_at < p.created_at);

alter table public.profiles drop constraint if exists profiles_display_name_check;
alter table public.profiles
  add constraint username_format check (username ~ '^[a-z0-9_.]{3,20}$');
create unique index profiles_username_unique on public.profiles (username);

revoke update on public.profiles from authenticated;
grant update (username, restrictions, health_consent_at) on public.profiles to authenticated;

-- New accounts: take the username from the sign-up form if it is valid and
-- still free; otherwise leave it empty (the app then asks for one).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  wanted text := lower(trim(new.raw_user_meta_data ->> 'username'));
begin
  if wanted !~ '^[a-z0-9_.]{3,20}$'
     or exists (select 1 from public.profiles where username = wanted) then
    wanted := null;
  end if;
  insert into public.profiles (id, username) values (new.id, wanted);
  return new;
end;
$$;
