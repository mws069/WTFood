"use client";

import { useState } from "react";
import { FormMessage } from "@/components/auth-shell";
import { s } from "@/lib/strings";
import { createClient } from "@/lib/supabase/client";

type Provider = "google" | "apple";

// Which providers to show, e.g. "google" or "google,apple". Apple needs an
// Apple Developer account, so it is off until it is set up in Supabase.
const ENABLED = (process.env.NEXT_PUBLIC_AUTH_PROVIDERS || "google")
  .split(",")
  .map((p) => p.trim())
  .filter((p): p is Provider => p === "google" || p === "apple");

function GoogleLogo() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

function AppleLogo() {
  return (
    <svg width="18" height="20" viewBox="0 0 17 20" fill="currentColor" aria-hidden="true">
      <path d="M14.1 10.6c0-2.6 2.1-3.8 2.2-3.9-1.2-1.8-3.1-2-3.7-2-1.6-.2-3.1.9-3.9.9-.8 0-2-.9-3.4-.9C3.6 4.8 1.9 5.8 1 7.4c-1.9 3.3-.5 8.1 1.3 10.8.9 1.3 2 2.7 3.4 2.7 1.4-.1 1.9-.9 3.5-.9s2.1.9 3.5.9c1.5 0 2.4-1.3 3.3-2.6 1-1.5 1.4-2.9 1.5-3-.1 0-2.8-1.1-2.9-4.3zM11.5 3c.7-.9 1.2-2.1 1.1-3.3-1 0-2.3.7-3 1.6-.7.8-1.2 2-1.1 3.2 1.2.1 2.3-.6 3-1.5z" />
    </svg>
  );
}

// "Continue with Google / Apple". After the provider, the user comes back to
// /auth/confirm, which signs them in; new users then pick a username,
// give consent and choose their restrictions.
export function OAuthButtons() {
  const [busy, setBusy] = useState<Provider | null>(null);
  const [error, setError] = useState(false);
  if (ENABLED.length === 0) return null;

  async function signIn(provider: Provider) {
    setBusy(provider);
    setError(false);
    const { error } = await createClient().auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/confirm?next=/` },
    });
    if (error) {
      setBusy(null);
      setError(true);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3 text-xs font-medium uppercase tracking-wide text-muted">
        <span className="h-px flex-1 bg-line" />
        {s.oauth.or}
        <span className="h-px flex-1 bg-line" />
      </div>
      {ENABLED.includes("apple") && (
        <button type="button" onClick={() => signIn("apple")} disabled={busy !== null} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-black px-6 font-semibold text-white disabled:opacity-60">
          <AppleLogo /> {busy === "apple" ? s.common.working : s.oauth.apple}
        </button>
      )}
      {ENABLED.includes("google") && (
        <button type="button" onClick={() => signIn("google")} disabled={busy !== null} className="inline-flex min-h-12 items-center justify-center gap-3 rounded-full border border-line bg-white px-6 font-semibold text-ink disabled:opacity-60">
          <GoogleLogo /> {busy === "google" ? s.common.working : s.oauth.google}
        </button>
      )}
      {error && <FormMessage kind="error" text={s.login.oauthError} />}
    </div>
  );
}
