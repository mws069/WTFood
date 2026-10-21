"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/profile";
import { createClient } from "@/lib/supabase/server";
import { restrictionsSchema } from "@/lib/validation";

export async function saveRestrictions(keys: unknown, onboarding: boolean) {
  const parsed = restrictionsSchema.safeParse(keys);
  if (!parsed.success) return { error: "min" as const };

  const profile = await getCurrentProfile();
  if (!profile.healthConsentAt) redirect("/consent");

  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ restrictions: parsed.data }).eq("id", profile.id);
  if (error) return { error: "generic" as const };

  revalidatePath("/", "layout");
  redirect(onboarding ? "/" : "/profile");
}
