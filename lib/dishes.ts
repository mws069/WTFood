import { z } from "zod";
import type { ItemIngredient } from "@/lib/verdict";

const ingredientsSchema = z.array(
  z.object({ key: z.string(), certainty: z.enum(["listed", "always", "usually", "sometimes"]) }),
);

// The ingredients column is jsonb: validate it instead of trusting it.
// Anything malformed counts as "no ingredients known" (→ Check).
export function parseIngredients(value: unknown): ItemIngredient[] {
  const parsed = ingredientsSchema.safeParse(value);
  return parsed.success ? parsed.data : [];
}

// Lower-case, without spaces, tone numbers or punctuation, so "Char siu",
// "charsiu" and "caa1 siu1" all match.
export function normalizeSearch(text: string) {
  return text.toLowerCase().replace(/[\s\d'’\-–(),.]/g, "");
}

export type DishSearchFields = { name_zh: string; aliases: string[]; jyutping: string | null; name_en: string };

export function dishMatches(dish: DishSearchFields, query: string) {
  const q = normalizeSearch(query);
  if (!q) return true;
  return [dish.name_zh, ...dish.aliases, dish.jyutping ?? "", dish.name_en].some((field) => normalizeSearch(field).includes(q));
}
