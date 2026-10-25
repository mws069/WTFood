// Fills the knowledge base. Safe to run again:
// - ingredients are always synced from lib/ingredients.ts (code is the source)
// - terms, dishes and staff phrases are only added if missing, so edits made
//   in the Lab are never overwritten.
// Usage: npm run db:seed
import { createClient } from "@supabase/supabase-js";
import { INGREDIENTS } from "../lib/ingredients.ts";
import { DISHES } from "./seed/dishes.ts";
import { PHRASES } from "./seed/phrases.ts";
import { TERMS } from "./seed/terms.ts";

const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, {
  auth: { persistSession: false },
});

function check<T>(result: { data: T; error: { message: string } | null }, what: string): T {
  if (result.error) throw new Error(`${what}: ${result.error.message}`);
  return result.data;
}

// Catch typos in the seed files before touching the database.
const keys = new Set(INGREDIENTS.map((i) => i.key));
for (const [term, key] of TERMS) if (!keys.has(key)) throw new Error(`Term ${term}: unknown ingredient ${key}`);
for (const d of DISHES) for (const [key] of d.ingredients) if (!keys.has(key)) throw new Error(`Dish ${d.name_zh}: unknown ingredient ${key}`);

// 1. Ingredients (upsert)
check(
  await db.from("ingredients").upsert(INGREDIENTS.map((i) => ({ key: i.key, label_en: i.label, categories: i.categories }))),
  "ingredients",
);
console.log(`Ingredients: ${INGREDIENTS.length} synced`);

// 2. Ingredient terms (only missing ones)
const termRows = TERMS.map(([term_zh, ingredient_key, variants = [], note = null]) => ({ term_zh, ingredient_key, variants, note }));
const terms = check(
  await db.from("ingredient_terms").upsert(termRows, { onConflict: "term_zh,ingredient_key", ignoreDuplicates: true }).select("id"),
  "ingredient_terms",
);
console.log(`Ingredient terms: ${terms?.length ?? 0} added (${TERMS.length} in seed file)`);

// 3. Dishes as drafts (only names not in the database yet)
const existing = check(await db.from("dishes").select("name_zh"), "dishes");
const known = new Set((existing ?? []).map((d) => d.name_zh));
const newDishes = DISHES.filter((d) => !known.has(d.name_zh)).map((d) => ({
  name_zh: d.name_zh,
  aliases: d.aliases ?? [],
  jyutping: d.jyutping,
  name_en: d.name_en,
  description_en: d.description_en,
  category: d.category,
  source_url: d.source_url,
  ingredients: d.ingredients.map(([key, certainty]) => ({ key, certainty })),
  status: "draft",
}));
if (newDishes.length) check(await db.from("dishes").insert(newDishes), "dishes insert");
console.log(`Dishes: ${newDishes.length} added as draft (${DISHES.length} in seed file)`);

// 4. Staff phrases, not reviewed (only the ones missing, by restriction and Chinese text)
const { data: oldPhrases } = await db.from("staff_phrases").select("restriction_key, text_zh");
const havePhrase = new Set((oldPhrases ?? []).map((p) => `${p.restriction_key}|${p.text_zh}`));
const newPhrases = PHRASES.filter(([key, zh]) => !havePhrase.has(`${key}|${zh}`));
if (newPhrases.length) {
  check(
    await db.from("staff_phrases").insert(
      newPhrases.map(([restriction_key, text_zh, jyutping, text_en]) => ({ restriction_key, text_zh, jyutping, text_en, reviewed: false })),
    ),
    "staff_phrases",
  );
}
console.log(`Staff phrases: ${newPhrases.length} added (not reviewed yet)`);
