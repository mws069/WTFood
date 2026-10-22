"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { saveUsername } from "@/app/auth/actions";
import { UsernameField } from "@/components/username-field";
import { s } from "@/lib/strings";

const ERRORS = { invalid: s.signup.usernameInvalid, taken: s.signup.usernameTaken, generic: s.common.errorGeneric };

// Used in onboarding (then continues to "/") and under Profile → Account.
export function UsernameForm({ initial, onboarding }: { initial: string; onboarding: boolean }) {
  const router = useRouter();
  const [value, setValue] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          const result = await saveUsername(value);
          if ("error" in result) return setError(ERRORS[result.error]);
          setSaved(result.username);
          setDone(true);
          if (onboarding) {
            router.replace("/");
            router.refresh();
          }
        });
      }}
    >
      <UsernameField
        value={value}
        onChange={(v) => {
          setValue(v);
          setError(null);
          setDone(false);
        }}
        error={error}
      />
      <button type="submit" className="btn-primary" disabled={pending || value.length < 3 || (!onboarding && value === saved)}>
        {pending ? s.common.working : onboarding ? s.username.submit : s.common.save}
      </button>
      {done && !onboarding && (
        <p className="text-xs text-ok" role="status">
          {s.username.saved}
        </p>
      )}
    </form>
  );
}
