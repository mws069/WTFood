"use client";

import { Loader2, Minus, Plus, ShieldAlert, Trash2, X } from "lucide-react";
import { useId, useState } from "react";
import type { ResultItem } from "@/app/api/scan/route";
import type { TranslateResponse } from "@/app/api/translate/route";
import { useAllergyCard } from "@/app/(tabs)/ask/allergy-card";
import { FullScreen } from "@/app/(tabs)/ask/phrase";
import { Translator } from "@/app/(tabs)/ask/translator";
import { FormMessage } from "@/components/auth-shell";
import { DishCategoryChip } from "@/components/dish-category-chip";
import { PriceTag } from "@/components/price-tag";
import { VerdictPill } from "@/components/verdict-pill";
import { priceNumber, type Rate } from "@/lib/currency";
import {
  CATEGORY_ZH,
  groupByCategory,
  OPTIONS_BY_CATEGORY,
  ORDER_OPTIONS,
  orderLine,
  orderTotal,
  toggleOption,
  type CustomRequest,
  type OrderOption,
} from "@/lib/order";
import { s } from "@/lib/strings";
import type { Order } from "./results";

type Entry = { qty: number; options: OrderOption[]; custom: CustomRequest[] };

// The picked dishes with quantity and requests that fit the kind of dish
// (drinks: ice and sugar, mains: spring onion, chilli …) plus requests the
// user writes themselves, then a big card in Chinese for the staff.
// Nothing is ordered in the app.
export function OrderSheet({
  items,
  order,
  rate,
  userId,
  restrictions,
  onChange,
  onClose,
}: {
  items: ResultItem[];
  order: Order;
  rate: Rate | null;
  userId: string;
  restrictions: string[];
  onChange: (order: Order) => void;
  onClose: () => void;
}) {
  const [card, setCard] = useState(false);
  // The user's restrictions in Cantonese (the allergy card), shown on the order card.
  const allergy = useAllergyCard(userId, restrictions);

  function showCard() {
    setCard(true);
    void allergy.load();
  }
  const entries = items.filter((item) => order.has(item.position)).map((item) => ({ item, ...order.get(item.position)! }));
  const total = orderTotal(entries.map(({ item, qty }) => ({ qty, price: priceNumber(item.price) })));

  function update(position: number, change: (entry: Entry) => Entry) {
    const next = new Map(order);
    const updated = change(next.get(position)!);
    if (updated.qty <= 0) next.delete(position);
    else next.set(position, updated);
    onChange(next);
    if (next.size === 0) onClose();
  }

  if (card) {
    return (
      <FullScreen title={s.order.cardTitle} onClose={() => setCard(false)}>
        <div className="overflow-hidden rounded-2xl bg-white ring-2 ring-ink">
          <div className="bg-ink px-5 py-4 text-white">
            <p lang="zh-HK" className="text-2xl font-extrabold">
              {s.order.greeting}
            </p>
            <p className="text-sm text-white/75">{s.order.greetingEn}</p>
          </div>
          {groupByCategory(entries.map((entry) => ({ ...entry, category: entry.item.category ?? null }))).map((group) => (
            <section key={group.category} className="border-t border-line first:border-t-0">
              <h3 className="flex items-center gap-2 bg-page px-5 py-2">
                {group.category !== "unknown" && <DishCategoryChip category={group.category} />}
                <span lang="zh-HK" className="text-base font-extrabold text-ink">
                  {CATEGORY_ZH[group.category]}
                </span>
              </h3>
              <ul className="divide-y divide-line">
                {group.entries.map(({ item, qty, options, custom }) => {
                  const line = orderLine({ ...item, qty, options, custom });
                  return (
                    <li key={item.position} className="flex gap-4 px-5 py-4">
                      <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-brand text-2xl font-extrabold text-white tabular-nums">
                        {line.qty}×
                      </span>
                      <div className="min-w-0 flex-1">
                        {line.number && <p className="text-sm font-bold text-brand-dark">{line.number}號 · No. {line.number}</p>}
                        <p lang="zh-HK" className="text-[26px] leading-tight font-extrabold text-ink">
                          {line.zh}
                        </p>
                        <p className="text-sm text-muted">{line.en}</p>
                        {line.requests.length > 0 && (
                          <ul className="mt-2 flex flex-wrap gap-1.5">
                            {line.requests.map((r) => (
                              <li key={r.zh} className="rounded-xl bg-check/15 px-2.5 py-1">
                                <span lang="zh-HK" className="block text-lg leading-tight font-extrabold text-[#8a4700]">
                                  {r.zh}
                                </span>
                                <span className="block text-xs text-[#b35c00]">{r.en}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
          {total !== null && (
            <div className="flex items-center justify-between gap-3 border-t-2 border-ink px-5 py-3">
              <span className="font-bold">
                <span lang="zh-HK">合共</span> · {s.order.total}
              </span>
              <PriceTag hkd={total} rate={rate} size="md" />
            </div>
          )}
          {/* What the user can't eat, so the kitchen knows for every dish. */}
          <div className="border-t-2 border-ink bg-avoid/10 px-5 py-4">
            <p className="flex items-center gap-1.5 text-sm font-bold text-[#c4142a]">
              <ShieldAlert size={18} aria-hidden="true" />
              <span lang="zh-HK">飲食限制</span> · {s.order.restrictions}
            </p>
            {allergy.card && (
              <>
                <p lang="zh-HK" className="mt-1.5 text-xl leading-snug font-extrabold text-ink">
                  {allergy.card.text_zh}
                </p>
                <p className="mt-1 text-sm text-muted">{allergy.card.text_en}</p>
              </>
            )}
            {allergy.loading && (
              <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-brand">
                <Loader2 size={16} className="animate-spin" /> {s.allergyCard.loading}
              </p>
            )}
            {allergy.error && (
              <button type="button" onClick={allergy.load} className="mt-2 text-sm font-semibold text-brand">
                {s.allergyCard.retry}
              </button>
            )}
          </div>
        </div>
        {allergy.card && <p className="-mt-2 px-1 text-xs text-muted">{s.allergyCard.note}</p>}

        <section className="flex flex-col gap-2">
          <h2 className="text-[17px] font-bold">{s.order.talkTitle}</h2>
          <p className="text-sm text-muted">{s.order.talkHint}</p>
          <Translator />
        </section>
      </FullScreen>
    );
  }

  return (
    <FullScreen title={s.order.title} onClose={onClose}>
      <p className="text-sm text-muted">{s.order.intro}</p>
      <ul className="flex flex-col gap-3">
        {entries.map(({ item, qty, options, custom }) => (
          <li key={item.position} className="card flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex flex-wrap items-center gap-1.5">
                  {item.category && <DishCategoryChip category={item.category} />}
                  {item.verdict !== "ok" && <VerdictPill verdict={item.verdict} size="sm" />}
                  {item.menu_number && <span className="rounded-full bg-brand-light px-2 py-0.5 text-xs font-bold text-brand-dark">{s.results.menuNumber(item.menu_number)}</span>}
                </div>
                <p className="font-bold leading-snug">{item.name_en}</p>
                <p lang="zh-HK" className="text-sm text-muted">
                  {item.original_text}
                </p>
              </div>
              <span className="inline-flex items-center rounded-full bg-page ring-1 ring-line">
                <button type="button" onClick={() => update(item.position, (e) => ({ ...e, qty: e.qty - 1 }))} aria-label={s.results.less} className="grid size-10 place-items-center">
                  {qty === 1 ? <Trash2 size={16} /> : <Minus size={16} />}
                </button>
                <span className="min-w-5 text-center font-bold tabular-nums">{qty}</span>
                <button type="button" onClick={() => update(item.position, (e) => ({ ...e, qty: e.qty + 1 }))} aria-label={s.results.more} className="grid size-10 place-items-center">
                  <Plus size={16} />
                </button>
              </span>
            </div>
            <Requests
              available={OPTIONS_BY_CATEGORY[item.category ?? "unknown"]}
              options={options}
              custom={custom}
              onToggle={(option) => update(item.position, (e) => ({ ...e, options: toggleOption(e.options, option) }))}
              onAddCustom={(request) => update(item.position, (e) => ({ ...e, custom: [...e.custom, request] }))}
              onRemoveCustom={(index) => update(item.position, (e) => ({ ...e, custom: e.custom.filter((_, i) => i !== index) }))}
            />
          </li>
        ))}
      </ul>
      {total !== null && (
        <p className="flex items-center justify-between px-1 font-bold">
          {s.order.total} <PriceTag hkd={total} rate={rate} />
        </p>
      )}
      <button type="button" onClick={showCard} className="btn-primary">
        {s.order.show}
      </button>
      <button
        type="button"
        onClick={() => {
          onChange(new Map());
          onClose();
        }}
        className="min-h-12 text-sm font-semibold text-muted"
      >
        {s.order.clear}
      </button>
    </FullScreen>
  );
}

// The standard requests for this kind of dish, plus own requests written in
// English and translated to Cantonese by the translator.
function Requests({
  available,
  options,
  custom,
  onToggle,
  onAddCustom,
  onRemoveCustom,
}: {
  available: OrderOption[];
  options: OrderOption[];
  custom: CustomRequest[];
  onToggle: (option: OrderOption) => void;
  onAddCustom: (request: CustomRequest) => void;
  onRemoveCustom: (index: number) => void;
}) {
  const id = useId();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<keyof typeof s.translator.errors | null>(null);

  async function add() {
    setBusy(true);
    setError(null);
    const body = new FormData();
    body.append("mode", "request");
    body.append("text", text);
    try {
      const data = (await fetch("/api/translate", { method: "POST", body }).then((r) => r.json())) as TranslateResponse;
      if (!data.ok) return setError(data.error);
      if (data.mode === "request") {
        onAddCustom({ zh: data.text_zh, en: text.trim() });
        setText("");
      }
    } catch {
      setError("network");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="label">{s.order.requests}</p>
      {available.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {available.map((key) => {
            const on = options.includes(key);
            return (
              <button
                key={key}
                type="button"
                aria-pressed={on}
                onClick={() => onToggle(key)}
                className={`min-h-9 rounded-full px-3 text-sm font-semibold ${on ? "bg-ink text-white" : "bg-white ring-1 ring-line"}`}
              >
                <span lang="zh-HK">{ORDER_OPTIONS[key].zh}</span> · {ORDER_OPTIONS[key].en}
              </button>
            );
          })}
        </div>
      )}
      {custom.length > 0 && (
        <ul className="flex flex-col gap-1.5">
          {custom.map((request, i) => (
            <li key={`${request.zh}-${i}`} className="flex min-h-12 items-center gap-2 rounded-xl bg-ink py-1.5 pr-1.5 pl-3 text-white">
              <span className="min-w-0 flex-1">
                <span lang="zh-HK" className="block font-bold">
                  {request.zh}
                </span>
                <span className="block text-xs text-white/75">{request.en}</span>
              </span>
              <button
                type="button"
                onClick={() => onRemoveCustom(i)}
                aria-label={`${s.order.removeRequest}: ${request.en}`}
                className="grid size-10 shrink-0 place-items-center rounded-full bg-white/15"
              >
                <X size={18} />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex gap-2">
        <label className="sr-only" htmlFor={id}>
          {s.order.ownRequest}
        </label>
        <input
          id={id}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && text.trim() && !busy && add()}
          maxLength={120}
          placeholder={s.order.ownPlaceholder}
          className="input min-w-0 flex-1"
        />
        <button type="button" onClick={add} disabled={!text.trim() || busy} className="btn-primary shrink-0 px-4">
          {busy ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
          {s.order.add}
        </button>
      </div>
      <p className="-mt-1 px-1 text-xs text-muted">{s.order.ownHint}</p>
      {error && <FormMessage kind="error" text={s.translator.errors[error]} />}
    </div>
  );
}
