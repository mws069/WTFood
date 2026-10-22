"use client";

import { useState, useTransition } from "react";
import { Search } from "lucide-react";
import { ingredientByKey, INGREDIENTS } from "@/lib/ingredients";
import { s } from "@/lib/strings";
import { deleteTerm, saveTerm } from "../actions";

type Term = { id: number; term_zh: string; variants: string[]; ingredient_key: string; note: string | null };
type Values = { term_zh: string; variants: string; ingredient_key: string; note: string };

const SORTED_INGREDIENTS = [...INGREDIENTS].sort((a, b) => a.label.localeCompare(b.label));
const ERRORS = { invalid: s.lab.invalid, needsSource: s.lab.needsSource, duplicate: s.lab.duplicate, generic: s.common.errorGeneric };

const toValues = (t?: Term): Values => ({
  term_zh: t?.term_zh ?? "",
  variants: t?.variants.join(", ") ?? "",
  ingredient_key: t?.ingredient_key ?? "rice",
  note: t?.note ?? "",
});

export function TermsEditor({ terms }: { terms: Term[] }) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const shown = q
    ? terms.filter((t) =>
        [t.term_zh, ...t.variants, t.ingredient_key, ingredientByKey(t.ingredient_key)?.label ?? "", t.note ?? ""].some((f) => f.toLowerCase().includes(q)),
      )
    : terms;

  return (
    <section className="flex flex-col gap-3">
      <label className="relative">
        <span className="sr-only">{s.lab.search}</span>
        <Search size={20} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
        <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={s.lab.search} className="input rounded-full pl-11" />
      </label>
      <p className="text-sm text-muted">{s.lab.termsCount(terms.length)}</p>

      <div className="card flex flex-col gap-2">
        <p className="label">{s.lab.add}</p>
        <TermRow key={`new-${terms.length}`} />
      </div>

      <div className="card flex flex-col divide-y divide-line py-0">
        {shown.map((t) => (
          <div key={t.id} className="py-2">
            <TermRow term={t} />
          </div>
        ))}
      </div>
    </section>
  );
}

function TermRow({ term }: { term?: Term }) {
  const [initial, setInitial] = useState(toValues(term));
  const [values, setValues] = useState(initial);
  const [status, setStatus] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const dirty = JSON.stringify(values) !== JSON.stringify(initial);
  const set = (key: keyof Values, value: string) => {
    setStatus(null);
    setValues((v) => ({ ...v, [key]: value }));
  };

  return (
    <form
      className="grid gap-2 sm:grid-cols-[8rem_10rem_minmax(10rem,1fr)_minmax(10rem,1.5fr)_auto]"
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          const result = await saveTerm(term?.id ?? null, values);
          if ("error" in result) return setStatus(ERRORS[result.error]);
          setStatus(s.lab.saved);
          if (term) setInitial(values);
          else setValues(toValues());
        });
      }}
    >
      <input aria-label={s.lab.fields.term} value={values.term_zh} onChange={(e) => set("term_zh", e.target.value)} placeholder={s.lab.fields.term} lang="zh-HK" className="input" required />
      <input aria-label={s.lab.fields.variants} value={values.variants} onChange={(e) => set("variants", e.target.value)} placeholder={s.lab.fields.variants} lang="zh" className="input" />
      <select aria-label={s.lab.fields.ingredient} value={values.ingredient_key} onChange={(e) => set("ingredient_key", e.target.value)} className="input">
        {SORTED_INGREDIENTS.map((i) => (
          <option key={i.key} value={i.key}>
            {i.label}
          </option>
        ))}
      </select>
      <input aria-label={s.lab.fields.note} value={values.note} onChange={(e) => set("note", e.target.value)} placeholder={s.lab.fields.note} className="input" />
      <div className="flex items-center gap-2">
        <button type="submit" className="btn-primary px-4" disabled={pending || !dirty}>
          {term ? s.lab.save : s.lab.add}
        </button>
        {term && !dirty && (
          <button
            type="button"
            className="min-h-12 rounded-full px-3 text-sm font-medium text-avoid"
            disabled={pending}
            onClick={() => {
              if (!confirm(s.lab.confirmDelete)) return;
              startTransition(async () => {
                const result = await deleteTerm(term.id);
                if ("error" in result) setStatus(ERRORS[result.error]);
              });
            }}
          >
            {s.lab.delete}
          </button>
        )}
        {status && (
          <span className="text-xs text-muted" role="status">
            {status}
          </span>
        )}
      </div>
    </form>
  );
}
