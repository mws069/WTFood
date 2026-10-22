-- All remaining tables from the brief, with Row Level Security.
-- Access: everyone logged in reads the knowledge base (only verified dishes
-- and reviewed staff phrases); only role = 'team' writes it and uses the Lab.

-- Is the current user a team member? security definer so policies can call
-- it without hitting profiles' own RLS.
create function public.is_team()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles where id = (select auth.uid()) and role = 'team'
  );
$$;

revoke execute on function public.is_team() from public, anon;
grant execute on function public.is_team() to authenticated;

-- Team members may read all profiles' names (needed to show who added what).
create policy "profiles: team reads all" on public.profiles
  for select to authenticated
  using ((select public.is_team()));

-- ---------------------------------------------------------------- knowledge base

create table public.ingredients (
  key text primary key check (key ~ '^[a-z0-9_]+$'),
  label_en text not null,
  categories text[] not null default '{}'
);

create table public.ingredient_terms (
  id bigint generated always as identity primary key,
  term_zh text not null,
  variants text[] not null default '{}',
  ingredient_key text not null references public.ingredients (key) on update cascade,
  note text,
  unique (term_zh, ingredient_key)
);

create table public.dishes (
  id bigint generated always as identity primary key,
  name_zh text not null,
  aliases text[] not null default '{}',
  jyutping text,
  name_en text not null,
  description_en text,
  ingredients jsonb not null default '[]' check (jsonb_typeof(ingredients) = 'array'),
  category text,
  source_url text,
  status text not null default 'draft' check (status in ('draft', 'verified')),
  verified_by uuid references public.profiles (id) on delete set null,
  updated_at timestamptz not null default now(),
  -- "draft → verified with source URL"
  constraint verified_needs_source check (status = 'draft' or source_url is not null)
);

create table public.staff_phrases (
  id bigint generated always as identity primary key,
  restriction_key text not null,
  text_zh text not null,
  jyutping text,
  text_en text not null,
  reviewed boolean not null default false
);

alter table public.ingredients enable row level security;
alter table public.ingredient_terms enable row level security;
alter table public.dishes enable row level security;
alter table public.staff_phrases enable row level security;

create policy "ingredients: logged in read" on public.ingredients
  for select to authenticated using (true);
create policy "ingredients: team writes" on public.ingredients
  for all to authenticated using ((select public.is_team())) with check ((select public.is_team()));

create policy "ingredient_terms: logged in read" on public.ingredient_terms
  for select to authenticated using (true);
create policy "ingredient_terms: team writes" on public.ingredient_terms
  for all to authenticated using ((select public.is_team())) with check ((select public.is_team()));

create policy "dishes: read verified, team reads all" on public.dishes
  for select to authenticated using (status = 'verified' or (select public.is_team()));
create policy "dishes: team inserts" on public.dishes
  for insert to authenticated with check ((select public.is_team()));
create policy "dishes: team updates" on public.dishes
  for update to authenticated using ((select public.is_team())) with check ((select public.is_team()));
create policy "dishes: team deletes" on public.dishes
  for delete to authenticated using ((select public.is_team()));

create policy "staff_phrases: read reviewed, team reads all" on public.staff_phrases
  for select to authenticated using (reviewed or (select public.is_team()));
create policy "staff_phrases: team inserts" on public.staff_phrases
  for insert to authenticated with check ((select public.is_team()));
create policy "staff_phrases: team updates" on public.staff_phrases
  for update to authenticated using ((select public.is_team())) with check ((select public.is_team()));
create policy "staff_phrases: team deletes" on public.staff_phrases
  for delete to authenticated using ((select public.is_team()));

-- Keep updated_at current on every dish change.
create function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger dishes_touch before update on public.dishes
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------- feedback and stats

create table public.feedback (
  id bigint generated always as identity primary key,
  user_id uuid references public.profiles (id) on delete cascade,
  approach text check (approach in ('A1', 'A2', 'A3')),
  item_text text,
  verdict_shown text check (verdict_shown in ('ok', 'check', 'avoid')),
  comment text check (char_length(comment) <= 1000),
  created_at timestamptz not null default now()
);

