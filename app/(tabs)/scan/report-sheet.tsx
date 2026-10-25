"use client";

import { CircleCheck, Loader2 } from "lucide-react";
import { useState } from "react";
import { FormMessage } from "@/components/auth-shell";
import type { Approach } from "@/lib/scan-schema";
import { s } from "@/lib/strings";
import type { Verdict } from "@/lib/verdict";
import { reportMistake } from "./actions";

// "Report mistake": a bottom sheet with an optional comment.
export function ReportSheet({
  approach,
  item,
  onClose,
}: {
  approach: Approach;
  item: { original_text: string; name_en: string; verdict: Verdict };
  onClose: () => void;
}) {
  const [comment, setComment] = useState("");
  const [state, setState] = useState<"edit" | "sending" | "sent" | "error">("edit");

  async function send() {
    setState("sending");
    const { error } = await reportMistake({ approach, itemText: item.original_text, verdict: item.verdict, comment });
    setState(error ? "error" : "sent");
  }

  return (
    <div role="dialog" aria-modal="true" aria-label={s.report.title} className="fixed inset-0 z-50 flex items-end bg-black/40" onClick={onClose}>
      <div
        className="animate-slide-up mx-auto flex w-full max-w-md flex-col gap-3 rounded-t-3xl bg-white px-5 pt-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-extrabold">{s.report.title}</h2>
        {state === "sent" ? (
          <>
            <p className="flex items-center gap-2 text-sm font-semibold text-[#007a55]">
              <CircleCheck size={18} /> {s.report.thanks}
            </p>
            <button type="button" onClick={onClose} className="btn-secondary">
              {s.askStaff.close}
            </button>
          </>
        ) : (
          <>
            <p className="text-sm text-muted">{s.report.intro(`${item.name_en} · ${item.original_text}`)}</p>
            <label className="label" htmlFor="report-comment">
              {s.report.commentLabel}
            </label>
            <textarea
              id="report-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={1000}
              rows={3}
              placeholder={s.report.commentPlaceholder}
              className="input min-h-24 py-3"
            />
            {state === "error" && <FormMessage kind="error" text={s.report.error} />}
            <button type="button" onClick={send} disabled={state === "sending"} className="btn-primary">
              {state === "sending" && <Loader2 size={18} className="animate-spin" />}
              {s.report.send}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary">
              {s.report.cancel}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
