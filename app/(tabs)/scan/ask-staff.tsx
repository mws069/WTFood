"use client";

import { Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import type { TranslateResponse } from "@/app/api/translate/route";
import { FormMessage } from "@/components/auth-shell";
import { FullScreen, NotReviewedNote, PhraseBig, type Phrase } from "@/app/(tabs)/ask/phrase";
import type { StaffPhrase } from "@/app/(tabs)/ask/quick-phrases";
import { Translator } from "@/app/(tabs)/ask/translator";
import { restrictionByKey } from "@/lib/restrictions";
import { s } from "@/lib/strings";

export type { StaffPhrase };

// Full screen card for one dish: the ready-made question for the user's
// restrictions (starting with the one that caused the verdict), questions
// written for this dish on request, and the translator for the answer.
export function AskStaffCard({
  dish,
  phrases,
  preferred,
  onClose,
}: {
  dish: { original_text: string; name_en: string };
  phrases: StaffPhrase[];
  preferred: string | undefined;
  onClose: () => void;
}) {
  const [key, setKey] = useState(phrases.find((p) => p.restriction_key === preferred)?.restriction_key ?? phrases[0]?.restriction_key);
  const phrase = phrases.find((p) => p.restriction_key === key);
  const [dishQuestions, setDishQuestions] = useState<Phrase[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<keyof typeof s.translator.errors | null>(null);
  const [big, setBig] = useState<Phrase | null>(null);

  async function loadDishQuestions() {
    setLoading(true);
    setError(null);
    const body = new FormData();
    body.append("mode", "dish");
    body.append("dish_zh", dish.original_text);
    body.append("dish_en", dish.name_en);
    try {
      const data = (await fetch("/api/translate", { method: "POST", body }).then((r) => r.json())) as TranslateResponse;
      if (!data.ok) setError(data.error);
      else if (data.mode === "dish") setDishQuestions(data.questions);
    } catch {
      setError("network");
    } finally {
      setLoading(false);
    }
  }

  return (
    <FullScreen title={s.askStaff.title} onClose={onClose}>
      <div className="animate-slide-up">
        <p className="text-sm text-muted">{s.askStaff.dish}</p>
        <p lang="zh-HK" className="text-3xl font-extrabold">
          {dish.original_text}
        </p>
        <p className="text-sm text-muted">{dish.name_en}</p>
      </div>

      {phrase ? <PhraseBig phrase={phrase} /> : <p className="card text-center text-sm text-muted">{s.askStaff.none}</p>}
      {phrase && !phrase.reviewed && <NotReviewedNote />}

      {phrases.length > 1 && (
        <div>
          <p className="label mb-2">{s.askStaff.chooseQuestion}</p>
          <div className="flex flex-wrap gap-2">
            {phrases.map((p) => (
              <button
                key={p.restriction_key}
                type="button"
                aria-pressed={p.restriction_key === key}
                onClick={() => setKey(p.restriction_key)}
                className={`min-h-11 rounded-full px-4 text-sm font-semibold ${p.restriction_key === key ? "bg-ink text-white" : "bg-white ring-1 ring-line"}`}
              >
                {restrictionByKey(p.restriction_key)?.label ?? p.restriction_key}
              </button>
            ))}
          </div>
        </div>
      )}

      <section className="flex flex-col gap-2">
        <h2 className="text-[17px] font-bold">{s.askStaff.dishQuestions}</h2>
        {dishQuestions ? (
          <ul className="flex flex-col gap-2">
            {dishQuestions.map((q) => (
              <li key={q.text_zh}>
                <button type="button" onClick={() => setBig(q)} className="card w-full text-left">
                  <span lang="zh-HK" className="block text-lg font-bold">
                    {q.text_zh}
                  </span>
                  <span className="block text-sm text-muted">{q.text_en}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <button type="button" onClick={loadDishQuestions} disabled={loading} className="btn-secondary">
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
            {loading ? s.askStaff.loading : s.askStaff.loadDishQuestions}
          </button>
        )}
        {error && <FormMessage kind="error" text={s.translator.errors[error]} />}
      </section>

      <Translator />

      {big && (
        <FullScreen title={s.askStaff.title} onClose={() => setBig(null)}>
          <PhraseBig phrase={big} />
        </FullScreen>
      )}
    </FullScreen>
  );
}
