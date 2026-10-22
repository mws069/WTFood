// The rule engine: the one place that decides OK / Check / Avoid.
// Every approach (A1, A2, A3) only delivers ingredients with a certainty;
// this file turns them into a verdict for the user's restrictions.
// A model never decides "ok" directly.
//
// Rules (from the brief):
// - forbidden ingredient, certainty listed / always / usually → avoid
// - forbidden ingredient, certainty sometimes                 → check
// - item not recognised, no ingredients, low OCR confidence,
//   no knowledge-base match, or an unknown ingredient key     → check
// - otherwise                                                 → ok
// Plus: "caution" categories of a restriction (halal: meat, gelatin) → check.

import { ingredientByKey } from "./ingredients.ts";
import { restrictionByKey } from "./restrictions.ts";
import { s } from "./strings.ts";

export type Certainty = "listed" | "always" | "usually" | "sometimes";
export type ItemIngredient = { key: string; certainty: Certainty };
export type Verdict = "ok" | "check" | "avoid";

export type VerdictInput = {
  ingredients: ItemIngredient[];
  // false when the approach could not read or identify the item
  recognised?: boolean;
  // true when the OCR confidence for this item was too low
  lowConfidence?: boolean;
  // A3 only: false when no knowledge-base entry was similar enough
  kbMatched?: boolean;
};

export type Reason = {
  level: "avoid" | "check";
  text: string;
  ingredient?: string;
  restriction?: string;
};

export type VerdictResult = { verdict: Verdict; reasons: Reason[] };

const SURE: Certainty[] = ["listed", "always", "usually"];

// "Soy sauce" → "soy sauce", but keep "Shaoxing cooking wine".
function inSentence(ingredient: { label: string; proper?: true }) {
  return ingredient.proper ? ingredient.label : ingredient.label[0].toLowerCase() + ingredient.label.slice(1);
}

export function verdictFor(item: VerdictInput, restrictionKeys: string[]): VerdictResult {
  const unknown: VerdictResult = { verdict: "check", reasons: [{ level: "check", text: s.verdict.unknown }] };
  if (item.recognised === false || item.lowConfidence || item.kbMatched === false || item.ingredients.length === 0) {
    return unknown;
  }

  const restrictions = restrictionKeys.map(restrictionByKey).filter((r) => r !== undefined);
  const reasons: Reason[] = [];
  const add = (reason: Reason) => {
    if (!reasons.some((r) => r.text === reason.text)) reasons.push(reason);
  };

  for (const { key, certainty } of item.ingredients) {
    const ingredient = ingredientByKey(key);
    if (!ingredient) {
      add({ level: "check", text: s.verdict.unknownIngredient, ingredient: key });
      continue;
    }
    const name = inSentence(ingredient);

    for (const restriction of restrictions) {
      if (ingredient.categories.some((c) => restriction.forbids.includes(c))) {
        if (SURE.includes(certainty)) {
          add({ level: "avoid", text: s.verdict.contains(name), ingredient: key, restriction: restriction.key });
        } else {
          add({ level: "check", text: s.verdict.mayContain(name), ingredient: key, restriction: restriction.key });
        }
      } else if (ingredient.categories.some((c) => restriction.caution?.includes(c))) {
        add({
          level: "check",
          text: s.verdict.askIf(name, restriction.label.toLowerCase()),
          ingredient: key,
          restriction: restriction.key,
        });
      }
    }
  }

  // Strongest reasons first.
  reasons.sort((a, b) => (a.level === b.level ? 0 : a.level === "avoid" ? -1 : 1));
  const verdict: Verdict = reasons.some((r) => r.level === "avoid") ? "avoid" : reasons.length > 0 ? "check" : "ok";
  return { verdict, reasons };
}
