"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import type { ResultItem } from "@/app/api/scan/route";
import { FullScreen } from "@/app/(tabs)/ask/phrase";
import { ORDER_OPTIONS, orderLine, type OrderOption } from "@/lib/order";
import { s } from "@/lib/strings";
import type { Order } from "./results";

// The picked dishes with quantity and requests (no spring onion, cold …),
// then a big card in Chinese to show the staff. Nothing is ordered in the app.
export function OrderSheet({
  items,
  order,
  onChange,
  onClose,
}: {
  items: ResultItem[];
  order: Order;
  onChange: (order: Order) => void;
  onClose: () => void;
}) {
  const [card, setCard] = useState(false);
  const entries = items
    .filter((item) => order.has(item.position))
    .map((item) => ({ item, ...order.get(item.position)! }));
  const lines = entries.map(({ item, qty, options }) => orderLine({ ...item, qty, options }));

  function update(position: number, change: (entry: { qty: number; options: OrderOption[] }) => { qty: number; options: OrderOption[] }) {
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
        <div className="flex flex-col gap-4 rounded-2xl bg-brand-light px-5 py-6">
          <p lang="zh-HK" className="text-2xl font-extrabold">
            {s.order.greeting}
          </p>
          <ul className="flex flex-col gap-3">
            {lines.map((line) => (
              <li key={line.zh}>
                <p lang="zh-HK" className="text-3xl leading-tight font-extrabold text-ink">
                  {line.zh}
                </p>
                <p className="text-sm text-brand-dark">{line.en}</p>
              </li>
            ))}
          </ul>
          <p className="text-sm text-muted">{s.order.greetingEn}</p>
        </div>
      </FullScreen>
    );
  }

  return (
    <FullScreen title={s.order.title} onClose={onClose}>
      <p className="text-sm text-muted">{s.order.intro}</p>
      <ul className="flex flex-col gap-3">
        {entries.map(({ item, qty, options }) => (
          <li key={item.position} className="card flex flex-col gap-2">
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <p className="font-bold">
                  {item.menu_number && <span className="text-brand-dark">{s.results.menuNumber(item.menu_number)} · </span>}
                  {item.name_en}
                </p>
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
            <p className="label">{s.order.requests}</p>
            <div className="flex flex-wrap gap-1.5">
              {(Object.keys(ORDER_OPTIONS) as OrderOption[]).map((key) => {
                const on = options.includes(key);
                return (
                  <button
                    key={key}
                    type="button"
                    aria-pressed={on}
                    onClick={() =>
                      update(item.position, (e) => ({
                        ...e,
                        // Hot and cold exclude each other.
                        options: on
                          ? e.options.filter((o) => o !== key)
                          : [...e.options.filter((o) => !(key === "hot" && o === "cold") && !(key === "cold" && o === "hot")), key],
                      }))
                    }
                    className={`min-h-9 rounded-full px-3 text-sm font-semibold ${on ? "bg-ink text-white" : "bg-white ring-1 ring-line"}`}
                  >
                    <span lang="zh-HK">{ORDER_OPTIONS[key].zh}</span> · {ORDER_OPTIONS[key].en}
                  </button>
                );
              })}
            </div>
          </li>
        ))}
      </ul>
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
