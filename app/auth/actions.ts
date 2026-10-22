"use server";

import { revalidatePath } from "next/cache";
import { getCurrentProfile } from "@/lib/profile";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { emailSchema, loginSchema, usernameSchema } from "@/lib/validation";

// Usernames are public inside the app, so telling whether one is free is fine.
export async function isUsernameFree(value: unknown): Promise<boolean | "invalid"> {
  const parsed = usernameSchema.safeParse(value);
  if (!parsed.success) return "invalid";
  const { data } = await createAdminClient().from("profiles").select("id").eq("username", parsed.data).maybeSingle();
  return !data;
}

// Log in with email OR username. A username is resolved to its email on
// the server (with the admin key), so emails are never sent to the browser.
// Wrong username and wrong password give the same message.
export async function signInWithIdentifier(input: unknown): Promise<{ error: "credentials" | "generic" } | { ok: true }> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) return { error: "credentials" };
  const { identifier, password } = parsed.data;

  let email = identifier;
  if (!emailSchema.safeParse(identifier).success) {
    if (!usernameSchema.safeParse(identifier).success) return { error: "credentials" };
    const admin = createAdminClient();
    const { data: profile } = await admin.from("profiles").select("id").eq("username", identifier).maybeSingle();
    if (!profile) return { error: "credentials" };
    const { data } = await admin.auth.admin.getUserById(profile.id);
    if (!data.user?.email) return { error: "credentials" };
    email = data.user.email;
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.code === "invalid_credentials" ? "credentials" : "generic" };
  return { ok: true };
}

export async function saveUsername(value: unknown): Promise<{ error: "invalid" | "taken" | "generic" } | { ok: true; username: string }> {
  const parsed = usernameSchema.safeParse(value);
  if (!parsed.success) return { error: "invalid" };
  const profile = await getCurrentProfile();
  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ username: parsed.data }).eq("id", profile.id);
  if (error) return { error: error.code === "23505" ? "taken" : "generic" };
  revalidatePath("/", "layout");
  return { ok: true, username: parsed.data };
}
