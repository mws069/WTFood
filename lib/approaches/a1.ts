import { findIngredients, LABEL_FALLBACK, looksLikeLabel, splitLabel, splitMenu, type A1Item, type OcrLine, type Term } from "@/lib/a1-text";
import { ingredientByKey } from "@/lib/ingredients";
import type { Kind, ScanItem, ScanResult } from "@/lib/scan-schema";
import { createClient } from "@/lib/supabase/server";
import { readText } from "./ocr";
import { translateToEnglish } from "./translate";

// A1 – the classic expert-system baseline, deliberately without any AI model:
// OCR → split into items → DeepL translation → dictionary lookup in
// ingredient_terms. Only ingredients literally written in the text are found
// (certainty "listed", or "sometimes" for "may contain").

// Items read with less confidence than this are "Check" (OCR_MIN_CONFIDENCE).
export function minConfidence() {
  return Number(process.env.OCR_MIN_CONFIDENCE) || 0.7;
}

export async function loadTerms(): Promise<Term[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("ingredient_terms").select("term_zh, variants, ingredient_key");
  return (data ?? []).flatMap((t) => [t.term_zh, ...t.variants].map((term) => ({ term, key: t.ingredient_key })));
}

export function detectKind(lines: OcrLine[], kindHint: Kind | null): Kind {
  return kindHint ?? (looksLikeLabel(lines) ? "label" : "menu");
}

// Items with the ingredients literally written in their text. Also used by A3
// for food labels.
export async function dictionaryItems(parts: A1Item[], terms: Term[]): Promise<ScanItem[]> {
  const english = await translateToEnglish(parts.map((p) => p.text));
  return parts.map((part, i) => ({
    original_text: part.text,
    menu_number: part.number ?? null,
    price: part.price ?? null,
    category: null,
    name_en: part.text === LABEL_FALLBACK.zh ? LABEL_FALLBACK.en : (english[i] ?? part.text),
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
}

export async function runA1(images: Blob[], kindHint: Kind | null): Promise<ScanResult> {
  const started = Date.now();
  // Several photos of one menu: their text lines one after another.
  const [pages, terms] = await Promise.all([Promise.all(images.map(readText)), loadTerms()]);
  const lines = pages.flat();

  const kind = detectKind(lines, kindHint);
  const items = await dictionaryItems(kind === "label" ? splitLabel(lines) : splitMenu(lines), terms);

  return { approach: "A1", kind, items, latency_ms: Date.now() - started, cost_usd: 0 };
}
