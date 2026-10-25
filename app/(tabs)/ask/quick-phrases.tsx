"use client";

import { ChevronRight } from "lucide-react";
import { useState } from "react";
import { s } from "@/lib/strings";
import { FullScreen, NotReviewedNote, PhraseBig, type Phrase } from "./phrase";

export type StaffPhrase = Phrase & { restriction_key: string; reviewed: boolean };

// Ready-made questions: tap one to show it full screen.
export function QuickPhrases({ groups }: { groups: { title: string; phrases: StaffPhrase[] }[] }) {
  const [open, setOpen] = useState<StaffPhrase | null>(null);

  return (
    <section className="flex flex-col gap-2">
      <h2 className="px-1 text-[17px] font-bold">{s.translator.quickPhrases}</h2>
      {groups
        .filter((g) => g.phrases.length > 0)
        .map((group) => (
          <div key={group.title} className="card p-0">
            <p className="px-4 pt-3 text-xs font-semibold uppercase tracking-wide text-muted">{group.title}</p>
            <ul className="divide-y divide-line">
              {group.phrases.map((p) => (
                <li key={`${p.restriction_key}-${p.text_zh}`}>
                  <button type="button" onClick={() => setOpen(p)} className="flex min-h-14 w-full items-center gap-3 px-4 py-2.5 text-left">
                    <span className="min-w-0 flex-1">
                      <span lang="zh-HK" className="block font-bold">
                        {p.text_zh}
                      </span>
                      <span className="block text-sm text-muted">{p.text_en}</span>
                    </span>
                    <ChevronRight size={18} className="shrink-0 text-muted" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}

      {open && (
        <FullScreen title={s.askStaff.title} onClose={() => setOpen(null)}>
          <PhraseBig phrase={open} />
          {!open.reviewed && <NotReviewedNote />}
        </FullScreen>
      )}
    </section>
  );
}
