import { redirect } from "next/navigation";
import { isCurrency, type CurrencyCode } from "@/lib/currency";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type CurrentProfile = {
  id: string;
  email: string;
  username: string | null;
  restrictions: string[];
  healthConsentAt: string | null;
  role: "user" | "team";
  currency: CurrencyCode | null;
};

// The logged-in user's profile. The proxy already sends logged-out visitors
// to /welcome; an account that no longer exists is signed out here.
export async function getCurrentProfile(): Promise<CurrentProfile> {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const id = claims?.claims.sub;
  if (!id) redirect("/welcome");

  let { data: profile } = await supabase
    .from("profiles")
    .select("username, restrictions, health_consent_at, role, currency")
    .eq("id", id)
    .maybeSingle();

  // Account exists but its profile row is missing (e.g. deleted by hand in
  // the dashboard): create an empty one, the user then goes through
  // onboarding again instead of being thrown out.
  if (!profile) {
    const admin = createAdminClient();
    const { data: account } = await admin.auth.admin.getUserById(id);
    if (!account.user) redirect("/auth/signout");
    const { data: created } = await admin
      .from("profiles")
      .upsert({ id }, { onConflict: "id" })
      .select("username, restrictions, health_consent_at, role, currency")
      .single();
    if (!created) redirect("/auth/signout");
    profile = created;
  }

  return {
    id,
    email: String(claims.claims.email ?? ""),
    username: profile.username,
    restrictions: profile.restrictions,
    healthConsentAt: profile.health_consent_at,
    role: profile.role === "team" ? "team" : "user",
    currency: isCurrency(profile.currency) ? profile.currency : null,
  };
}

// Where a user still has to go before using the app, if anywhere.
// (Older accounts may not have a username yet.)
export function onboardingStep(profile: CurrentProfile): string | null {
  if (!profile.username) return "/username";
  if (!profile.healthConsentAt) return "/consent";
  if (profile.restrictions.length === 0) return "/restrictions";
  return null;
}
