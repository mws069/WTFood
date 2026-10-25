-- Team decision (milestone 6): until a native speaker has reviewed the
-- Ask-staff phrases, users see all of them; the app marks unreviewed ones
-- with "not yet checked by a native speaker".
drop policy "staff_phrases: read reviewed, team reads all" on public.staff_phrases;
create policy "staff_phrases: logged in read" on public.staff_phrases
  for select to authenticated using (true);
