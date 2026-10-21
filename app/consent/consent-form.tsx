"use client";

import { useState, useTransition } from "react";
import { FormMessage } from "@/components/auth-shell";
import { s } from "@/lib/strings";
import { giveConsent } from "./actions";

export function ConsentForm() {
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-col gap-4">
      {/* Unticked by default, as required for explicit consent. */}
      <label className="card flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-0.5 h-6 w-6 shrink-0 accent-brand"
        />
        <span className="text-sm">{s.consent.checkbox}</span>
      </label>

      {error && <FormMessage kind="error" text={s.common.errorGeneric} />}

      <button
        type="button"
        className="btn-primary"
        disabled={!agreed || pending}
        onClick={() =>
          startTransition(async () => {
            const result = await giveConsent();
            if (result?.error) setError(true);
          })
        }
      >
        {pending ? s.common.working : s.consent.submit}
      </button>
    </div>
  );
}
