// Order helper: the dishes a user picked on the results, as lines in
// Chinese to show the staff. Nothing is ordered or paid in the app.

// Common requests in Hong Kong restaurants (走 = without).
export const ORDER_OPTIONS = {
  no_spring_onion: { zh: "走蔥", en: "No spring onion" },
  not_spicy: { zh: "走辣", en: "Not spicy" },
  less_oil: { zh: "少油", en: "Less oil" },
  less_sweet: { zh: "少甜", en: "Less sweet" },
  no_ice: { zh: "走冰", en: "No ice" },
  hot: { zh: "熱", en: "Hot" },
  cold: { zh: "凍", en: "Cold" },
} as const;
export type OrderOption = keyof typeof ORDER_OPTIONS;

export type OrderEntry = { menu_number: string | null; original_text: string; name_en: string; qty: number; options: OrderOption[] };

// "12號 叉燒包 × 2（走蔥）"
export function orderLine(entry: OrderEntry) {
  const options = entry.options.map((o) => ORDER_OPTIONS[o]);
  const number = entry.menu_number ? `${entry.menu_number}號 ` : "";
  return {
    zh: `${number}${entry.original_text} × ${entry.qty}${options.length ? `（${options.map((o) => o.zh).join("，")}）` : ""}`,
    en: `${entry.menu_number ? `No. ${entry.menu_number} ` : ""}${entry.name_en} × ${entry.qty}${options.length ? ` (${options.map((o) => o.en.toLowerCase()).join(", ")})` : ""}`,
  };
}
