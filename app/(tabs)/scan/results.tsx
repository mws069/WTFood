"use client";

import { BookOpen, ChevronDown, Flag, Info, Loader2, MessageCircleQuestion, Minus, Plus, ScanLine, ShoppingBag, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { ResultItem } from "@/app/api/scan/route";
import { DishCategoryChip } from "@/components/dish-category-chip";
import { PriceTag } from "@/components/price-tag";
import { VerdictPill } from "@/components/verdict-pill";
import { priceNumber, type Rate } from "@/lib/currency";
import type { CustomRequest, OrderOption } from "@/lib/order";
import { restrictionByKey } from "@/lib/restrictions";
import type { Approach, Kind } from "@/lib/scan-schema";
import { s } from "@/lib/strings";
import type { Verdict } from "@/lib/verdict";
import { AskStaffCard, type StaffPhrase } from "./ask-staff";
import { OrderSheet } from "./order-sheet";
import { ReportSheet } from "./report-sheet";

// What the scan screen has received so far (the dishes arrive one by one).
export type ResultData = {
  items: ResultItem[];
  approach: Approach;
  kind: Kind | null;
  remaining: number | null;
  rate: Rate | null;
  streaming: boolean;
  failed: boolean;
};
type Filter = "all" | Verdict;
export type Order = Map<number, { qty: number; options: OrderOption[]; custom: CustomRequest[] }>;

const CERTAINTY_ORDER = ["listed", "always", "usually", "sometimes"] as const;

export function Results({
  data,
  phrases,
  isTeam,
  hasCurrency,
  userId,
  restrictions,
  onScanAgain,
}: {
  data: ResultData;
  phrases: StaffPhrase[];
  isTeam: boolean;
  hasCurrency: boolean;
  userId: string;
  restrictions: string[];
  onScanAgain: () => void;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  // Which card opened the Ask-staff card or the report sheet.
  const [dialog, setDialog] = useState<{ type: "ask" | "report"; item: ResultItem } | null>(null);
  // Order helper: dish position → quantity and requests.
  const [order, setOrder] = useState<Order>(new Map());
  const [orderOpen, setOrderOpen] = useState(false);
  const count = (v: Verdict) => data.items.filter((i) => i.verdict === v).length;
  // Menu order (numbered), so users can count along the menu; filters narrow it down.
  const shown = filter === "all" ? data.items : data.items.filter((i) => i.verdict === filter);
  const ordered = [...order.values()].reduce((sum, o) => sum + o.qty, 0);
  const hasPrices = data.items.some((i) => priceNumber(i.price) !== null);

  function changeQty(position: number, delta: number) {
    setOrder((current) => {
      const next = new Map(current);
      const entry = next.get(position) ?? { qty: 0, options: [], custom: [] };
      if (entry.qty + delta <= 0) next.delete(position);
      else next.set(position, { ...entry, qty: entry.qty + delta });
      return next;
    });
  }

  return (
    <main className="flex flex-col gap-3 px-4 pt-[calc(1.5rem+env(safe-area-inset-top))]">
      <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight">
        {s.results.title}
        <span className="rounded-full bg-page px-2 py-0.5 text-xs font-semibold text-muted ring-1 ring-line">{data.approach}</span>
      </h1>

      {data.items.length === 0 && !data.streaming ? (
        <div className="card py-8 text-center text-muted">{s.results.empty}</div>
      ) : (
        <>
          <p className="card py-3 text-center text-sm font-semibold" aria-live="polite">
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

          {shown.length === 0 && !data.streaming ? (
            <p className="card py-6 text-center text-sm text-muted">{s.results.noneInFilter}</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {shown.map((item) => (
                <ResultCard
                  key={item.position}
                  item={item}
                  rate={data.rate}
                  isTeam={isTeam}
                  qty={order.get(item.position)?.qty ?? 0}
                  onQty={(delta) => changeQty(item.position, delta)}
                  onAsk={() => setDialog({ type: "ask", item })}
                  onReport={() => setDialog({ type: "report", item })}
                />
              ))}
            </ul>
          )}
        </>
      )}

      {data.streaming && (
        <p className="flex items-center justify-center gap-2 py-2 text-sm font-semibold text-brand" role="status">
          <Loader2 size={18} className="animate-spin" /> {s.results.streaming}
        </p>
      )}
      {data.failed && (
        <p className="flex gap-1.5 rounded-xl bg-check/15 px-3 py-2 text-sm text-[#b35c00]">
          <TriangleAlert size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
          {s.results.streamFailed}
        </p>
      )}

      {hasPrices && data.rate && <p className="px-1 text-xs text-muted">{s.results.rateNote(data.rate.code, new Date(data.rate.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" }))}</p>}
      {hasPrices && !hasCurrency && !data.streaming && <p className="px-1 text-xs text-muted">{s.results.setCurrency}</p>}
      <p className="px-1 text-xs text-muted">{s.results.disclaimer}</p>

      {!data.streaming && (
        <>
          <button type="button" onClick={onScanAgain} className="btn-primary">
            <ScanLine size={20} /> {s.results.scanAgain}
          </button>
          {data.remaining !== null && <p className="text-center text-xs text-muted">{s.results.remaining(data.remaining)}</p>}
        </>
      )}

      {ordered > 0 && (
        <div className="fixed inset-x-0 bottom-[calc(6.25rem+env(safe-area-inset-bottom))] z-30 mx-auto w-full max-w-md px-3">
          <button type="button" onClick={() => setOrderOpen(true)} className="animate-slide-up flex min-h-13 w-full items-center gap-2 rounded-full bg-ink px-5 text-left font-semibold text-white shadow-lg">
            <ShoppingBag size={18} aria-hidden="true" />
            <span className="flex-1 truncate text-sm">{s.results.orderBar(ordered)}</span>
            <span className="text-sm text-white/80">{s.results.showOrder}</span>
          </button>
        </div>
      )}

      {orderOpen && (
        <OrderSheet
          items={data.items}
          rate={data.rate}
          userId={userId}
          restrictions={restrictions}
          order={order}
          onChange={setOrder}
          onClose={() => setOrderOpen(false)}
        />
      )}
      {dialog?.type === "ask" && (
        <AskStaffCard
          dish={dialog.item}
          phrases={phrases}
          preferred={dialog.item.reasons.find((r) => r.restriction)?.restriction}
          onClose={() => setDialog(null)}
        />
      )}
      {dialog?.type === "report" && <ReportSheet approach={data.approach} item={dialog.item} onClose={() => setDialog(null)} />}
    </main>
  );
}

function ResultCard({
  item,
  rate,
  isTeam,
  qty,
  onQty,
  onAsk,
  onReport,
}: {
  item: ResultItem;
  rate: Rate | null;
  isTeam: boolean;
  qty: number;
  onQty: (delta: number) => void;
  onAsk: () => void;
  onReport: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ingredients = [...item.ingredients].sort((a, b) => CERTAINTY_ORDER.indexOf(a.certainty) - CERTAINTY_ORDER.indexOf(b.certainty));
  const hkd = priceNumber(item.price);
  // Users see verified dishes in the lexicon; the team sees drafts too.
  const lexiconId = item.kb_dish && (item.kb_dish.verified || isTeam) ? item.kb_dish.dish_id : null;

  return (
    <li className="card animate-slide-up flex flex-col gap-2">
      {/* Top row: position on the photo, kind of dish, menu number – and the price. */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="grid size-6 shrink-0 place-items-center rounded-full bg-page text-xs font-bold text-muted ring-1 ring-line" aria-label={s.results.position(item.position)}>
          {item.position}
        </span>
        {item.category && <DishCategoryChip category={item.category} />}
        {item.menu_number && <span className="rounded-full bg-brand-light px-2 py-0.5 text-xs font-bold text-brand-dark">{s.results.menuNumber(item.menu_number)}</span>}
        {item.price && (
          <span className="ml-auto">
            <PriceTag hkd={hkd} raw={item.price} rate={rate} />
          </span>
        )}
      </div>
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[17px] font-bold leading-snug">{item.name_en}</p>
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

      {item.friends.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="font-semibold text-muted">{s.results.friends}:</span>
          {item.friends.map((f) => (
            <span key={f.restriction} title={f.reason ?? undefined} className="inline-flex items-center gap-1 rounded-full bg-page py-0.5 pl-2 ring-1 ring-line">
              {restrictionByKey(f.restriction)?.label ?? f.restriction}
              <VerdictPill verdict={f.verdict} size="sm" />
            </span>
          ))}
        </div>
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
              {item.kb_dish === null && <p className="mt-2 border-t border-line pt-2 text-xs text-muted">{s.results.aiEstimate}</p>}
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
                  {lexiconId !== null && (
                    <Link href={`/lexicon/${lexiconId}`} className="mt-1 inline-flex min-h-9 items-center text-sm font-semibold text-brand">
                      {s.results.openInLexicon}
                    </Link>
                  )}
                </div>
              )}
            </div>
          )}
        </>
      )}

      <div className="flex flex-wrap items-center gap-2 pt-1">
        {qty === 0 ? (
          <button type="button" onClick={() => onQty(1)} className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-ink px-3.5 text-sm font-semibold text-white">
            <Plus size={16} /> {s.results.addToOrder}
          </button>
        ) : (
          <span className="inline-flex min-h-10 items-center rounded-full bg-ink text-white">
            <button type="button" onClick={() => onQty(-1)} aria-label={s.results.less} className="grid size-10 place-items-center">
              <Minus size={16} />
            </button>
            <span className="min-w-6 text-center text-sm font-bold tabular-nums">{qty}</span>
            <button type="button" onClick={() => onQty(1)} aria-label={s.results.more} className="grid size-10 place-items-center">
              <Plus size={16} />
            </button>
          </span>
        )}
        <button type="button" onClick={onAsk} className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-brand-light px-3.5 text-sm font-semibold text-brand-dark">
          <MessageCircleQuestion size={16} /> {s.results.askStaff}
        </button>
        <button type="button" onClick={onReport} aria-label={s.results.report} className="inline-flex min-h-10 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-muted ring-1 ring-line">
          <Flag size={15} />
        </button>
      </div>
    </li>
  );
}
