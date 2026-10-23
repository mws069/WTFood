-- Daily scan limit per user (protects the AI budget). Kept apart from
-- scan_stats, which stays anonymous. Only the server (secret key) uses it.

create table public.scan_quota (
  user_id uuid not null references public.profiles (id) on delete cascade,
  day date not null,
  count int not null default 0,
  primary key (user_id, day)
);

alter table public.scan_quota enable row level security;
-- No policies on purpose: users can neither read nor change their quota.

-- Counts one scan for today (Hong Kong time). Returns the new count, or -1
-- if the user has already reached the limit.
create function public.consume_scan(p_user uuid, p_limit int)
returns int
language plpgsql
security definer
set search_path = ''
as $$
declare
  today date := (now() at time zone 'Asia/Hong_Kong')::date;
  new_count int;
begin
  insert into public.scan_quota as q (user_id, day, count)
  values (p_user, today, 1)
  on conflict (user_id, day) do update
    set count = q.count + 1
    where q.count < p_limit
  returning q.count into new_count;
  return coalesce(new_count, -1);
end;
$$;

revoke execute on function public.consume_scan(uuid, int) from public, anon, authenticated;
