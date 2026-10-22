// Unit tests for the rule engine. Run with `npm test`.
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { INGREDIENTS } from "./ingredients.ts";
import { RESTRICTIONS } from "./restrictions.ts";
import { verdictFor, type Certainty, type ItemIngredient } from "./verdict.ts";

const item = (...ingredients: [string, Certainty][]): { ingredients: ItemIngredient[] } => ({
  ingredients: ingredients.map(([key, certainty]) => ({ key, certainty })),
});

// For every restriction: one ingredient it rules out (often a hidden one)
// and one dish that is fine for it.
const CASES: Record<string, { forbidden: string; reason: string; safe: string[] }> = {
  lactose: { forbidden: "evaporated_milk", reason: "Contains evaporated milk", safe: ["rice", "chicken", "soy_sauce"] },
  gluten: { forbidden: "soy_sauce", reason: "Contains soy sauce", safe: ["rice", "rice_noodles", "beef"] },
  peanut: { forbidden: "satay_sauce", reason: "Contains satay sauce", safe: ["rice", "egg", "beef"] },
  tree_nuts: { forbidden: "almond", reason: "Contains almond", safe: ["rice", "peanut", "coconut"] },
  shellfish: { forbidden: "oyster_sauce", reason: "Contains oyster sauce", safe: ["rice", "fish", "pork"] },
  egg: { forbidden: "egg_noodles", reason: "Contains egg noodles", safe: ["rice_noodles", "beef", "soy_sauce"] },
  fish: { forbidden: "fish_sauce", reason: "Contains fish sauce", safe: ["rice", "shrimp", "chicken"] },
  soy: { forbidden: "tofu", reason: "Contains tofu", safe: ["rice", "chicken", "fish_sauce"] },
  sesame: { forbidden: "sesame_oil", reason: "Contains sesame oil", safe: ["rice", "peanut_oil", "chicken"] },
  vegetarian: { forbidden: "lard", reason: "Contains lard", safe: ["rice", "egg", "tofu", "milk"] },
  vegan: { forbidden: "condensed_milk", reason: "Contains condensed milk", safe: ["rice", "tofu", "vegetables"] },
  halal: { forbidden: "chinese_sausage", reason: "Contains Chinese sausage", safe: ["rice", "fish", "vegetables"] },
  no_pork: { forbidden: "char_siu", reason: "Contains char siu (BBQ pork)", safe: ["rice", "beef", "chicken"] },
  no_beef: { forbidden: "beef_stock", reason: "Contains beef stock", safe: ["rice", "pork", "chicken"] },
  no_alcohol: { forbidden: "shaoxing_wine", reason: "Contains Shaoxing cooking wine", safe: ["rice", "pork", "soy_sauce"] },
};

describe("every restriction", () => {
  test("has a test case", () => {
    assert.deepEqual(Object.keys(CASES).sort(), RESTRICTIONS.map((r) => r.key).sort());
  });

  for (const [key, c] of Object.entries(CASES)) {
    describe(key, () => {
      for (const certainty of ["listed", "always", "usually"] as const) {
        test(`forbidden ingredient (${certainty}) → avoid`, () => {
          const result = verdictFor(item(["rice", "always"], [c.forbidden, certainty]), [key]);
          assert.equal(result.verdict, "avoid");
          assert.equal(result.reasons[0].text, c.reason);
        });
      }

      test("forbidden ingredient (sometimes) → check", () => {
        const result = verdictFor(item(["rice", "always"], [c.forbidden, "sometimes"]), [key]);
        assert.equal(result.verdict, "check");
        assert.equal(result.reasons[0].text, c.reason.replace("Contains", "May contain"));
      });

      test("safe dish → ok", () => {
        const result = verdictFor(item(...c.safe.map((k) => [k, "always"] as [string, Certainty])), [key]);
        assert.equal(result.verdict, "ok", JSON.stringify(result.reasons));
        assert.equal(result.reasons.length, 0);
      });
    });
  }
});

