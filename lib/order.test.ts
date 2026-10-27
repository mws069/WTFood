// Unit tests for the order helper. Run with `npm test`.
import assert from "node:assert/strict";
import { test } from "node:test";
import { OPTIONS_BY_CATEGORY, orderLine, orderTotal, toggleOption } from "./order.ts";

test("number, dish, quantity, requests and own requests", () => {
  const line = orderLine({
    menu_number: "12",
    original_text: "叉燒包",
    name_en: "Char siu bun",
    qty: 2,
    options: ["no_spring_onion"],
    custom: [{ zh: "唔該分開兩碟", en: "On two plates, please" }],
  });
  assert.equal(line.number, "12");
  assert.equal(line.qty, 2);
  assert.deepEqual(line.requests, [
    { zh: "走蔥", en: "No spring onion" },
    { zh: "唔該分開兩碟", en: "On two plates, please" },
  ]);
});

test("hot and cold, no ice and less ice exclude each other", () => {
  assert.deepEqual(toggleOption(["hot", "less_sweet"], "cold"), ["less_sweet", "cold"]);
  assert.deepEqual(toggleOption(["no_ice"], "less_ice"), ["less_ice"]);
  assert.deepEqual(toggleOption(["no_ice"], "no_ice"), []);
});

test("requests fit the kind of dish", () => {
  assert.ok(OPTIONS_BY_CATEGORY.drink.includes("no_ice"));
  assert.ok(!OPTIONS_BY_CATEGORY.drink.includes("no_spring_onion"));
  assert.ok(OPTIONS_BY_CATEGORY.main.includes("no_spring_onion"));
});

test("total only when every dish has a price", () => {
  assert.equal(orderTotal([{ qty: 2, price: 15 }, { qty: 1, price: 28 }]), 58);
  assert.equal(orderTotal([{ qty: 1, price: 15 }, { qty: 1, price: null }]), null);
});
