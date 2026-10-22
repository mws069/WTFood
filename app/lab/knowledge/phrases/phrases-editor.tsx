"use client";

import { useState, useTransition } from "react";
import { RestrictionIcon } from "@/components/restriction-icon";
import { RESTRICTIONS } from "@/lib/restrictions";
import { s } from "@/lib/strings";
import { deletePhrase, savePhrase } from "../actions";

type Phrase = { id: number; restriction_key: string; text_zh: string; jyutping: string | null; text_en: string; reviewed: boolean };
type Values = { restriction_key: string; text_zh: string; jyutping: string; text_en: string; reviewed: boolean };

const ERRORS = { invalid: s.lab.invalid, needsSource: s.lab.needsSource, duplicate: s.lab.duplicate, generic: s.common.errorGeneric };

const toValues = (p?: Phrase): Values => ({
  restriction_key: p?.restriction_key ?? RESTRICTIONS[0].key,
  text_zh: p?.text_zh ?? "",
  jyutping: p?.jyutping ?? "",
  text_en: p?.text_en ?? "",
  reviewed: p?.reviewed ?? false,
});

export function PhrasesEditor({ phrases }: { phrases: Phrase[] }) {
  return (
    <section className="grid gap-4 md:grid-cols-2">
      <div className="card md:col-span-2">
        <p className="label mb-2">{s.lab.add}</p>
        <PhraseCard key={`new-${phrases.length}`} />
      </div>
      {phrases.map((p) => (
        <div key={p.id} className="card">
          <PhraseCard phrase={p} />
        </div>
      ))}
    </section>
  );
}

function PhraseCard({ phrase }: { phrase?: Phrase }) {
  const [initial, setInitial] = useState(toValues(phrase));
  const [values, setValues] = useState(initial);
  const [status, setStatus] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const dirty = JSON.stringify(values) !== JSON.stringify(initial);
  const set = <K extends keyof Values>(key: K, value: Values[K]) => {
    setStatus(null);
    setValues((v) => ({ ...v, [key]: value }));
  };

  return (
    <form
      className="flex flex-col gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          const result = await savePhrase(phrase?.id ?? null, values);
          if ("error" in result) return setStatus(ERRORS[result.error]);
          setStatus(s.lab.saved);
          if (phrase) setInitial(values);
          else setValues(toValues());
        });
      }}
    >
      <div className="flex items-center gap-2">
        <RestrictionIcon restrictionKey={values.restriction_key} size="sm" />
        <select aria-label={s.lab.fields.restriction} value={values.restriction_key} onChange={(e) => set("restriction_key", e.target.value)} className="input flex-1">
          {RESTRICTIONS.map((r) => (
            <option key={r.key} value={r.key}>
              {r.label}
            </option>
          ))}
        </select>
      </div>
      <textarea aria-label={s.lab.fields.textZh} value={values.text_zh} onChange={(e) => set("text_zh", e.target.value)} placeholder={s.lab.fields.textZh} rows={2} lang="zh-HK" className="input h-auto py-2 text-lg" required />
      <input aria-label={s.lab.fields.jyutping} value={values.jyutping} onChange={(e) => set("jyutping", e.target.value)} placeholder={s.lab.fields.jyutping} className="input" />
      <input aria-label={s.lab.fields.textEn} value={values.text_en} onChange={(e) => set("text_en", e.target.value)} placeholder={s.lab.fields.textEn} className="input" required />
      <label className="flex min-h-12 items-center gap-3 text-sm">
        <input type="checkbox" checked={values.reviewed} onChange={(e) => set("reviewed", e.target.checked)} className="h-5 w-5 accent-ok" />
        {s.lab.fields.reviewed}
      </label>
      <div className="flex items-center gap-2">
        <button type="submit" className="btn-primary px-5" disabled={pending || !dirty}>
          {phrase ? s.lab.save : s.lab.add}
        </button>
        {phrase && !dirty && (
          <button
            type="button"
            className="min-h-12 rounded-full px-3 text-sm font-medium text-avoid"
            disabled={pending}
            onClick={() => {
              if (!confirm(s.lab.confirmDelete)) return;
              startTransition(async () => {
                const result = await deletePhrase(phrase.id);
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
