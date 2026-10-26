"use client";

import { Check, Loader2 } from "lucide-react";
import { useState } from "react";
import { FormMessage } from "@/components/auth-shell";
import { CURRENCIES, type CurrencyCode } from "@/lib/currency";
import { s } from "@/lib/strings";
import { setCurrency } from "../actions";

const OPTIONS: (CurrencyCode | null)[] = [null, ...(Object.keys(CURRENCIES) as CurrencyCode[])];

export function CurrencyForm({ current }: { current: CurrencyCode | null }) {
  const [saved, setSaved] = useState(current);
  const [choice, setChoice] = useState(current);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  async function save() {
    setState("saving");
    const { error } = await setCurrency(choice);
    if (error) return setState("error");
    setSaved(choice);
    setState("saved");
  }

  return (
    <>
      <ul className="overflow-hidden rounded-card bg-white" role="radiogroup" aria-label={s.profile.currencyTitle}>
        {OPTIONS.map((code) => (
          <li key={code ?? "none"} className="border-b border-line/70 last:border-0">
            <button
              type="button"
              role="radio"
              aria-checked={choice === code}
              onClick={() => {
                setChoice(code);
                setState("idle");
              }}
              className="flex min-h-12 w-full items-center gap-3 px-4 text-left active:bg-page"
            >
              <span className="w-11 shrink-0 font-semibold">{code ?? "HK$"}</span>
              <span className="flex-1 text-[15px] text-muted">{code ? CURRENCIES[code] : s.profile.currencyNone}</span>
              {choice === code && <Check size={18} className="text-brand" aria-hidden="true" />}
            </button>
          </li>
        ))}
      </ul>
      <div className="sticky bottom-[calc(6rem+env(safe-area-inset-bottom))] flex flex-col gap-2">
        {state === "error" && <FormMessage kind="error" text={s.profile.saveError} />}
        {state === "saved" && <FormMessage kind="info" text={s.profile.saved} />}
        {/* Greyed out until something changed. */}
        <button type="button" onClick={save} disabled={choice === saved || state === "saving"} className="btn-primary">
          {state === "saving" && <Loader2 size={18} className="animate-spin" />}
          {s.profile.save}
        </button>
      </div>
    </>
  );
}
