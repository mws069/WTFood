import { nearestDishes } from "@/lib/a3-match";
import { parseIngredients } from "@/lib/dishes";
import { ingredientByKey } from "@/lib/ingredients";
import type { Kind, ScanItem, ScanResult } from "@/lib/scan-schema";
import { createAdminClient } from "@/lib/supabase/admin";
import { readPhoto, type OnItem } from "./a2";

// A3 – the hybrid (default for users):
// 1. The vision model reads the photo as in A2: items in menu order, menu
//    numbers, English names, short descriptions, likely ingredients.
// 2. Every menu item is matched against our dish knowledge base (character
//    bigrams on the Chinese name and aliases, lib/a3-match.ts).
// 3. With a match, the ingredients come from our entry, not from the model
//    (grounded). Without one, the model's estimate stays and the result says so.
// Food labels keep the ingredients read from the label itself.
//
// Team decision (milestone 6b): the first A3 (OCR + text model) read menus
// badly; reading the photo with the vision model works much better.

// Minimum similarity for a dish to count as the same dish (A3_MIN_SIMILARITY).
// High on purpose: 菠蘿包 and 菠蘿油 (0.5) are different dishes.
function minSimilarity() {
  return Number(process.env.A3_MIN_SIMILARITY) || 0.75;
}

type Dish = {
  id: number;
  name_zh: string;
  aliases: string[];
  jyutping: string | null;
  name_en: string;
  ingredients: unknown;
  status: string;
  source_url: string | null;
};

// Drafts are included on purpose (team decision): results based on a draft
// say that the entry is not verified yet. Read with the admin client because
// normal users may only read verified dishes.
async function loadDishes(): Promise<Dish[]> {
  const { data, error } = await createAdminClient()
    .from("dishes")
    .select("id, name_zh, aliases, jyutping, name_en, ingredients, status, source_url");
  if (error) throw new Error(`dishes: ${error.message}`);
  return data;
}

function ground(item: ScanItem, dishes: Dish[]): ScanItem {
  const matches = nearestDishes(item.original_text, dishes, 3, minSimilarity());
  const kb_matches = matches.map((m) => ({ dish_id: m.dish.id, similarity: Math.round(m.similarity * 100) / 100 }));
  const dish = matches[0]?.dish;
  const ingredients = dish ? parseIngredients(dish.ingredients) : [];
  // An entry without ingredients grounds nothing: keep the model's estimate.
  if (!dish || ingredients.length === 0) return { ...item, kb_matches, kb_dish: null };

  return {
    ...item,
    jyutping: item.jyutping ?? dish.jyutping,
    ingredients: ingredients.map((ing) => ({
      key: ing.key,
      name_en: ingredientByKey(ing.key)?.label ?? ing.key,
      categories: [],
      certainty: ing.certainty,
    })),
    kb_matches,
    kb_dish: { dish_id: dish.id, name_zh: dish.name_zh, name_en: dish.name_en, verified: dish.status === "verified", source_url: dish.source_url },
  };
}

export async function runA3(imageBase64: string, mediaType: string, kindHint: Kind | null, onItem?: OnItem): Promise<ScanResult> {
  const started = Date.now();
  // The dishes first (a quick query), so every streamed item can be grounded at once.
  const dishes = await loadDishes();
  const groundFor = (item: ScanItem, kind: Kind) => (kind === "label" ? item : ground(item, dishes));
  const read = await readPhoto(imageBase64, mediaType, kindHint, onItem && ((item, kind) => onItem(groundFor(item, kind), kind)));
  const items = read.items.map((item) => groundFor(item, read.kind));
  return { approach: "A3", kind: read.kind, items, cost_usd: read.cost_usd, latency_ms: Date.now() - started };
}
