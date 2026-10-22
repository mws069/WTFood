// All ingredients the app knows, with the categories the restrictions check.
// This file is the single source: the rule engine reads it directly and
// `npm run db:seed` copies it into the `ingredients` table.
//
// Categories: milk, egg, gluten, peanut, tree_nut, soy, sesame, fish,
// crustacean, mollusc, meat, pork, beef, lamb, poultry, animal_fat, gelatin,
// honey, alcohol. Hidden ingredients get every category they can bring in
// (e.g. soy sauce = soy + gluten, Chinese sausage = pork + alcohol).

export type Category =
  | "milk"
  | "egg"
  | "gluten"
  | "peanut"
  | "tree_nut"
  | "soy"
  | "sesame"
  | "fish"
  | "crustacean"
  | "mollusc"
  | "meat"
  | "pork"
  | "beef"
  | "lamb"
  | "poultry"
  | "animal_fat"
  | "gelatin"
  | "honey"
  | "alcohol";

// `proper`: the label starts with a name and keeps its capital letter in
// sentences ("Contains Shaoxing cooking wine").
export type Ingredient = { key: string; label: string; categories: Category[]; proper?: true };

export const INGREDIENTS: Ingredient[] = [
  // Dairy
  { key: "milk", label: "Milk", categories: ["milk"] },
  { key: "evaporated_milk", label: "Evaporated milk", categories: ["milk"] },
  { key: "condensed_milk", label: "Condensed milk", categories: ["milk"] },
  { key: "butter", label: "Butter", categories: ["milk"] },
  { key: "cheese", label: "Cheese", categories: ["milk"] },
  { key: "cream", label: "Cream", categories: ["milk"] },
  { key: "milk_powder", label: "Milk powder", categories: ["milk"] },

  // Egg
  { key: "egg", label: "Egg", categories: ["egg"] },
  { key: "custard", label: "Custard", categories: ["egg", "milk"] },

  // Grains and gluten
  { key: "wheat_flour", label: "Wheat flour", categories: ["gluten"] },
  { key: "wheat_noodles", label: "Wheat noodles", categories: ["gluten"] },
  { key: "egg_noodles", label: "Egg noodles", categories: ["gluten", "egg"] },
  { key: "bread", label: "Bread", categories: ["gluten"] },
  { key: "barley", label: "Barley", categories: ["gluten"] },
  { key: "rye", label: "Rye", categories: ["gluten"] },
  { key: "rice", label: "Rice", categories: [] },
  { key: "glutinous_rice", label: "Glutinous rice", categories: [] },
  { key: "rice_noodles", label: "Rice noodles", categories: [] },
  { key: "rice_flour", label: "Rice flour", categories: [] },
  { key: "corn_starch", label: "Corn starch", categories: [] },
  { key: "tapioca_starch", label: "Tapioca starch", categories: [] },

  // Sauces and seasonings (often hidden)
  { key: "soy_sauce", label: "Soy sauce", categories: ["soy", "gluten"] },
  { key: "oyster_sauce", label: "Oyster sauce", categories: ["mollusc", "gluten"] },
  { key: "hoisin_sauce", label: "Hoisin sauce", categories: ["soy", "gluten"] },
  { key: "black_bean_sauce", label: "Fermented black beans", categories: ["soy"] },
  { key: "fish_sauce", label: "Fish sauce", categories: ["fish"] },
  { key: "shrimp_paste", label: "Shrimp paste", categories: ["crustacean"] },
  { key: "xo_sauce", label: "XO sauce", categories: ["crustacean", "mollusc", "pork", "meat"], proper: true },
  { key: "satay_sauce", label: "Satay sauce", categories: ["peanut", "crustacean"] },
  { key: "char_siu_sauce", label: "Char siu sauce", categories: ["soy", "gluten", "honey"] },
  { key: "shaoxing_wine", label: "Shaoxing cooking wine", categories: ["alcohol", "gluten"], proper: true },
  { key: "rice_wine", label: "Rice wine", categories: ["alcohol"] },
  { key: "beer", label: "Beer", categories: ["alcohol", "gluten"] },
  { key: "sesame_oil", label: "Sesame oil", categories: ["sesame"] },
  { key: "chicken_powder", label: "Chicken powder", categories: ["poultry", "meat"] },
  { key: "curry_sauce", label: "Curry sauce", categories: [] },
  { key: "vinegar", label: "Vinegar", categories: [] },
  { key: "sugar", label: "Sugar", categories: [] },
  { key: "salt", label: "Salt", categories: [] },
  { key: "msg", label: "MSG", categories: [], proper: true },
  { key: "chili", label: "Chili", categories: [] },
  { key: "garlic", label: "Garlic", categories: [] },
  { key: "ginger", label: "Ginger", categories: [] },
  { key: "spring_onion", label: "Spring onion", categories: [] },
  { key: "vegetable_oil", label: "Vegetable oil", categories: [] },
  { key: "honey", label: "Honey", categories: ["honey"] },

  // Nuts and seeds
  { key: "peanut", label: "Peanut", categories: ["peanut"] },
  { key: "peanut_oil", label: "Peanut oil", categories: ["peanut"] },
  { key: "almond", label: "Almond", categories: ["tree_nut"] },
  { key: "cashew", label: "Cashew", categories: ["tree_nut"] },
  { key: "walnut", label: "Walnut", categories: ["tree_nut"] },
  { key: "sesame", label: "Sesame", categories: ["sesame"] },
  { key: "coconut", label: "Coconut", categories: [] },

  // Soy
  { key: "tofu", label: "Tofu", categories: ["soy"] },
  { key: "soy_milk", label: "Soy milk", categories: ["soy"] },
  { key: "bean_curd_skin", label: "Bean curd skin", categories: ["soy"] },
  { key: "soybean", label: "Soybean", categories: ["soy"] },

  // Fish and seafood
  { key: "fish", label: "Fish", categories: ["fish"] },
  { key: "fish_ball", label: "Fish ball", categories: ["fish"] },
  { key: "shrimp", label: "Shrimp", categories: ["crustacean"] },
  { key: "dried_shrimp", label: "Dried shrimp", categories: ["crustacean"] },
  { key: "crab", label: "Crab", categories: ["crustacean"] },
  { key: "lobster", label: "Lobster", categories: ["crustacean"] },
  { key: "oyster", label: "Oyster", categories: ["mollusc"] },
  { key: "scallop", label: "Scallop", categories: ["mollusc"] },
  { key: "dried_scallop", label: "Dried scallop", categories: ["mollusc"] },
  { key: "squid", label: "Squid", categories: ["mollusc"] },
  { key: "cuttlefish", label: "Cuttlefish", categories: ["mollusc"] },
  { key: "clam", label: "Clam", categories: ["mollusc"] },
  { key: "abalone", label: "Abalone", categories: ["mollusc"] },

  // Meat
  { key: "pork", label: "Pork", categories: ["pork", "meat"] },
  { key: "lard", label: "Lard", categories: ["pork", "animal_fat", "meat"] },
  { key: "char_siu", label: "Char siu (BBQ pork)", categories: ["pork", "meat", "soy", "gluten", "honey"] },
  { key: "ham", label: "Ham", categories: ["pork", "meat"] },
  { key: "spam", label: "Luncheon meat", categories: ["pork", "meat"] },
  { key: "chinese_sausage", label: "Chinese sausage", categories: ["pork", "meat", "alcohol"], proper: true },
  { key: "pork_stock", label: "Pork stock", categories: ["pork", "meat"] },
  { key: "beef", label: "Beef", categories: ["beef", "meat"] },
  { key: "beef_stock", label: "Beef stock", categories: ["beef", "meat"] },
  { key: "lamb", label: "Lamb", categories: ["lamb", "meat"] },
  { key: "chicken", label: "Chicken", categories: ["poultry", "meat"] },
  { key: "chicken_stock", label: "Chicken stock", categories: ["poultry", "meat"] },
  { key: "duck", label: "Duck", categories: ["poultry", "meat"] },
  { key: "goose", label: "Goose", categories: ["poultry", "meat"] },
  { key: "gelatin", label: "Gelatin", categories: ["gelatin"] },

  // Vegetables and others
  { key: "vegetables", label: "Vegetables", categories: [] },
  { key: "mushroom", label: "Mushroom", categories: [] },
  { key: "potato", label: "Potato", categories: [] },
  { key: "tomato", label: "Tomato", categories: [] },
  { key: "pineapple", label: "Pineapple", categories: [] },
  { key: "red_bean", label: "Red bean", categories: [] },
  { key: "mango", label: "Mango", categories: [] },
  { key: "tea", label: "Tea", categories: [] },
];

const BY_KEY = new Map(INGREDIENTS.map((i) => [i.key, i]));

export function ingredientByKey(key: string): Ingredient | undefined {
  return BY_KEY.get(key);
}

export const INGREDIENT_KEYS = INGREDIENTS.map((i) => i.key);
