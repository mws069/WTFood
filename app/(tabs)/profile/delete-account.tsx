"use client";

import { useState, useTransition } from "react";
import { FormMessage } from "@/components/auth-shell";
import { s } from "@/lib/strings";
import { deleteAccount } from "./actions";

// Two steps on purpose: first reveal the warning, then confirm.
export function DeleteAccount() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <section className="card mb-4 flex flex-col gap-3">
      <h2 className="font-bold">{s.profile.deleteTitle}</h2>
      <p className="text-sm text-muted">{s.profile.deleteText}</p>
      {error && <FormMessage kind="error" text={s.common.errorGeneric} />}
      {open ? (
        <div className="flex gap-2">
          <button type="button" className="btn-secondary flex-1" onClick={() => setOpen(false)} disabled={pending}>
            {s.common.cancel}
          </button>
          <button
            type="button"
            className="btn-danger flex-1"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                const result = await deleteAccount();
                if (result?.error) setError(true);
              })
            }
          >
            {pending ? s.common.working : s.profile.deleteConfirm}
          </button>
        </div>
      ) : (
        <button type="button" className="min-h-12 rounded-full border border-avoid font-semibold text-avoid" onClick={() => setOpen(true)}>
          {s.profile.deleteButton}
        </button>
      )}
    </section>
  );
}
