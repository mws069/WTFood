// Unit tests for the A1 text helpers. Run with `npm test`.
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { findIngredients, looksLikeLabel, splitLabel, splitMenu, stripPrices, type OcrLine } from "./a1-text.ts";

const line = (text: string, confidence = 0.99): OcrLine => ({ text, confidence, box: [0, 0, 0, 0] });

const TERMS = [
  { term: "蛋", key: "egg" },
  { term: "魚蛋", key: "fish_ball" },
  { term: "花生", key: "peanut" },
  { term: "牛油", key: "butter" },
  { term: "牛", key: "beef" },
  { term: "小麥粉", key: "wheat_flour" },
  { term: "芝麻", key: "sesame" },
  { term: "蠔油", key: "oyster_sauce" },
];

describe("prices and menus", () => {
  test("removes prices", () => {
    assert.equal(stripPrices("叉燒包 $15"), "叉燒包");
    assert.equal(stripPrices("乾炒牛河 HK$58.5"), "乾炒牛河");
    assert.equal(stripPrices("奶茶 18元"), "奶茶");
  });
  test("every Chinese line is an item, headers and prices are dropped", () => {
    const items = splitMenu([line("餐牌"), line("茶餐廳 餐牌"), line("叉燒包 $15", 0.95), line("$12"), line("Tea set"), line("蠔油菜心")]);
    assert.deepEqual(items.map((i) => i.text), ["叉燒包", "蠔油菜心"]);
    assert.equal(items[0].confidence, 0.95);
  });
});

describe("menu numbers", () => {
  test("a number at the start becomes the menu number", () => {
    const items = splitMenu([line("12. 叉燒包 $15"), line("A3 菠蘿油"), line("B-05、奶茶"), line("蠔油菜心")]);
    assert.deepEqual(items.map((i) => [i.number, i.text]), [["12", "叉燒包"], ["A3", "菠蘿油"], ["B-05", "奶茶"], [null, "蠔油菜心"]]);
    assert.deepEqual(items.map((i) => i.price), ["$15", null, null, null]);
  });
});

describe("labels", () => {
  test("detects a label", () => {
    assert.equal(looksLikeLabel([line("配料：小麥粉")]), true);
    assert.equal(looksLikeLabel([line("叉燒包")]), false);
  });
  test("takes the ingredient list and allergen statements", () => {
    const [item] = splitLabel([line("牛油曲奇"), line("配料：小麥粉、牛油、雞蛋"), line("營養成分表"), line("致敏物質：含有花生。可能含有芝麻。")]);
    assert.equal(item.text, "牛油曲奇");
    assert.match(item.ingredientText, /小麥粉、牛油、雞蛋/);
    assert.doesNotMatch(item.ingredientText, /營養/);
    assert.match(item.ingredientText, /可能含有芝麻/);
  });
  test("nutrition table only → no ingredient text", () => {
    const [item] = splitLabel([line("营养成分表"), line("能量"), line("2301千焦(kJ)")]);
    assert.equal(item.ingredientText, "");
    assert.equal(item.text, "食品標籤");
  });
  test("a product name that starts like a nutrient is kept", () => {
    assert.equal(splitLabel([line("能量"), line("糖醋排骨"), line("配料：豬肉")])[0].text, "糖醋排骨");
  });
});

describe("dictionary lookup", () => {
  test("finds terms literally written", () => {
    assert.deepEqual(findIngredients("蠔油菜心", TERMS), [{ key: "oyster_sauce", certainty: "listed" }]);
  });
  test("longest term wins: 魚蛋 is not egg", () => {
    assert.deepEqual(findIngredients("咖喱魚蛋", TERMS), [{ key: "fish_ball", certainty: "listed" }]);
  });
  test("牛油 (butter) is not beef", () => {
    assert.deepEqual(findIngredients("菠蘿油牛油", TERMS).map((i) => i.key), ["butter"]);
  });
  test("may contain → sometimes, contains → listed", () => {
    const found = findIngredients("含有花生。可能含有芝麻", TERMS);
    assert.deepEqual(found, [{ key: "peanut", certainty: "listed" }, { key: "sesame", certainty: "sometimes" }]);
  });
  test("listed beats sometimes for the same ingredient", () => {
    assert.deepEqual(findIngredients("可能含有花生。花生", TERMS), [{ key: "peanut", certainty: "listed" }]);
  });
  test("nothing found → empty", () => {
    assert.deepEqual(findIngredients("白飯", TERMS), []);
  });
});
