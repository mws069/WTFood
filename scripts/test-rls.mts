// Checks Row Level Security for a logged-out visitor, a normal user and a
// team member. Creates throwaway accounts and deletes them afterwards.
// Usage: npm run db:test-rls
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const publishable = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
const admin = createClient(url, process.env.SUPABASE_SECRET_KEY!, { auth: { persistSession: false } });

let failed = 0;
let passed = 0;
function expect(name: string, ok: boolean, detail = "") {
  if (ok) passed++;
  else failed++;
  console.log(`${ok ? "✓" : "✗"} ${name}${!ok && detail ? ` (${detail})` : ""}`);
}

const stamp = Date.now();
const password = `Rls-${stamp}-test`;
const created: string[] = [];

async function makeUser(label: string, team: boolean): Promise<{ id: string; client: SupabaseClient }> {
  const email = `rls-${label}-${stamp}@wtfood.test`;
  const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
  if (error) throw error;
  created.push(data.user.id);
  await admin
    .from("profiles")
    .update({ role: team ? "team" : "user", health_consent_at: new Date().toISOString(), restrictions: ["peanut"] })
    .eq("id", data.user.id);
  const client = createClient(url, publishable, { auth: { persistSession: false } });
  const { error: signInError } = await client.auth.signInWithPassword({ email, password });
  if (signInError) throw signInError;
  return { id: data.user.id, client };
}

const blocked = (r: { error: unknown; data: unknown }) => r.error !== null || (Array.isArray(r.data) && r.data.length === 0);

