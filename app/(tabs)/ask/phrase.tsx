"use client";

import { Info, X } from "lucide-react";
import type { ReactNode } from "react";
import { s } from "@/lib/strings";

export type Phrase = { text_zh: string; jyutping: string | null; text_en: string };

// Big Traditional Chinese text to show to the staff, Jyutping and English below.
export function PhraseBig({ phrase, size = "lg" }: { phrase: Phrase; size?: "md" | "lg" }) {
  return (
    <div className="flex flex-col justify-center gap-2 rounded-2xl bg-brand-light px-5 py-6 text-center">
      <p lang="zh-HK" className={`leading-tight font-extrabold text-ink ${size === "lg" ? "text-4xl" : "text-2xl"}`}>
        {phrase.text_zh}
      </p>
      {phrase.jyutping && <p className="text-sm text-brand-dark">{phrase.jyutping}</p>}
      <p className="text-sm font-semibold">{phrase.text_en}</p>
    </div>
  );
}

export function NotReviewedNote() {
  return (
    <p className="flex gap-1.5 rounded-xl bg-check/15 px-3 py-2 text-sm text-[#b35c00]">
      <Info size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
      {s.askStaff.notReviewed}
    </p>
  );
}

// Full screen, so the staff can read it from across the counter.
export function FullScreen({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div role="dialog" aria-modal="true" aria-label={title} className="fixed inset-0 z-50 overflow-y-auto bg-white">
      <div className="mx-auto flex min-h-full max-w-md flex-col gap-5 px-5 pt-[calc(1rem+env(safe-area-inset-top))] pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-muted">{title}</p>
          <button type="button" onClick={onClose} aria-label={s.askStaff.close} className="grid size-12 place-items-center rounded-full bg-page">
            <X size={22} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
