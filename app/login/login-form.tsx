"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { signInWithIdentifier } from "@/app/auth/actions";
import { FormMessage } from "@/components/auth-shell";
import { s } from "@/lib/strings";

export function LoginForm() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setBusy(true);
    setError(null);
    const result = await signInWithIdentifier({ identifier: form.get("identifier"), password: form.get("password") });
    if ("error" in result) {
      setBusy(false);
      return setError(result.error === "credentials" ? s.login.wrongCredentials : s.common.errorGeneric);
    }
    router.replace("/");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="card flex flex-col gap-3" noValidate>
      <label htmlFor="identifier" className="label">
        {s.login.identifierLabel}
      </label>
      <input
        id="identifier"
        name="identifier"
        type="text"
        required
        autoComplete="username"
        autoCapitalize="none"
        spellCheck={false}
        placeholder={s.login.identifierPlaceholder}
        className="input"
      />

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