try {
  const anon = createClient(url, publishable, { auth: { persistSession: false } });
  const user = await makeUser("user", false);
  const team = await makeUser("team", true);

  // A verified dish and a reviewed phrase so "users see verified only" can be tested.
  const { data: verifiedDish } = await admin
    .from("dishes")
    .insert({ name_zh: `測試${stamp}`, name_en: "RLS test dish", status: "verified", source_url: "https://example.com" })
    .select("id")
    .single();
  const { data: reviewedPhrase } = await admin
    .from("staff_phrases")
    .insert({ restriction_key: "peanut", text_zh: `測試${stamp}`, text_en: "RLS test", reviewed: true })
    .select("id")
    .single();

  console.log("\nLogged-out visitor");
  for (const table of ["profiles", "ingredients", "ingredient_terms", "dishes", "staff_phrases", "feedback", "scan_stats", "test_cases", "gt_items", "runs", "run_results", "item_matches", "study_responses"] as const) {
    const r = await anon.from(table).select("*").limit(1);
    expect(`cannot read ${table}`, blocked(r));
  }
  expect("cannot write dishes", blocked(await anon.from("dishes").insert({ name_zh: "x", name_en: "x" }).select()));
  expect("can submit the study (with consent)", (await anon.from("study_responses").insert({ consent: true, answers: {} })).error === null);
  expect("cannot submit the study without consent", (await anon.from("study_responses").insert({ consent: false, answers: {} })).error !== null);

  console.log("\nNormal user");
  const u = user.client;
  expect("reads only own profile", ((await u.from("profiles").select("id")).data ?? []).length === 1);
  expect("cannot make itself team", (await u.from("profiles").update({ role: "team" }).eq("id", user.id)).error !== null);
  expect("reads ingredients", ((await u.from("ingredients").select("key").limit(5)).data ?? []).length > 0);
  expect("reads ingredient terms", ((await u.from("ingredient_terms").select("id").limit(5)).data ?? []).length > 0);
  const userDishes = (await u.from("dishes").select("status")).data ?? [];
  expect("reads verified dishes", userDishes.length > 0);
  expect("sees no draft dishes", userDishes.every((d) => d.status === "verified"));
  const userPhrases = (await u.from("staff_phrases").select("reviewed")).data ?? [];
  expect("sees only reviewed phrases", userPhrases.length > 0 && userPhrases.every((p) => p.reviewed));
  expect("cannot add dishes", blocked(await u.from("dishes").insert({ name_zh: "x", name_en: "x" }).select()));
  expect("cannot edit dishes", blocked(await u.from("dishes").update({ name_en: "hacked" }).eq("id", verifiedDish!.id).select()));
  expect("cannot delete dishes", blocked(await u.from("dishes").delete().eq("id", verifiedDish!.id).select()));
  expect("cannot add ingredient terms", blocked(await u.from("ingredient_terms").insert({ term_zh: "x", ingredient_key: "rice" }).select()));
  expect("cannot change ingredients", blocked(await u.from("ingredients").update({ label_en: "x" }).eq("key", "rice").select()));
  expect("can send own feedback", (await u.from("feedback").insert({ user_id: user.id, comment: "RLS test" })).error === null);
  expect("cannot send feedback as someone else", (await u.from("feedback").insert({ user_id: team.id, comment: "x" })).error !== null);
  expect("cannot read feedback", ((await u.from("feedback").select("id")).data ?? []).length === 0);
  expect("cannot write scan stats", (await u.from("scan_stats").insert({ approach: "A2" })).error !== null);
  for (const table of ["test_cases", "gt_items", "runs", "run_results", "item_matches", "study_responses"] as const) {
    expect(`cannot read ${table}`, ((await u.from(table).select("id")).data ?? []).length === 0);
  }
  expect("cannot add test cases", blocked(await u.from("test_cases").insert({ photo_path: "x", kind: "menu" }).select()));

  console.log("\nTeam member");
  const t = team.client;
  expect("reads all profiles (names for the Lab)", ((await t.from("profiles").select("id")).data ?? []).length >= 2);
  expect("cannot change another profile", blocked(await t.from("profiles").update({ display_name: "x" }).eq("id", user.id).select()));
  expect("sees draft dishes", ((await t.from("dishes").select("id").eq("status", "draft").limit(1)).data ?? []).length > 0);
  const added = await t.from("dishes").insert({ name_zh: `草稿${stamp}`, name_en: "RLS draft" }).select("id").single();
  expect("adds a dish", added.error === null);
  expect("cannot verify without source", (await t.from("dishes").update({ status: "verified" }).eq("id", added.data!.id)).error !== null);
  expect("edits a dish", !blocked(await t.from("dishes").update({ name_en: "RLS draft 2" }).eq("id", added.data!.id).select()));
  expect("deletes a dish", !blocked(await t.from("dishes").delete().eq("id", added.data!.id).select()));
  const term = await t.from("ingredient_terms").insert({ term_zh: `測${stamp}`, ingredient_key: "rice" }).select("id").single();
  expect("adds an ingredient term", term.error === null);
  if (term.data) await t.from("ingredient_terms").delete().eq("id", term.data.id);
  expect("sees unreviewed phrases", ((await t.from("staff_phrases").select("id").eq("reviewed", false).limit(1)).data ?? []).length > 0);
  expect("reads feedback", ((await t.from("feedback").select("id")).data ?? []).length > 0);
  const tc = await t.from("test_cases").insert({ photo_path: "rls/test.jpg", kind: "menu" }).select("id, created_by").single();
  expect("adds a test case (created_by = self)", tc.error === null && tc.data?.created_by === team.id);
  if (tc.data) {
    expect("adds a ground-truth item", (await t.from("gt_items").insert({ test_case_id: tc.data.id, text_zh: "花生" })).error === null);
    await t.from("test_cases").delete().eq("id", tc.data.id);
  }
  expect("reads study responses", ((await t.from("study_responses").select("id")).data ?? []).length > 0);

  // Clean up test rows.
  await admin.from("dishes").delete().eq("id", verifiedDish!.id);
  await admin.from("staff_phrases").delete().eq("id", reviewedPhrase!.id);
  await admin.from("study_responses").delete().eq("answers", {});
} finally {
  for (const id of created) await admin.auth.admin.deleteUser(id);
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
