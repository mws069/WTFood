-- Daily limits for other paid features than scans (milestone 6b: the
-- Ask-staff translator). Same idea as scan_quota, with a kind per feature.
-- Only the server (secret key) uses it.

create table public.usage_quota (
  user_id uuid not null references public.profiles (id) on delete cascade,
  day date not null,
  kind text not null check (kind in ('translate')),
  count int not null default 0,
  primary key (user_id, day, kind)
);

alter table public.usage_quota enable row level security;
-- No policies on purpose: users can neither read nor change their quota.

-- Counts one use for today (Hong Kong time). Returns the new count, or -1
-- if the user has already reached the limit.
create function public.consume_quota(p_user uuid, p_kind text, p_limit int)
returns int
language plpgsql
security definer
set search_path = ''
as $$
declare
  today date := (now() at time zone 'Asia/Hong_Kong')::date;
  new_count int;
begin
  insert into public.usage_quota as q (user_id, day, kind, count)
  values (p_user, today, p_kind, 1)
  on conflict (user_id, day, kind) do update
    set count = q.count + 1
    where q.count < p_limit
  returning q.count into new_count;
  return coalesce(new_count, -1);
end;
$$;

revoke execute on function public.consume_quota(uuid, text, int) from public, anon, authenticated;
