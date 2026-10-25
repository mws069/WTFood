import { findIngredients, looksLikeLabel, splitLabel, splitMenu, type Term } from "@/lib/a1-text";
import { ingredientByKey } from "@/lib/ingredients";
import type { Kind, ScanResult } from "@/lib/scan-schema";
import { createClient } from "@/lib/supabase/server";
import { readText } from "./ocr";
import { translateToEnglish } from "./translate";

// A1 – the classic expert-system baseline, deliberately without any AI model:
// OCR → split into items → DeepL translation → dictionary lookup in
// ingredient_terms. Only ingredients literally written in the text are found
// (certainty "listed", or "sometimes" for "may contain").

// Items read with less confidence than this are "Check" (OCR_MIN_CONFIDENCE).
function minConfidence() {
  return Number(process.env.OCR_MIN_CONFIDENCE) || 0.7;
}

async function loadTerms(): Promise<Term[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("ingredient_terms").select("term_zh, variants, ingredient_key");
  return (data ?? []).flatMap((t) => [t.term_zh, ...t.variants].map((term) => ({ term, key: t.ingredient_key })));
}

export async function runA1(image: Blob, kindHint: Kind | null): Promise<ScanResult> {
  const started = Date.now();
  const [lines, terms] = await Promise.all([readText(image), loadTerms()]);

  const kind: Kind = kindHint ?? (looksLikeLabel(lines) ? "label" : "menu");
  const parts = kind === "label" ? splitLabel(lines) : splitMenu(lines);
  const english = await translateToEnglish(parts.map((p) => p.text));

  const items = parts.map((part, i) => ({
    original_text: part.text,
    name_en: english[i] ?? part.text,
    jyutping: null,
    description_en: null,
    recognised: true,
    low_confidence: part.confidence < minConfidence(),
    ingredients: findIngredients(part.ingredientText, terms).map((found) => ({
      key: found.key,
      name_en: ingredientByKey(found.key)?.label ?? found.key,
      categories: [],
      certainty: found.certainty,
    })),
    notes: english[i] === null ? "Not translated (translation service unavailable)." : null,
  }));

  return { approach: "A1", kind, items, latency_ms: Date.now() - started, cost_usd: 0 };
}
