// Unit tests for the A3 retrieval. Run with `npm test`.
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { bigrams, nearestDishes, similarity } from "./a3-match.ts";

const DISHES = [
  { id: 1, name_zh: "菠蘿包", aliases: [] },
  { id: 2, name_zh: "菠蘿油", aliases: [] },
  { id: 3, name_zh: "叉燒包", aliases: [] },
  { id: 4, name_zh: "叉燒飯", aliases: [] },
  { id: 5, name_zh: "港式奶茶", aliases: ["奶茶", "絲襪奶茶"] },
  { id: 6, name_zh: "油炸鬼", aliases: ["油條"] },
];

describe("bigrams", () => {
  test("only Chinese characters count", () => {
    assert.deepEqual(bigrams("叉燒包 $15 Char siu bao"), ["叉燒", "燒包"]);
  });
  test("a single character is its own bigram", () => {
    assert.deepEqual(bigrams("粥"), ["粥"]);
    assert.deepEqual(bigrams("Tea"), []);
  });
});

describe("similarity", () => {
  test("same text → 1, nothing in common → 0", () => {
    assert.equal(similarity("叉燒包", "叉燒包"), 1);
    assert.equal(similarity("叉燒包", "蝦餃"), 0);
    assert.equal(similarity("Tea", "叉燒包"), 0);
  });
  test("partly the same", () => {
    assert.equal(similarity("菠蘿油", "菠蘿包"), 0.5);
    assert.equal(similarity("叉燒", "叉燒包"), 2 / 3);
  });
});

describe("nearest dishes", () => {
  test("exact name first, then similar ones", () => {
    const found = nearestDishes("菠蘿油", DISHES, 3, 0.5);
    assert.deepEqual(found.map((m) => m.dish.id), [2, 1]);
    assert.equal(found[0].similarity, 1);
  });
  test("aliases count", () => {
    assert.equal(nearestDishes("油條", DISHES, 3, 0.5)[0].dish.id, 6);
    assert.equal(nearestDishes("凍奶茶", DISHES, 3, 0.5)[0].dish.id, 5);
  });
  test("at most k, best first", () => {
    const found = nearestDishes("叉燒包飯", DISHES, 1, 0.3);
    assert.equal(found.length, 1);
  });
  test("nothing similar enough → empty (the item becomes Check)", () => {
    assert.deepEqual(nearestDishes("避風塘炒蟹", DISHES, 3, 0.5), []);
  });
});
