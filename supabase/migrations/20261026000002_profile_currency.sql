-- Milestone 6c: the currency menu prices are converted to (null = only HK$).
alter table public.profiles add column currency text check (currency ~ '^[A-Z]{3}$');
grant update (currency) on public.profiles to authenticated;
