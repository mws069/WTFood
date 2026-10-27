"use client";

import { Languages, Loader2, Minus, Plus, Trash2, X } from "lucide-react";
import { useId, useState } from "react";
import type { ResultItem } from "@/app/api/scan/route";
import type { TranslateResponse } from "@/app/api/translate/route";
import { FullScreen } from "@/app/(tabs)/ask/phrase";
import { FormMessage } from "@/components/auth-shell";
import { DishCategoryChip } from "@/components/dish-category-chip";
import { PriceTag } from "@/components/price-tag";
import { priceNumber, type Rate } from "@/lib/currency";
import { OPTIONS_BY_CATEGORY, ORDER_OPTIONS, orderLine, orderTotal, toggleOption, type CustomRequest, type OrderOption } from "@/lib/order";
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
  onChange,
  onClose,
}: {
  items: ResultItem[];
  order: Order;
  rate: Rate | null;
  onChange: (order: Order) => void;
  onClose: () => void;
}) {
  const [card, setCard] = useState(false);
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
          <ul className="divide-y divide-line">
            {entries.map(({ item, qty, options, custom }) => {
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
          {total !== null && (
            <div className="flex items-center justify-between gap-3 border-t-2 border-ink px-5 py-3">
              <span className="font-bold">
                <span lang="zh-HK">合共</span> · {s.order.total}
              </span>
              <PriceTag hkd={total} rate={rate} size="md" />
            </div>
          )}
        </div>
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
      <button type="button" onClick={() => setCard(true)} className="btn-primary">
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
        <ul className="flex flex-wrap gap-1.5">
          {custom.map((request, i) => (
            <li key={`${request.zh}-${i}`} className="inline-flex min-h-9 items-center gap-1 rounded-full bg-ink pl-3 text-sm font-semibold text-white">
              <span lang="zh-HK">{request.zh}</span> · {request.en}
              <button type="button" onClick={() => onRemoveCustom(i)} aria-label={s.order.removeRequest} className="grid size-9 place-items-center">
                <X size={15} />
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
        <button type="button" onClick={add} disabled={!text.trim() || busy} aria-label={s.order.addRequest} className="btn-secondary w-14 shrink-0 px-0">
          {busy ? <Loader2 size={18} className="animate-spin" /> : <Languages size={18} />}
        </button>
      </div>
      {error && <FormMessage kind="error" text={s.translator.errors[error]} />}
    </div>
  );
}
