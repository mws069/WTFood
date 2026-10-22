// Dietary restrictions a user can choose, and what each one rules out.
// (Icons and colours: components/restriction-icon.tsx.)
// `forbids`: ingredient categories that make a dish unsuitable (red, or
// yellow when the ingredient is only "sometimes" in the dish).
// `caution`: categories that always need a check with staff (yellow), e.g.
// meat for halal, because we can't know how it was slaughtered.
// Imports use relative paths with .ts so `npm test` can run without Next.js.

import type { Category } from "./ingredients.ts";

export type RestrictionGroup = "allergies" | "diets" | "religious";

export type Restriction = {
  key: string;
  label: string;
  group: RestrictionGroup;
  forbids: Category[];
  caution?: Category[];
};

export const RESTRICTION_GROUPS: { key: RestrictionGroup; label: string }[] = [
  { key: "allergies", label: "Allergies & intolerances" },
  { key: "diets", label: "Diets" },
  { key: "religious", label: "Religious & other" },
];

const VEGETARIAN: Category[] = ["meat", "poultry", "fish", "crustacean", "mollusc", "animal_fat", "gelatin"];

export const RESTRICTIONS: Restriction[] = [
  { key: "lactose", label: "Lactose / milk", group: "allergies", forbids: ["milk"] },
  { key: "gluten", label: "Gluten", group: "allergies", forbids: ["gluten"] },
  { key: "peanut", label: "Peanut", group: "allergies", forbids: ["peanut"] },
  { key: "tree_nuts", label: "Tree nuts", group: "allergies", forbids: ["tree_nut"] },
  { key: "shellfish", label: "Shellfish & crustaceans", group: "allergies", forbids: ["crustacean", "mollusc"] },
  { key: "egg", label: "Egg", group: "allergies", forbids: ["egg"] },
  { key: "fish", label: "Fish", group: "allergies", forbids: ["fish"] },
  { key: "soy", label: "Soy", group: "allergies", forbids: ["soy"] },
  { key: "sesame", label: "Sesame", group: "allergies", forbids: ["sesame"] },
  { key: "vegetarian", label: "Vegetarian", group: "diets", forbids: VEGETARIAN },
  { key: "vegan", label: "Vegan", group: "diets", forbids: [...VEGETARIAN, "egg", "milk", "honey"] },
  { key: "halal", label: "Halal", group: "religious", forbids: ["pork", "alcohol"], caution: ["meat", "gelatin"] },
  { key: "no_pork", label: "No pork", group: "religious", forbids: ["pork"] },
  { key: "no_beef", label: "No beef", group: "religious", forbids: ["beef"] },
  { key: "no_alcohol", label: "No alcohol", group: "religious", forbids: ["alcohol"] },
];

export const RESTRICTION_KEYS = RESTRICTIONS.map((r) => r.key);

export function restrictionByKey(key: string) {
  return RESTRICTIONS.find((r) => r.key === key);
}
