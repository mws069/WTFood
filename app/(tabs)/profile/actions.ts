"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/profile";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { nicknameSchema } from "@/lib/validation";

export async function saveNickname(value: unknown) {
  const parsed = nicknameSchema.safeParse(value);
  if (!parsed.success) return { error: true as const };

  const profile = await getCurrentProfile();
  const supabase = await createClient();
  const nickname = parsed.data;
  const { error } = await supabase
    .from("profiles")
    .update({ display_name: nickname || null })
    .eq("id", profile.id);
  if (error) return { error: true as const };

  revalidatePath("/", "layout");
  return { error: false as const, nickname };
}

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
