// A1 (classic baseline, no AI): turn OCR text lines into items and find the
// ingredients that are literally written in the text, using the Chinese
// ingredient terms of our knowledge base. Pure functions, unit-tested.
// Relative imports with .ts so `npm test` can run without Next.js.

import type { Certainty } from "./verdict.ts";

export type OcrLine = { text: string; confidence: number; box: [number, number, number, number] | number[] };
export type Term = { term: string; key: string };
export type A1Item = { text: string; confidence: number; ingredientText: string };
export type FoundIngredient = { key: string; certainty: Certainty };

const CJK = /[㐀-鿿豈-﫿]/;
const PRICE = /(?:HK)?\$\s*\d+(?:\.\d+)?|\d+(?:\.\d+)?\s*(?:元|蚊|毫子)|[¥￥]\s*\d+(?:\.\d+)?/g;
// Words that only label the menu or the table, not a dish.
const HEADER = /^(?:餐牌|菜單|菜单|價目表?|价目表?|menu|營養成分表|营养成分表|營養標籤|项目|項目|每\d+.*|nrv%?|.*參考值|.*参考值)$/i;
// Short titles such as "茶餐廳 餐牌" or "午市菜單".
const MENU_TITLE = /^.{0,6}(?:餐牌|菜單|菜单|價目表|价目表)$/;
const LABEL_WORDS = /配料|成分|原料|營養|营养|ingredients|nutrition/i;
const INGREDIENT_START = /(?:配料表?|成分|原料|ingredients)\s*[:：]/i;
const INGREDIENT_END = /(?:致敏|過敏|过敏|營養|营养|保存|貯存|贮存|淨重|净重|產地|产地|生產|生产|保質期|保质期|食用方法|製造|制造)/;
const ALLERGEN_PART = /(?:致敏物質|致敏物质|過敏原|过敏原|含有|可能含有|may contain|contains)[^。;；\n]*/gi;
const MAYBE = /可能含有|可能含|may contain/i;

export function stripPrices(text: string) {
  return text.replace(PRICE, " ").replace(/\s+/g, " ").trim();
}

export function looksLikeLabel(lines: OcrLine[]) {
  return lines.some((l) => LABEL_WORDS.test(l.text));
}

// Menus and kiosks: every line with Chinese text (prices removed) is an item.
export function splitMenu(lines: OcrLine[]): A1Item[] {
  const items: A1Item[] = [];
  for (const line of lines) {
    const text = stripPrices(line.text);
    if (!CJK.test(text) || HEADER.test(text) || MENU_TITLE.test(text)) continue;
    items.push({ text, confidence: line.confidence, ingredientText: text });
  }
  return items;
}

// Labels: one item for the product. Its ingredients come only from the
// ingredient list and the allergen statements; a nutrition table alone gives
// no ingredients (the rule engine then says "check the package").
export function splitLabel(lines: OcrLine[]): A1Item[] {
  if (lines.length === 0) return [];
  const all = lines.map((l) => l.text).join("\n");
  const name = lines.map((l) => stripPrices(l.text)).find((t) => CJK.test(t) && !HEADER.test(t) && !LABEL_WORDS.test(t)) ?? lines[0].text;
  const confidence = Math.min(...lines.map((l) => l.confidence));

  let ingredientText = "";
  const start = all.search(INGREDIENT_START);
  if (start >= 0) {
    const rest = all.slice(start).replace(INGREDIENT_START, "");
    const end = rest.search(INGREDIENT_END);
    ingredientText = end >= 0 ? rest.slice(0, end) : rest;
  }
  const allergens = all.match(ALLERGEN_PART) ?? [];
  return [{ text: name, confidence, ingredientText: [ingredientText, ...allergens].join("。").replace(/\n/g, "") }];
}

// Longest terms first, and a found term hides the characters it covers, so
// 魚蛋 (fish ball) does not also count as 蛋 (egg). Inside a "may contain"
// clause the certainty is "sometimes", otherwise "listed".
export function findIngredients(text: string, terms: Term[]): FoundIngredient[] {
  const sorted = [...terms].filter((t) => t.term).sort((a, b) => b.term.length - a.term.length);
  const found = new Map<string, Certainty>();

  for (const clause of text.split(/[。;；\n]/)) {
    const certainty: Certainty = MAYBE.test(clause) ? "sometimes" : "listed";
    const used = new Array<boolean>(clause.length).fill(false);
    for (const { term, key } of sorted) {
      let from = 0;
      for (;;) {
        const at = clause.indexOf(term, from);
        if (at < 0) break;
        from = at + 1;
        if (used.slice(at, at + term.length).some(Boolean)) continue;
        used.fill(true, at, at + term.length);
        // "listed" beats "sometimes" if the same ingredient appears in both.
        if (found.get(key) !== "listed") found.set(key, certainty);
      }
    }
  }
  return [...found].map(([key, certainty]) => ({ key, certainty }));
}
