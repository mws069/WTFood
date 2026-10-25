"use client";

import { BookOpen, ChevronDown, Flag, Info, MessageCircleQuestion, ScanLine } from "lucide-react";
import { useState } from "react";
import type { ScanResponse } from "@/app/api/scan/route";
import { VerdictPill } from "@/components/verdict-pill";
import type { Approach } from "@/lib/scan-schema";
import { s } from "@/lib/strings";
import type { Verdict } from "@/lib/verdict";
import { AskStaffCard, type StaffPhrase } from "./ask-staff";
import { ReportSheet } from "./report-sheet";

type Data = Extract<ScanResponse, { ok: true }>;
type Item = Data["items"][number];
type Filter = "all" | Verdict;

const ORDER: Verdict[] = ["avoid", "check", "ok"];
const CERTAINTY_ORDER = ["listed", "always", "usually", "sometimes"] as const;

export function Results({ data, phrases, onScanAgain }: { data: Data; phrases: StaffPhrase[]; onScanAgain: () => void }) {
  const [filter, setFilter] = useState<Filter>("all");
  // Which card opened the Ask-staff card or the report sheet.
  const [dialog, setDialog] = useState<{ type: "ask" | "report"; item: Item } | null>(null);
  const count = (v: Verdict) => data.items.filter((i) => i.verdict === v).length;
  const sorted = [...data.items].sort((a, b) => ORDER.indexOf(a.verdict) - ORDER.indexOf(b.verdict));
  const shown = filter === "all" ? sorted : sorted.filter((i) => i.verdict === filter);

  return (
    <main className="flex flex-col gap-3 px-4 pt-[calc(1.5rem+env(safe-area-inset-top))]">
      <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight">
        {s.results.title}
        <span className="rounded-full bg-page px-2 py-0.5 text-xs font-semibold text-muted ring-1 ring-line">{data.approach}</span>
      </h1>

      {data.items.length === 0 ? (
        <div className="card py-8 text-center text-muted">{s.results.empty}</div>
      ) : (
        <>
          <p className="card py-3 text-center text-sm font-semibold">
            {s.results.summary(data.items.length, count("ok"), count("check"), count("avoid"))}
          </p>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {(["all", "avoid", "check", "ok"] as Filter[]).map((f) => (
              <button
                key={f}
                type="button"
                aria-pressed={filter === f}
                onClick={() => setFilter(f)}
                className={`min-h-10 shrink-0 rounded-full px-4 text-sm font-semibold ${filter === f ? "bg-ink text-white" : "bg-white ring-1 ring-line"}`}
              >
                {s.results.filters[f]}
                {f !== "all" && ` (${count(f)})`}
              </button>
            ))}
          </div>

          {shown.length === 0 ? (
            <p className="card py-6 text-center text-sm text-muted">{s.results.noneInFilter}</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {shown.map((item, i) => (
                <ResultCard
                  key={`${item.original_text}-${i}`}
                  item={item}
                  index={i}
                  onAsk={() => setDialog({ type: "ask", item })}
                  onReport={() => setDialog({ type: "report", item })}
                />
              ))}
            </ul>
          )}
        </>
      )}

      <p className="px-1 text-xs text-muted">{s.results.disclaimer}</p>

      <button type="button" onClick={onScanAgain} className="btn-primary">
        <ScanLine size={20} /> {s.results.scanAgain}
      </button>
      <p className="text-center text-xs text-muted">{s.results.remaining(data.remaining)}</p>

      {dialog?.type === "ask" && (
        <AskStaffCard
          dish={dialog.item}
          phrases={phrases}
          preferred={dialog.item.reasons.find((r) => r.restriction)?.restriction}
          onClose={() => setDialog(null)}
        />
      )}
      {dialog?.type === "report" && <ReportSheet approach={data.approach as Approach} item={dialog.item} onClose={() => setDialog(null)} />}
    </main>
  );
}

function ResultCard({ item, index, onAsk, onReport }: { item: Item; index: number; onAsk: () => void; onReport: () => void }) {
  const [open, setOpen] = useState(false);
  const ingredients = [...item.ingredients].sort((a, b) => CERTAINTY_ORDER.indexOf(a.certainty) - CERTAINTY_ORDER.indexOf(b.certainty));

  return (
    <li className="card animate-slide-up flex flex-col gap-2" style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}>
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-bold leading-snug">{item.name_en}</p>
          <p className="text-sm text-muted">
            <span lang="zh-HK">{item.original_text}</span>
            {item.jyutping && ` · ${item.jyutping}`}
          </p>
        </div>
        <VerdictPill verdict={item.verdict} />
      </div>

      {item.description_en && <p className="text-sm">{item.description_en}</p>}

      {item.notes && (
        <p className="flex gap-1.5 rounded-xl bg-brand-light px-3 py-2 text-sm text-brand-dark">
          <Info size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
          {item.notes}
        </p>
      )}

      {item.reasons.length > 0 && (
        <ul className="flex flex-col gap-0.5 text-sm">
          {item.reasons.map((r) => (
            <li key={r.text} className={r.level === "avoid" ? "font-semibold text-[#c4142a]" : "text-[#b35c00]"}>
              {r.text}
            </li>
          ))}
        </ul>
      )}

      {ingredients.length > 0 && (
        <>
          <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} className="inline-flex min-h-10 items-center gap-1 self-start text-sm font-semibold text-brand">
            {open ? s.results.hideDetails : s.results.showDetails}
            <ChevronDown size={16} className={`transition ${open ? "rotate-180" : ""}`} />
          </button>
          {open && (
            <div className="rounded-xl bg-page px-3 py-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">{s.results.ingredients}</p>
              <ul className="mt-1 flex flex-col divide-y divide-line text-sm">
                {ingredients.map((ing, i) => (
                  <li key={`${ing.key}-${i}`} className="flex items-center justify-between gap-3 py-1.5">
                    <span className="flex flex-wrap items-center gap-1.5">
                      {ing.name_en}
                      {!ing.verified && (
                        <span className="rounded-full bg-check/15 px-1.5 text-[11px] font-semibold text-[#b35c00]">{s.results.notVerified}</span>
                      )}
                    </span>
                    <span className="shrink-0 text-muted">{s.certainty[ing.certainty]}</span>
                  </li>
                ))}
              </ul>
              {ingredients.some((ing) => !ing.verified) && <p className="mt-1 text-xs text-muted">{s.results.notVerifiedHint}</p>}
              {item.kb_dish && (
                <div className="mt-2 border-t border-line pt-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">{s.results.basedOn}</p>
                  <p className="mt-1 flex flex-wrap items-center gap-1.5 text-sm">
                    <BookOpen size={15} className="text-brand" aria-hidden="true" />
                    <span lang="zh-HK">{item.kb_dish.name_zh}</span> · {item.kb_dish.name_en}
                    {!item.kb_dish.verified && (
                      <span className="rounded-full bg-check/15 px-1.5 text-[11px] font-semibold text-[#b35c00]">{s.results.entryDraft}</span>
                    )}
                  </p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      <div className="flex gap-2 pt-1">
        <button type="button" onClick={onAsk} className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-brand-light px-3.5 text-sm font-semibold text-brand-dark">
          <MessageCircleQuestion size={16} /> {s.results.askStaff}
        </button>
        <button type="button" onClick={onReport} className="inline-flex min-h-10 items-center gap-1.5 rounded-full px-3.5 text-sm font-semibold text-muted ring-1 ring-line">
          <Flag size={15} /> {s.results.report}
        </button>
      </div>
    </li>
  );
}
