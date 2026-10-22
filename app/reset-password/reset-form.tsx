"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FormMessage } from "@/components/auth-shell";
import { s } from "@/lib/strings";
import { createClient } from "@/lib/supabase/client";
import { passwordSchema } from "@/lib/validation";

export function ResetForm() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const password = String(form.get("password"));
    if (!passwordSchema.safeParse(password).success) return setError(s.signup.weakPassword);
    if (password !== String(form.get("repeat"))) return setError(s.reset.mismatch);

    setBusy(true);
    setError(null);
    const { error } = await createClient().auth.updateUser({ password });
    if (error) {
      setBusy(false);
      return setError(error.code === "same_password" ? s.reset.sameAsOld : s.common.errorGeneric);
    }
    router.replace("/");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="card flex flex-col gap-3" noValidate>
      <label htmlFor="password" className="label">
        {s.reset.newPassword}
      </label>
      <input id="password" name="password" type="password" required minLength={8} autoComplete="new-password" aria-describedby="password-hint" className="input" />
      <p id="password-hint" className="-mt-1 text-xs text-muted">
        {s.common.passwordHint}
      </p>

      <label htmlFor="repeat" className="label mt-1">
        {s.reset.repeat}
      </label>
      <input id="repeat" name="repeat" type="password" required minLength={8} autoComplete="new-password" className="input" />

      {error && <FormMessage kind="error" text={error} />}

      <button type="submit" className="btn-primary mt-1" disabled={busy}>
        {busy ? s.common.working : s.reset.submit}
      </button>
    </form>
  );
}