-- No user id and no photo, on purpose. Written by the server only.
create table public.scan_stats (
  id bigint generated always as identity primary key,
  approach text not null check (approach in ('A1', 'A2', 'A3')),
  kind text check (kind in ('menu', 'kiosk', 'label')),
  item_count int,
  latency_ms int,
  cost_usd numeric(10, 5),
  created_at timestamptz not null default now()
);

alter table public.feedback enable row level security;
alter table public.scan_stats enable row level security;

create policy "feedback: users add their own" on public.feedback
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "feedback: team reads" on public.feedback
  for select to authenticated using ((select public.is_team()));
create policy "feedback: team deletes" on public.feedback
  for delete to authenticated using ((select public.is_team()));

create policy "scan_stats: team reads" on public.scan_stats
  for select to authenticated using ((select public.is_team()));

-- ---------------------------------------------------------------- Lab (team only)

create table public.test_cases (
  id bigint generated always as identity primary key,
  photo_path text not null,
  kind text not null check (kind in ('menu', 'kiosk', 'label')),
  venue text,
  source text,
  tags text[] not null default '{}',
  created_by uuid references public.profiles (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now()
);

create table public.gt_items (
  id bigint generated always as identity primary key,
  test_case_id bigint not null references public.test_cases (id) on delete cascade,
  text_zh text not null,
  name_en text,
  ingredient_keys text[] not null default '{}',
  violates text[] not null default '{}',
  tags text[] not null default '{}'
);

create table public.runs (
  id bigint generated always as identity primary key,
  approach text not null check (approach in ('A1', 'A2', 'A3', 'lens')),
  config jsonb not null default '{}',
  started_by uuid references public.profiles (id) on delete set null default auth.uid(),
  started_at timestamptz not null default now(),
  notes text
);

create table public.run_results (
  id bigint generated always as identity primary key,
  run_id bigint not null references public.runs (id) on delete cascade,
  test_case_id bigint not null references public.test_cases (id) on delete cascade,
  output jsonb,
  latency_ms int,
  cost_usd numeric(10, 5),
  error text
);

create table public.item_matches (
  id bigint generated always as identity primary key,
  run_result_id bigint not null references public.run_results (id) on delete cascade,
  gt_item_id bigint not null references public.gt_items (id) on delete cascade,
  predicted_index int,
  name_correct boolean
);

-- Anonymous: no user id.
create table public.study_responses (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  consent boolean not null,
  answers jsonb not null default '{}'
);

create index on public.gt_items (test_case_id);
create index on public.run_results (run_id);
create index on public.run_results (test_case_id);
create index on public.item_matches (run_result_id);
create index on public.item_matches (gt_item_id);
create index on public.ingredient_terms (ingredient_key);
create index on public.feedback (user_id);
create index on public.dishes (verified_by);
create index on public.test_cases (created_by);
create index on public.runs (started_by);

alter table public.test_cases enable row level security;
alter table public.gt_items enable row level security;
alter table public.runs enable row level security;
alter table public.run_results enable row level security;
alter table public.item_matches enable row level security;
alter table public.study_responses enable row level security;

create policy "test_cases: team only" on public.test_cases
  for all to authenticated using ((select public.is_team())) with check ((select public.is_team()));
create policy "gt_items: team only" on public.gt_items
  for all to authenticated using ((select public.is_team())) with check ((select public.is_team()));
create policy "runs: team only" on public.runs
  for all to authenticated using ((select public.is_team())) with check ((select public.is_team()));
create policy "run_results: team only" on public.run_results
  for all to authenticated using ((select public.is_team())) with check ((select public.is_team()));
create policy "item_matches: team only" on public.item_matches
  for all to authenticated using ((select public.is_team())) with check ((select public.is_team()));

-- Anyone (also logged out) can submit the study; only the team reads it.
create policy "study_responses: anyone submits" on public.study_responses
  for insert to anon, authenticated with check (consent);
create policy "study_responses: team reads" on public.study_responses
  for select to authenticated using ((select public.is_team()));
