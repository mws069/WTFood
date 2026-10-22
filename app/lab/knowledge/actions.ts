"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/profile";
import { createClient } from "@/lib/supabase/server";
import { dishSchema, phraseSchema, termSchema } from "@/lib/validation";

type Result = { error: "invalid" | "needsSource" | "duplicate" | "generic" } | { ok: true };

// The team check here gives a clear error; Row Level Security enforces it anyway.
async function teamClient() {
  const profile = await getCurrentProfile();
  if (profile.role !== "team") throw new Error("Team only");
  return { profile, supabase: await createClient() };
}

function dbError(error: { code?: string } | null): Result {
  if (!error) return { ok: true };
  return { error: error.code === "23505" ? "duplicate" : "generic" };
}

// ---------------------------------------------------------------- dishes

export async function saveDish(id: number | null, input: unknown): Promise<Result> {
  const parsed = dishSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues.some((i) => i.message === "needsSource") ? "needsSource" : "invalid" };
  }
  const { profile, supabase } = await teamClient();
  const dish = parsed.data;

  // Remember who verified it; going back to draft clears that.
  let verified_by: string | null = null;
  if (dish.status === "verified") {
    const { data: before } = id ? await supabase.from("dishes").select("status, verified_by").eq("id", id).maybeSingle() : { data: null };
    verified_by = before?.status === "verified" && before.verified_by ? before.verified_by : profile.id;
  }

  const row = { ...dish, verified_by };
  const { data, error } = id
    ? await supabase.from("dishes").update(row).eq("id", id).select("id").single()
    : await supabase.from("dishes").insert(row).select("id").single();
  if (error) return dbError(error);

  revalidatePath("/lab/knowledge/dishes");
  revalidatePath("/lexicon", "layout");
  if (!id) redirect(`/lab/knowledge/dishes/${data.id}`);
  return { ok: true };
}

export async function deleteDish(id: number) {
  const { supabase } = await teamClient();
  const { error } = await supabase.from("dishes").delete().eq("id", id);
  if (error) return dbError(error);
  revalidatePath("/lexicon", "layout");
  redirect("/lab/knowledge/dishes");
}

// ---------------------------------------------------------------- ingredient terms

export async function saveTerm(id: number | null, input: unknown): Promise<Result> {
  const parsed = termSchema.safeParse(input);
  if (!parsed.success) return { error: "invalid" };
  const { supabase } = await teamClient();
  const { error } = id
    ? await supabase.from("ingredient_terms").update(parsed.data).eq("id", id)
    : await supabase.from("ingredient_terms").insert(parsed.data);
  revalidatePath("/lab/knowledge/terms");
  return dbError(error);
}

export async function deleteTerm(id: number): Promise<Result> {
  const { supabase } = await teamClient();
  const { error } = await supabase.from("ingredient_terms").delete().eq("id", id);
  revalidatePath("/lab/knowledge/terms");
  return dbError(error);
}

// ---------------------------------------------------------------- staff phrases

export async function savePhrase(id: number | null, input: unknown): Promise<Result> {
  const parsed = phraseSchema.safeParse(input);
  if (!parsed.success) return { error: "invalid" };
  const { supabase } = await teamClient();
  const { error } = id
    ? await supabase.from("staff_phrases").update(parsed.data).eq("id", id)
    : await supabase.from("staff_phrases").insert(parsed.data);
  revalidatePath("/lab/knowledge/phrases");
  return dbError(error);
}

export async function deletePhrase(id: number): Promise<Result> {
  const { supabase } = await teamClient();
  const { error } = await supabase.from("staff_phrases").delete().eq("id", id);
  revalidatePath("/lab/knowledge/phrases");
  return dbError(error);
}
