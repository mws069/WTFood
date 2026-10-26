// Unit tests for the order helper. Run with `npm test`.
import assert from "node:assert/strict";
import { test } from "node:test";
import { orderLine } from "./order.ts";

test("number, dish, quantity and requests", () => {
  assert.deepEqual(orderLine({ menu_number: "12", original_text: "叉燒包", name_en: "Char siu bun", qty: 2, options: ["no_spring_onion", "less_oil"] }), {
    zh: "12號 叉燒包 × 2（走蔥，少油）",
    en: "No. 12 Char siu bun × 2 (no spring onion, less oil)",
  });
});

test("without number and requests", () => {
  assert.equal(orderLine({ menu_number: null, original_text: "凍檸茶", name_en: "Iced lemon tea", qty: 1, options: [] }).zh, "凍檸茶 × 1");
});
