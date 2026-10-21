"use server";

import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/profile";
import { createClient } from "@/lib/supabase/server";

export async function giveConsent() {
  const profile = await getCurrentProfile();
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ health_consent_at: new Date().toISOString() })
    .eq("id", profile.id);
  if (error) return { error: true };
  redirect("/restrictions?onboarding=1");
}
