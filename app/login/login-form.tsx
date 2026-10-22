"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FormMessage } from "@/components/auth-shell";
import { s } from "@/lib/strings";
import { createClient } from "@/lib/supabase/client";
import { loginSchema } from "@/lib/validation";

export function LoginForm() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const parsed = loginSchema.safeParse({ email: form.get("email"), password: form.get("password") });
    if (!parsed.success) return setError(s.login.wrongCredentials);

    setBusy(true);
    setError(null);
    const { error } = await createClient().auth.signInWithPassword(parsed.data);
    if (error) {
      setBusy(false);
      return setError(error.code === "invalid_credentials" ? s.login.wrongCredentials : s.common.errorGeneric);
    }
    router.replace("/");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="card flex flex-col gap-3" noValidate>
      <label htmlFor="email" className="label">
        {s.common.emailLabel}
      </label>
      <input id="email" name="email" type="email" required autoComplete="email" inputMode="email" placeholder={s.common.emailPlaceholder} className="input" />

      <label htmlFor="password" className="label mt-1">
        {s.common.passwordLabel}
      </label>
      <input id="password" name="password" type="password" required autoComplete="current-password" className="input" />

      {error && <FormMessage kind="error" text={error} />}

      <button type="submit" className="btn-primary mt-1" disabled={busy}>
        {busy ? s.common.working : s.login.submit}
      </button>
    </form>
  );
}
