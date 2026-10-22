"use client";

import { useEffect, useState } from "react";
import { FormMessage } from "@/components/auth-shell";
import { s } from "@/lib/strings";
import { createClient } from "@/lib/supabase/client";
import { emailSchema } from "@/lib/validation";

// Seconds before the link can be sent again (Supabase also limits this).
const RESEND_AFTER = 60;

async function sendResetLink(email: string) {
  const { error } = await createClient().auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/confirm?next=/reset-password`,
  });
  return error?.status === 429 ? "tooMany" : "ok";
}

// After sending, the form is replaced by a message with a countdown and a
// resend button. The message is the same whether or not the email has an
// account, so nobody can find out which emails are registered.
export function ForgotForm() {
  const [email, setEmail] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [resent, setResent] = useState(false);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  async function send(address: string, isResend: boolean) {
    setBusy(true);
    setError(null);
    const result = await sendResetLink(address);
    setBusy(false);
    if (result === "tooMany") return setError(s.forgot.tooMany);
    setEmail(address);
    setResent(isResend);
    setSecondsLeft(RESEND_AFTER);
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const parsed = emailSchema.safeParse(new FormData(e.currentTarget).get("email"));
    if (!parsed.success) return setError(s.signup.invalidEmail);
    send(parsed.data, false);
  }

  if (email) {
    return (
      <div className="card animate-slide-up flex flex-col items-center gap-3 py-6 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-light text-3xl" aria-hidden="true">
          ✉️
        </span>
        <h2 className="text-lg font-bold">{s.forgot.sentTitle}</h2>
        <p className="text-sm text-muted" role="status">
          {s.forgot.sent(email)}
        </p>

        {error && <FormMessage kind="error" text={error} />}

        {secondsLeft > 0 ? (
          <p className="mt-2 text-sm font-medium text-muted" aria-live="polite">
            {resent && <span className="block text-ok">{s.forgot.resent}</span>}
            {s.forgot.resendIn(secondsLeft)}
          </p>
        ) : (
          <button type="button" className="btn-secondary mt-2 w-full" disabled={busy} onClick={() => send(email, true)}>
            {busy ? s.common.working : s.forgot.resend}
          </button>
        )}

        <button
          type="button"
          className="link min-h-12 text-sm"
          onClick={() => {
            setEmail(null);
            setError(null);
            setSecondsLeft(0);
          }}
        >
          {s.forgot.otherEmail}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="card flex flex-col gap-3" noValidate>
      <label htmlFor="email" className="label">
        {s.common.emailLabel}
      </label>
      <input id="email" name="email" type="email" required autoComplete="email" inputMode="email" placeholder={s.common.emailPlaceholder} className="input" />
      {error && <FormMessage kind="error" text={error} />}
      <button type="submit" className="btn-primary mt-1" disabled={busy}>
        {busy ? s.common.working : s.forgot.send}
      </button>
    </form>
  );
}
