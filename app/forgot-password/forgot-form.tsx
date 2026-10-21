"use client";

import { useState } from "react";
import { FormMessage } from "@/components/auth-shell";
import { s } from "@/lib/strings";
import { createClient } from "@/lib/supabase/client";
import { emailSchema } from "@/lib/validation";

// Always shows the same message after sending, so nobody can find out
// which emails have an account.
export function ForgotForm() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: "error" | "info"; text: string } | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const parsed = emailSchema.safeParse(new FormData(e.currentTarget).get("email"));
    if (!parsed.success) return setMessage({ kind: "error", text: s.common.errorGeneric });

    setBusy(true);
    setMessage(null);
    const { error } = await createClient().auth.resetPasswordForEmail(parsed.data, {
      redirectTo: `${window.location.origin}/auth/confirm?next=/reset-password`,
    });
    setBusy(false);
    setMessage(error?.status === 429 ? { kind: "error", text: s.forgot.tooMany } : { kind: "info", text: s.forgot.sent });
  }

  return (
    <form onSubmit={onSubmit} className="card flex flex-col gap-3" noValidate>
      <label htmlFor="email" className="label">
        {s.common.emailLabel}
      </label>
      <input id="email" name="email" type="email" required autoComplete="email" inputMode="email" placeholder={s.common.emailPlaceholder} className="input" />
      {message && <FormMessage {...message} />}
      <button type="submit" className="btn-primary mt-1" disabled={busy}>
        {busy ? s.common.working : s.forgot.send}
      </button>
    </form>
  );
}
