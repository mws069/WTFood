// Unit tests for the streaming item parser. Run with `npm test`.
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { ItemStreamParser } from "./item-stream.ts";

const ANSWER = JSON.stringify({
  kind: "menu",
  items: [
    { original_text: "叉燒包", notes: 'with "quotes" and } brace', ingredients: [{ key: "pork" }] },
    { original_text: "菠蘿油", notes: null, ingredients: [] },
  ],
});

describe("item stream parser", () => {
  test("whole answer at once → all items, kind found", () => {
    const parser = new ItemStreamParser();
    const items = parser.push(ANSWER) as { original_text: string }[];
    assert.deepEqual(items.map((i) => i.original_text), ["叉燒包", "菠蘿油"]);
    assert.equal(parser.kind, "menu");
  });

  test("character by character → each item once, as soon as it is complete", () => {
    const parser = new ItemStreamParser();
    const seen: { item: string; at: number }[] = [];
    [...ANSWER].forEach((c, at) => {
      for (const item of parser.push(c) as { original_text: string }[]) seen.push({ item: item.original_text, at });
    });
    assert.deepEqual(seen.map((s) => s.item), ["叉燒包", "菠蘿油"]);
    // The first item is handed out before the second one has even started.
    assert.ok(seen[0].at < ANSWER.indexOf("菠蘿油"));
  });

  test("braces and quotes inside strings don't confuse it", () => {
    const parser = new ItemStreamParser();
    const [first] = parser.push(ANSWER) as { notes: string }[];
    assert.equal(first.notes, 'with "quotes" and } brace');
  });

  test("no items yet → nothing", () => {
    assert.deepEqual(new ItemStreamParser().push('{"kind":"label","ite'), []);
  });
});
