// Dietary restrictions a user can choose. The ingredient categories each
// restriction forbids are added in milestone 3 together with the rule engine.

export type RestrictionGroup = "allergies" | "diets" | "religious";

export type Restriction = {
  key: string;
  label: string;
  emoji: string;
  group: RestrictionGroup;
};

export const RESTRICTION_GROUPS: { key: RestrictionGroup; label: string }[] = [
  { key: "allergies", label: "Allergies & intolerances" },
  { key: "diets", label: "Diets" },
  { key: "religious", label: "Religious & other" },
];

export const RESTRICTIONS: Restriction[] = [
  { key: "lactose", label: "Lactose / milk", emoji: "🥛", group: "allergies" },
  { key: "gluten", label: "Gluten", emoji: "🌾", group: "allergies" },
  { key: "peanut", label: "Peanut", emoji: "🥜", group: "allergies" },
  { key: "tree_nuts", label: "Tree nuts", emoji: "🌰", group: "allergies" },
  { key: "shellfish", label: "Shellfish & crustaceans", emoji: "🦐", group: "allergies" },
  { key: "egg", label: "Egg", emoji: "🥚", group: "allergies" },
  { key: "fish", label: "Fish", emoji: "🐟", group: "allergies" },
  { key: "soy", label: "Soy", emoji: "🫘", group: "allergies" },
  { key: "sesame", label: "Sesame", emoji: "⚪", group: "allergies" },
  { key: "vegetarian", label: "Vegetarian", emoji: "🥦", group: "diets" },
  { key: "vegan", label: "Vegan", emoji: "🌱", group: "diets" },
  { key: "halal", label: "Halal", emoji: "☪️", group: "religious" },
  { key: "no_pork", label: "No pork", emoji: "🐖", group: "religious" },
  { key: "no_beef", label: "No beef", emoji: "🐄", group: "religious" },
  { key: "no_alcohol", label: "No alcohol", emoji: "🍶", group: "religious" },
];

export const RESTRICTION_KEYS = RESTRICTIONS.map((r) => r.key);

export function restrictionByKey(key: string) {
  return RESTRICTIONS.find((r) => r.key === key);
}
