"use client";

import { useState, useTransition } from "react";
import { FormMessage } from "@/components/auth-shell";
import { RestrictionIcon } from "@/components/restriction-icon";
import { RESTRICTION_GROUPS, RESTRICTIONS } from "@/lib/restrictions";
import { s } from "@/lib/strings";
import { saveRestrictions } from "./actions";

// Chip grid grouped like the brief; at least one choice is required.
export function RestrictionsPicker({ initial, onboarding }: { initial: string[]; onboarding: boolean }) {
  const [selected, setSelected] = useState<string[]>(initial);
  // When editing, Save stays greyed out until the selection changes.
  const unchanged = !onboarding && [...selected].sort().join() === [...initial].sort().join();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function toggle(key: string) {
    setError(null);
    setSelected((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  }

  function submit() {
    if (selected.length === 0) return setError(s.restrictions.minOne);
    startTransition(async () => {
      const result = await saveRestrictions(selected, onboarding);
      if (result?.error) setError(result.error === "min" ? s.restrictions.minOne : s.common.errorGeneric);
    });
  }

  return (
    <>
      <div className="mt-6 flex flex-col gap-6 pb-28">
        {RESTRICTION_GROUPS.map((group) => (
          <fieldset key={group.key}>
            <legend className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">{group.label}</legend>
            <div className="flex flex-wrap gap-2">
              {RESTRICTIONS.filter((r) => r.group === group.key).map((r) => {
                const on = selected.includes(r.key);
                return (
                  <button
                    key={r.key}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggle(r.key)}
                    className={`inline-flex min-h-12 items-center gap-2 rounded-full border-2 pl-2.5 pr-4 text-sm font-semibold transition active:scale-[0.97] ${
                      on ? "border-brand bg-brand-light text-brand-dark" : "border-transparent bg-white text-ink"
                    }`}
                  >
                    <RestrictionIcon restrictionKey={r.key} size="xs" />
                    {r.label}
                  </button>
                );
              })}
            </div>
          </fieldset>
        ))}
      </div>

      {/* Sticky footer with the count and the save button. */}
      <div className="fixed inset-x-0 bottom-0 z-10 mx-auto max-w-md border-t border-line bg-white/95 px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur">
        {error && (
          <div className="mb-2">
            <FormMessage kind="error" text={error} />
          </div>
        )}
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted" aria-live="polite">
            {s.restrictions.selected(selected.length)}
          </span>
          <button type="button" onClick={submit} disabled={pending || unchanged} className="btn-primary flex-1">
            {pending ? s.common.working : onboarding ? s.restrictions.submit : s.common.save}
          </button>
        </div>
      </div>
    </>
  );
}
