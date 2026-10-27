"use client";

import { Loader2, ShieldAlert } from "lucide-react";
import { useState } from "react";
import type { TranslateResponse } from "@/app/api/translate/route";
import { FormMessage } from "@/components/auth-shell";
import { s } from "@/lib/strings";
import { FullScreen, NotReviewedNote, PhraseBig, type Phrase } from "./phrase";

// One card in Cantonese with all of the user's restrictions. Written once by
// the translator, then kept on this phone (so it also works offline) until
// the restrictions change. Also shown on the order card.
const KEY = "wtfood:allergy-card";
type Saved = { userId: string; restrictions: string; card: Phrase };

function loadSaved(userId: string, restrictions: string): Phrase | null {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) ?? "null") as Saved | null;
    return saved?.userId === userId && saved.restrictions === restrictions ? saved.card : null;
  } catch {
    return null;
  }
}

export function useAllergyCard(userId: string, restrictions: string[]) {
  const [card, setCard] = useState<Phrase | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<keyof typeof s.translator.errors | null>(null);
  const key = restrictions.join(",");

  async function load() {
    const saved = card ?? loadSaved(userId, key);
    if (saved) return setCard(saved);
    setLoading(true);
    setError(null);
    const body = new FormData();
    body.append("mode", "card");
    try {
      const data = (await fetch("/api/translate", { method: "POST", body }).then((r) => r.json())) as TranslateResponse;
      if (!data.ok) return setError(data.error);
      if (data.mode !== "card") return setError("failed");
      setCard(data.card);
      try {
        localStorage.setItem(KEY, JSON.stringify({ userId, restrictions: key, card: data.card } satisfies Saved));
      } catch {
        // storage blocked: the card is written again next time
      }
    } catch {
      setError("network");
    } finally {
      setLoading(false);
    }
  }

  return { card, loading, error, load };
}

export function AllergyCard({ userId, restrictions }: { userId: string; restrictions: string[] }) {
  const { card, loading, error, load } = useAllergyCard(userId, restrictions);
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          void load();
        }}
        className="card flex items-center gap-3 text-left active:scale-[0.99]"
      >
        <span className="grid size-11 shrink-0 place-items-center rounded-[14px] bg-gradient-to-br from-[#ff6b7a] to-[#ff3141] text-white">
          <ShieldAlert size={22} aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-bold">{s.allergyCard.button}</span>
          <span className="block text-sm text-muted">{s.allergyCard.buttonText}</span>
        </span>
      </button>

      {open && (
        <FullScreen title={s.allergyCard.title} onClose={() => setOpen(false)}>
          {card && (
            <>
              <PhraseBig phrase={card} size="md" />
              <NotReviewedNote text={s.allergyCard.note} />
            </>
          )}
          {loading && (
            <p className="flex items-center justify-center gap-2 py-10 text-sm font-semibold text-brand">
              <Loader2 size={18} className="animate-spin" /> {s.allergyCard.loading}
            </p>
          )}
          {error && (
            <>
              <FormMessage kind="error" text={s.translator.errors[error]} />
              <button type="button" onClick={load} className="btn-secondary">
                {s.allergyCard.retry}
              </button>
            </>
          )}
        </FullScreen>
      )}
    </>
  );
}
