"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FormMessage } from "@/components/auth-shell";
import { s } from "@/lib/strings";
import { createClient } from "@/lib/supabase/client";
import { signupSchema } from "@/lib/validation";

export function SignupForm() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: "error" | "info"; text: string } | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const parsed = signupSchema.safeParse({
      nickname: form.get("nickname"),
      email: form.get("email"),
      password: form.get("password"),
    });
    if (!parsed.success) {
      const field = parsed.error.issues[0]?.path[0];
      return setMessage({ kind: "error", text: field === "password" ? s.signup.weakPassword : s.signup.invalidEmail });
    }

    setBusy(true);
    setMessage(null);
    const { nickname, email, password } = parsed.data;
    const { data, error } = await createClient().auth.signUp({
      email,
      password,
      options: {
        data: { display_name: nickname },
        emailRedirectTo: `${window.location.origin}/auth/confirm?next=/consent`,
      },
    });

    if (error) {
      setBusy(false);
      if (error.code === "user_already_exists") return setMessage({ kind: "error", text: s.signup.emailTaken });
      if (error.code === "email_address_invalid") return setMessage({ kind: "error", text: s.signup.invalidEmail });
      if (error.code === "weak_password") return setMessage({ kind: "error", text: s.signup.weakPassword });
      if (error.status === 429) return setMessage({ kind: "error", text: s.signup.tooMany });
      return setMessage({ kind: "error", text: s.common.errorGeneric });
    }

    // With "Confirm email" switched on in Supabase there is no session yet.
    if (!data.session) {
      setBusy(false);
      return setMessage({ kind: "info", text: s.signup.confirmEmail });
    }

    router.replace("/consent");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="card flex flex-col gap-3" noValidate>
      <label htmlFor="nickname" className="label">
        {s.signup.nicknameLabel}
      </label>
      <input id="nickname" name="nickname" type="text" maxLength={40} autoComplete="nickname" placeholder={s.signup.nicknamePlaceholder} className="input" />

      <label htmlFor="email" className="label mt-1">
        {s.common.emailLabel}
      </label>
      <input id="email" name="email" type="email" required autoComplete="email" inputMode="email" placeholder={s.common.emailPlaceholder} className="input" />

      <label htmlFor="password" className="label mt-1">
        {s.common.passwordLabel}
      </label>
      <input id="password" name="password" type="password" required minLength={8} autoComplete="new-password" aria-describedby="password-hint" className="input" />
      <p id="password-hint" className="-mt-1 text-xs text-muted">
        {s.common.passwordHint}
      </p>

      {message && <FormMessage {...message} />}

      <button type="submit" className="btn-primary mt-1" disabled={busy}>
        {busy ? s.common.working : s.signup.submit}
      </button>
    </form>
  );
}
