"use server";

import { redirect } from "next/navigation";
import { isCurrency } from "@/lib/currency";
import { getCurrentProfile } from "@/lib/profile";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

// Deletes the auth account; the profile (and later all other rows that
// belong to the user) are removed by "on delete cascade".
export async function deleteAccount() {
  const profile = await getCurrentProfile();
  const { error } = await createAdminClient().auth.admin.deleteUser(profile.id);
  if (error) return { error: true };

  const supabase = await createClient();
  // The account is gone already, so only clear the cookies here.
  await supabase.auth.signOut({ scope: "local" });
  redirect("/welcome?deleted=1");
}

// Currency for converted menu prices (null = only HK$).
export async function setCurrency(code: string | null) {
  if (code !== null && !isCurrency(code)) return { error: true };
  const profile = await getCurrentProfile();
  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ currency: code }).eq("id", profile.id);
  return { error: Boolean(error) };
}
