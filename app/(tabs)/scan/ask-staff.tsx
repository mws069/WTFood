"use client";

import { Info, X } from "lucide-react";
import { useState } from "react";
import { restrictionByKey } from "@/lib/restrictions";
import { s } from "@/lib/strings";

export type StaffPhrase = { restriction_key: string; text_zh: string; jyutping: string | null; text_en: string; reviewed: boolean };

// Full screen, big Traditional Chinese text to show to the staff. One question
// per restriction; it starts with the restriction that caused the verdict.
export function AskStaffCard({
  dish,
  phrases,
  preferred,
  onClose,
}: {
  dish: { original_text: string; name_en: string };
  phrases: StaffPhrase[];
  preferred: string | undefined;
  onClose: () => void;
}) {
  const [key, setKey] = useState(phrases.find((p) => p.restriction_key === preferred)?.restriction_key ?? phrases[0]?.restriction_key);
  const phrase = phrases.find((p) => p.restriction_key === key);

  return (
    <div role="dialog" aria-modal="true" aria-label={s.askStaff.title} className="fixed inset-0 z-50 overflow-y-auto bg-white">
      <div className="mx-auto flex min-h-full max-w-md flex-col gap-5 px-5 pt-[calc(1rem+env(safe-area-inset-top))] pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-muted">{s.askStaff.title}</p>
          <button type="button" onClick={onClose} aria-label={s.askStaff.close} className="grid size-12 place-items-center rounded-full bg-page">
            <X size={22} />
          </button>
        </div>

        <div className="animate-slide-up">
          <p className="text-sm text-muted">{s.askStaff.dish}</p>
          <p lang="zh-HK" className="text-3xl font-extrabold">
            {dish.original_text}
          </p>
          <p className="text-sm text-muted">{dish.name_en}</p>
        </div>

        {phrase ? (
          <div className="flex flex-1 flex-col justify-center gap-3 rounded-2xl bg-brand-light px-5 py-8 text-center">
            <p lang="zh-HK" className="text-4xl leading-tight font-extrabold text-ink">
              {phrase.text_zh}
            </p>
            {phrase.jyutping && <p className="text-base text-brand-dark">{phrase.jyutping}</p>}
            <p className="text-base font-semibold">{phrase.text_en}</p>
          </div>
        ) : (
          <p className="card text-center text-sm text-muted">{s.askStaff.none}</p>
        )}

        {phrase && !phrase.reviewed && (
          <p className="flex gap-1.5 rounded-xl bg-check/15 px-3 py-2 text-sm text-[#b35c00]">
            <Info size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
            {s.askStaff.notReviewed}
          </p>
        )}

        {phrases.length > 1 && (
          <div>
            <p className="label mb-2">{s.askStaff.chooseQuestion}</p>
            <div className="flex flex-wrap gap-2">
              {phrases.map((p) => (
                <button
                  key={p.restriction_key}
                  type="button"
                  aria-pressed={p.restriction_key === key}
                  onClick={() => setKey(p.restriction_key)}
                  className={`min-h-11 rounded-full px-4 text-sm font-semibold ${p.restriction_key === key ? "bg-ink text-white" : "bg-white ring-1 ring-line"}`}
                >
                  {restrictionByKey(p.restriction_key)?.label ?? p.restriction_key}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
