import type { DishCategory } from "./scan-schema.ts";

// Order helper: the dishes a user picked on the results, as lines in
// Chinese to show the staff. Nothing is ordered or paid in the app.

// Common requests in Hong Kong restaurants (走 = without, 少 = less).
export const ORDER_OPTIONS = {
  no_ice: { zh: "走冰", en: "No ice" },
  less_ice: { zh: "少冰", en: "Less ice" },
  less_sweet: { zh: "少甜", en: "Less sweet" },
  no_sugar: { zh: "走甜", en: "No sugar" },
  hot: { zh: "熱", en: "Hot" },
  cold: { zh: "凍", en: "Cold" },
  no_spring_onion: { zh: "走蔥", en: "No spring onion" },
  no_coriander: { zh: "走芫茜", en: "No coriander" },
  not_spicy: { zh: "走辣", en: "Not spicy" },
  less_spicy: { zh: "少辣", en: "Less spicy" },
  less_oil: { zh: "少油", en: "Less oil" },
  less_salt: { zh: "少鹽", en: "Less salt" },
  no_msg: { zh: "走味精", en: "No MSG" },
  sauce_on_side: { zh: "汁另上", en: "Sauce on the side" },
  hot_drink: { zh: "熱飲", en: "Hot drink" },
  cold_drink: { zh: "凍飲", en: "Cold drink" },
} as const;
export type OrderOption = keyof typeof ORDER_OPTIONS;

// The requests that make sense for each kind of dish.
export const OPTIONS_BY_CATEGORY: Record<DishCategory | "unknown", OrderOption[]> = {
  drink: ["hot", "cold", "no_ice", "less_ice", "less_sweet", "no_sugar"],
  snack: ["no_spring_onion", "not_spicy", "sauce_on_side", "less_oil"],
  main: ["no_spring_onion", "no_coriander", "not_spicy", "less_spicy", "less_oil", "less_salt", "sauce_on_side"],
  soup: ["no_spring_onion", "no_coriander", "less_salt", "no_msg"],
  side: ["no_spring_onion", "less_oil", "less_salt", "sauce_on_side"],
  dessert: ["hot", "cold", "less_sweet", "no_ice"],
  set: ["hot_drink", "cold_drink", "no_spring_onion", "less_oil", "sauce_on_side"],
  packaged: [],
  other: ["no_spring_onion", "not_spicy", "less_oil", "less_sweet"],
  unknown: ["no_spring_onion", "not_spicy", "less_oil", "less_sweet", "hot", "cold"],
};

// Order card: dishes grouped by kind, in the order a meal is usually ordered,
// with the group name in Chinese for the staff.
export const CATEGORY_ORDER: (DishCategory | "unknown")[] = ["set", "main", "snack", "soup", "side", "dessert", "drink", "packaged", "other", "unknown"];
export const CATEGORY_ZH: Record<DishCategory | "unknown", string> = {
  set: "套餐",
  main: "主菜",
  snack: "小食・點心",
  soup: "湯",
  side: "配菜",
  dessert: "甜品",
  drink: "飲品",
  packaged: "包裝食品",
  other: "其他",
  unknown: "其他",
};

export function groupByCategory<T extends { category: DishCategory | null }>(entries: T[]) {
  return CATEGORY_ORDER.map((category) => ({
    category,
    entries: entries.filter((e) => (e.category ?? "unknown") === category),
  })).filter((group) => group.entries.length > 0);
}

// Requests that exclude each other: choosing one removes the other.
const EXCLUSIVE: [OrderOption, OrderOption][] = [
  ["hot", "cold"],
  ["no_ice", "less_ice"],
  ["less_sweet", "no_sugar"],
  ["not_spicy", "less_spicy"],
  ["hot_drink", "cold_drink"],
];

export function toggleOption(options: OrderOption[], option: OrderOption): OrderOption[] {
  if (options.includes(option)) return options.filter((o) => o !== option);
  const excluded = EXCLUSIVE.flatMap(([a, b]) => (a === option ? [b] : b === option ? [a] : []));
  return [...options.filter((o) => !excluded.includes(o)), option];
}

// A request the user wrote themselves, translated by the translator.
export type CustomRequest = { zh: string; en: string };

export type OrderEntry = {
  menu_number: string | null;
  original_text: string;
  name_en: string;
  qty: number;
  options: OrderOption[];
  custom: CustomRequest[];
};

// One line of the order card: number, dish, quantity and requests in Chinese
// with English below each.
export function orderLine(entry: OrderEntry) {
  return {
    number: entry.menu_number,
    zh: entry.original_text,
    en: entry.name_en,
    qty: entry.qty,
    requests: [...entry.options.map((o) => ({ zh: ORDER_OPTIONS[o].zh, en: ORDER_OPTIONS[o].en })), ...entry.custom],
  };
}

// Total in HK$, or null if a picked dish has no price.
export function orderTotal(entries: { qty: number; price: number | null }[]): number | null {
  if (entries.some((e) => e.price === null)) return null;
  return entries.reduce((sum, e) => sum + e.qty * (e.price ?? 0), 0);
}
