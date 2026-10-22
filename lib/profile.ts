import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type CurrentProfile = {
  id: string;
  email: string;
  username: string | null;
  restrictions: string[];
  healthConsentAt: string | null;
  role: "user" | "team";
};

// The logged-in user's profile. The proxy already sends logged-out visitors
// to /welcome; an account that no longer exists is signed out here.
export async function getCurrentProfile(): Promise<CurrentProfile> {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const id = claims?.claims.sub;
  if (!id) redirect("/welcome");

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, restrictions, health_consent_at, role")
    .eq("id", id)
    .maybeSingle();
  if (!profile) redirect("/auth/signout");

  return {
    id,
    email: String(claims.claims.email ?? ""),
    username: profile.username,
    restrictions: profile.restrictions,
    healthConsentAt: profile.health_consent_at,
    role: profile.role === "team" ? "team" : "user",
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
