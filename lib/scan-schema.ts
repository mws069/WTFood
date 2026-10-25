import { z } from "zod";
import { CATEGORIES, INGREDIENT_KEYS } from "@/lib/ingredients";

// Shared output format of every approach (A1, A2, A3), from the brief.
// The model must answer exactly in this shape; anything else is rejected.

export const KINDS = ["menu", "kiosk", "label"] as const;
export type Kind = (typeof KINDS)[number];

// "other" lets the model report an ingredient we have no key for. It then
// names it and says which categories it brings in (e.g. whey powder → milk);
// the rule engine evaluates those and marks the reasons "not verified".
const ingredientKey = z.enum(["other", ...INGREDIENT_KEYS] as [string, ...string[]]);

export const modelItemSchema = z.object({
  original_text: z.string().describe("The item's text exactly as written on the photo (Chinese)"),
  name_en: z.string().describe("Natural English name of the dish, not a word-by-word translation"),
  jyutping: z.string().nullable().describe("Cantonese Jyutping with tone numbers, or null if unsure"),
  description_en: z.string().nullable().describe("One short sentence describing the dish, or null"),
  recognised: z.boolean().describe("false if the text is unreadable or you don't know what dish it is"),
  ingredients: z.array(
    z.object({
      key: ingredientKey,
      name_en: z.string().describe("English name of the ingredient"),
      categories: z.array(z.enum(CATEGORIES as [string, ...string[]])).describe('Only for key "other": the categories it belongs to'),
      certainty: z.enum(["listed", "always", "usually", "sometimes"]),
    }),
  ),
  notes: z.string().nullable().describe("Short note, e.g. that no ingredient list is visible"),
});

export const modelScanSchema = z.object({
  kind: z.enum(KINDS),
  items: z.array(modelItemSchema),
});

export type ModelScan = z.infer<typeof modelScanSchema>;
export type ModelItem = z.infer<typeof modelItemSchema>;

export type Approach = "A1" | "A2" | "A3";

export type ScanResult = {
  approach: Approach;
  kind: Kind;
  items: ModelItem[];
  latency_ms: number;
  cost_usd: number | null;
};
