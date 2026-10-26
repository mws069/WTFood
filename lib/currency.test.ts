// Unit tests for price parsing and conversion. Run with `npm test`.
import assert from "node:assert/strict";
import { test } from "node:test";
import { formatConverted, isCurrency, priceNumber } from "./currency.ts";

test("prices as printed on menus", () => {
  assert.equal(priceNumber("$12"), 12);
  assert.equal(priceNumber("HK$35.5"), 35.5);
  assert.equal(priceNumber("1,280元"), 1280);
  assert.equal(priceNumber("free"), null);
  assert.equal(priceNumber(null), null);
});

test("converted value in the user's currency", () => {
  assert.equal(formatConverted(12, "EUR", 0.114), "≈ €1.37");
  assert.equal(formatConverted(12, "USD", 0.1286), "≈ $1.54");
  assert.equal(formatConverted(100, "JPY", 19.4), "≈ ¥1,940");
});

test("only known currencies", () => {
  assert.equal(isCurrency("USD"), true);
  assert.equal(isCurrency("HKD"), false);
  assert.equal(isCurrency("XYZ"), false);
});
