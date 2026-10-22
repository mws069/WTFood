"use client";

import { useState, useTransition } from "react";
import { FormMessage } from "@/components/auth-shell";
import { RestrictionIcon } from "@/components/restriction-icon";
import { VerdictPill } from "@/components/verdict-pill";
import { INGREDIENTS } from "@/lib/ingredients";
import { RESTRICTIONS } from "@/lib/restrictions";
import { s } from "@/lib/strings";
import { verdictFor, type Certainty, type ItemIngredient } from "@/lib/verdict";
import { deleteDish, saveDish } from "../actions";

export type DishFormValues = {
  name_zh: string;
  aliases: string;
  jyutping: string;
  name_en: string;
  description_en: string;
  category: string;
  source_url: string;
  status: "draft" | "verified";
  ingredients: ItemIngredient[];
};

const CERTAINTIES: Certainty[] = ["listed", "always", "usually", "sometimes"];
const SORTED_INGREDIENTS = [...INGREDIENTS].sort((a, b) => a.label.localeCompare(b.label));

const ERRORS = { invalid: s.lab.invalid, needsSource: s.lab.needsSource, duplicate: s.lab.duplicate, generic: s.common.errorGeneric };

export function DishForm({ id, initial }: { id: number | null; initial: DishFormValues }) {
  const [values, setValues] = useState(initial);
  // Last saved state: Save stays greyed out until something differs from it.
  const [saved, setSaved] = useState(initial);
  const dirty = JSON.stringify(values) !== JSON.stringify(saved);
  const [message, setMessage] = useState<{ kind: "error" | "info"; text: string } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [pending, startTransition] = useTransition();

  const set = <K extends keyof DishFormValues>(key: K, value: DishFormValues[K]) => {
    setMessage(null);
    setValues((v) => ({ ...v, [key]: value }));
  };
  const setIngredient = (index: number, patch: Partial<ItemIngredient>) =>
    set("ingredients", values.ingredients.map((i, n) => (n === index ? { ...i, ...patch } : i)));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await saveDish(id, values);
      if ("error" in result) return setMessage({ kind: "error", text: ERRORS[result.error] });
      setSaved(values);
      setMessage({ kind: "info", text: s.lab.saved });
    });
  }

  const field = (key: "name_zh" | "jyutping" | "name_en" | "category" | "source_url" | "aliases", label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <label className="flex flex-col gap-1">
      <span className="label">{label}</span>
      <input value={values[key]} onChange={(e) => set(key, e.target.value)} className="input" {...props} />
    </label>
  );

  return (
    <form onSubmit={submit} className="grid gap-4 lg:grid-cols-[1fr_20rem] [&>*]:min-w-0">
      <div className="card flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2 [&>*]:min-w-0">
          {field("name_zh", s.lab.fields.nameZh, { required: true, lang: "zh-HK" })}
          {field("name_en", s.lab.fields.nameEn, { required: true })}
          {field("jyutping", s.lab.fields.jyutping)}
          {field("aliases", s.lab.fields.aliases, { lang: "zh-HK" })}
          {field("category", s.lab.fields.category)}
          {field("source_url", s.lab.fields.sourceUrl, { type: "url", placeholder: "https://" })}
        </div>
        <label className="flex flex-col gap-1">
          <span className="label">{s.lab.fields.description}</span>
          <textarea value={values.description_en} onChange={(e) => set("description_en", e.target.value)} rows={2} className="input h-auto py-3" />
        </label>

        <fieldset className="flex flex-col gap-2">
          <legend className="label mb-2">{s.lab.fields.ingredients}</legend>
          {values.ingredients.map((ing, n) => (
            <div key={n} className="flex flex-wrap gap-2">
              <select aria-label={s.lab.fields.ingredient} value={ing.key} onChange={(e) => setIngredient(n, { key: e.target.value })} className="input min-w-0 flex-1 basis-48">
                {SORTED_INGREDIENTS.map((i) => (
                  <option key={i.key} value={i.key}>
                    {i.label}
                  </option>
                ))}
              </select>
              <select aria-label={s.lab.fields.certainty} value={ing.certainty} onChange={(e) => setIngredient(n, { certainty: e.target.value as Certainty })} className="input w-36">
                {CERTAINTIES.map((c) => (
                  <option key={c} value={c}>
                    {s.certainty[c]}
                  </option>
                ))}
              </select>
              <button type="button" onClick={() => set("ingredients", values.ingredients.filter((_, i) => i !== n))} className="min-h-12 rounded-full px-3 text-sm font-medium text-avoid" aria-label={`${s.lab.remove} ${ing.key}`}>
                {s.lab.remove}
              </button>
            </div>
          ))}
          <button type="button" onClick={() => set("ingredients", [...values.ingredients, { key: "rice", certainty: "always" }])} className="btn-secondary self-start">
            + {s.lab.addIngredient}
          </button>
        </fieldset>
      </div>

      <aside className="flex flex-col gap-4">
        <div className="card flex flex-col gap-3">
          <span className="label">{s.lab.fields.status}</span>
          <div className="grid grid-cols-2 gap-2">
            {(["draft", "verified"] as const).map((st) => (
              <button
                key={st}
                type="button"
                aria-pressed={values.status === st}
                onClick={() => set("status", st)}
                className={`min-h-12 rounded-full text-sm font-semibold ${values.status === st ? (st === "verified" ? "bg-ok text-white" : "bg-ink text-white") : "bg-page ring-1 ring-line"}`}
              >
                {st === "verified" ? s.lab.verified : s.lexicon.draft}
              </button>
            ))}
          </div>
          {message && <FormMessage {...message} />}
          <button type="submit" className="btn-primary" disabled={pending || !dirty}>
            {pending ? s.common.working : s.lab.save}
          </button>
        </div>

        {/* Live preview: what the rule engine says for each restriction. */}
        <div className="card">
          <p className="label mb-2">{s.lexicon.forYou}</p>
          <ul className="flex flex-col gap-1.5 text-sm">
            {RESTRICTIONS.map((r) => (
              <li key={r.key} className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2">
                  <RestrictionIcon restrictionKey={r.key} size="xs" /> {r.label}
                </span>
                <VerdictPill verdict={verdictFor({ ingredients: values.ingredients }, [r.key]).verdict} size="sm" />
              </li>
            ))}
          </ul>
        </div>

        {id && (
          <div className="card flex flex-col gap-2">
            {confirmDelete ? (
              <div className="flex gap-2">
                <button type="button" className="btn-secondary flex-1" onClick={() => setConfirmDelete(false)}>
                  {s.common.cancel}
                </button>
                <button type="button" className="btn-danger flex-1" disabled={pending} onClick={() => startTransition(() => deleteDish(id).then(() => {}))}>
                  {s.lab.confirmDelete}
                </button>
              </div>
            ) : (
              <button type="button" className="min-h-12 rounded-full border border-avoid font-semibold text-avoid" onClick={() => setConfirmDelete(true)}>
                {s.lab.delete}
              </button>
            )}
          </div>
        )}
      </aside>
    </form>
  );
}