describe("hidden ingredients", () => {
  test("lard is not vegetarian", () => assert.equal(verdictFor(item(["lard", "usually"]), ["vegetarian"]).verdict, "avoid"));
  test("shrimp paste is shellfish", () => assert.equal(verdictFor(item(["shrimp_paste", "always"]), ["shellfish"]).verdict, "avoid"));
  test("oyster sauce is not vegetarian", () => assert.equal(verdictFor(item(["oyster_sauce", "usually"]), ["vegetarian"]).verdict, "avoid"));
  test("gelatin is not vegetarian", () => assert.equal(verdictFor(item(["gelatin", "always"]), ["vegetarian"]).verdict, "avoid"));
  test("soy sauce contains gluten", () => assert.equal(verdictFor(item(["soy_sauce", "usually"]), ["gluten"]).verdict, "avoid"));
  test("Chinese sausage contains alcohol", () => assert.equal(verdictFor(item(["chinese_sausage", "always"]), ["no_alcohol"]).verdict, "avoid"));
  test("honey is not vegan", () => assert.equal(verdictFor(item(["honey", "always"]), ["vegan"]).verdict, "avoid"));
  test("egg is vegetarian but not vegan", () => {
    assert.equal(verdictFor(item(["egg", "always"]), ["vegetarian"]).verdict, "ok");
    assert.equal(verdictFor(item(["egg", "always"]), ["vegan"]).verdict, "avoid");
  });
});

describe("halal", () => {
  test("pork → avoid", () => assert.equal(verdictFor(item(["pork", "always"]), ["halal"]).verdict, "avoid"));
  test("cooking wine → avoid", () => assert.equal(verdictFor(item(["shaoxing_wine", "usually"]), ["halal"]).verdict, "avoid"));
  test("other meat → check (slaughter unknown)", () => {
    const result = verdictFor(item(["chicken", "always"], ["rice", "always"]), ["halal"]);
    assert.equal(result.verdict, "check");
    assert.equal(result.reasons[0].text, "Ask if the chicken is halal");
  });
  test("gelatin → check", () => assert.equal(verdictFor(item(["gelatin", "always"]), ["halal"]).verdict, "check"));
  test("pork wins over the caution for other meat", () => {
    const result = verdictFor(item(["chicken", "always"], ["lard", "usually"]), ["halal"]);
    assert.equal(result.verdict, "avoid");
    assert.equal(result.reasons[0].text, "Contains lard");
  });
});

describe("unknown items are never ok", () => {
  test("no ingredients → check", () => assert.equal(verdictFor({ ingredients: [] }, ["peanut"]).verdict, "check"));
  test("not recognised → check", () =>
    assert.equal(verdictFor({ ...item(["rice", "always"]), recognised: false }, ["peanut"]).verdict, "check"));
  test("low OCR confidence → check", () =>
    assert.equal(verdictFor({ ...item(["rice", "always"]), lowConfidence: true }, ["peanut"]).verdict, "check"));
  test("no knowledge-base match (A3) → check", () => {
    const result = verdictFor({ ...item(["rice", "always"]), kbMatched: false }, ["peanut"]);
    assert.equal(result.verdict, "check");
    assert.equal(result.reasons[0].text, "Unknown – please ask staff");
  });
  test("unknown ingredient key → check", () =>
    assert.equal(verdictFor(item(["rice", "always"], ["dragon_fruit_paste", "always"]), ["peanut"]).verdict, "check"));
  test("unknown ingredient does not hide a forbidden one", () =>
    assert.equal(verdictFor(item(["mystery", "always"], ["peanut", "listed"]), ["peanut"]).verdict, "avoid"));
});

describe("several restrictions", () => {
  test("strongest verdict wins and avoid reasons come first", () => {
    const result = verdictFor(item(["lard", "sometimes"], ["peanut", "always"]), ["vegetarian", "peanut"]);
    assert.equal(result.verdict, "avoid");
    assert.deepEqual(result.reasons.map((r) => r.text), ["Contains peanut", "May contain lard"]);
  });
  test("same reason is listed once", () => {
    const result = verdictFor(item(["pork", "always"]), ["vegetarian", "vegan", "no_pork", "halal"]);
    assert.deepEqual(result.reasons.map((r) => r.text), ["Contains pork"]);
  });
  test("no restrictions → ok for known dishes", () =>
    assert.equal(verdictFor(item(["pork", "always"]), []).verdict, "ok"));
  test("unknown restriction keys are ignored", () =>
    assert.equal(verdictFor(item(["rice", "always"]), ["not_a_restriction"]).verdict, "ok"));
});

describe("ingredient data", () => {
  test("keys are unique", () => {
    const keys = INGREDIENTS.map((i) => i.key);
    assert.equal(new Set(keys).size, keys.length);
  });
  test("every restriction rules out at least one known ingredient", () => {
    for (const r of RESTRICTIONS) {
      assert.ok(INGREDIENTS.some((i) => i.categories.some((c) => r.forbids.includes(c))), r.key);
    }
  });
});
