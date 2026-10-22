// About 50 common Hong Kong dishes as DRAFTS. Ingredients and certainty are
// a first guess from typical recipes; the team verifies each dish (and its
// source) in the Lab before users see it.
import type { Certainty } from "../../lib/verdict.ts";

export type SeedDish = {
  name_zh: string;
  aliases?: string[];
  jyutping: string;
  name_en: string;
  description_en: string;
  category: string;
  source_url: string;
  ingredients: [string, Certainty][];
};

const W = "https://en.wikipedia.org/wiki/";

export const DISHES: SeedDish[] = [
  // Bakery and cha chaan teng
  {
    name_zh: "菠蘿包", jyutping: "bo1 lo4 baau1", name_en: "Pineapple bun", category: "bakery", source_url: W + "Pineapple_bun",
    description_en: "Sweet bun with a crunchy sugar crust. Contains no pineapple – the name comes from the look of the crust.",
    ingredients: [["wheat_flour", "always"], ["sugar", "always"], ["egg", "usually"], ["butter", "usually"], ["milk_powder", "usually"], ["lard", "sometimes"]],
  },
  {
    name_zh: "菠蘿油", jyutping: "bo1 lo4 jau4", name_en: "Pineapple bun with butter", category: "bakery", source_url: W + "Pineapple_bun",
    description_en: "Warm pineapple bun with a thick slice of cold butter inside.",
    ingredients: [["wheat_flour", "always"], ["sugar", "always"], ["butter", "always"], ["egg", "usually"], ["milk_powder", "usually"], ["lard", "sometimes"]],
  },
  {
    name_zh: "蛋撻", aliases: ["蛋挞"], jyutping: "daan6 taat1", name_en: "Egg tart", category: "bakery", source_url: W + "Egg_tart",
    description_en: "Pastry shell filled with sweet egg custard.",
    ingredients: [["wheat_flour", "always"], ["egg", "always"], ["sugar", "always"], ["butter", "usually"], ["evaporated_milk", "usually"], ["lard", "sometimes"]],
  },
  {
    name_zh: "雞尾包", jyutping: "gai1 mei5 baau1", name_en: "Cocktail bun", category: "bakery", source_url: W + "Cocktail_bun",
    description_en: "Sweet bun filled with coconut and butter. Contains no chicken.",
    ingredients: [["wheat_flour", "always"], ["coconut", "always"], ["sugar", "always"], ["butter", "usually"], ["egg", "usually"]],
  },
  {
    name_zh: "腸仔包", jyutping: "coeng2 zai2 baau1", name_en: "Sausage bun", category: "bakery", source_url: W + "Hong_Kong_cuisine",
    description_en: "Soft bun baked around a frankfurter sausage.",
    ingredients: [["wheat_flour", "always"], ["pork", "usually"], ["egg", "usually"], ["butter", "usually"], ["sugar", "always"]],
  },
  {
    name_zh: "豬扒包", jyutping: "zyu1 paa1 baau1", name_en: "Pork chop bun", category: "bakery", source_url: W + "Pork_chop_bun",
    description_en: "Fried marinated pork chop in a crusty bun.",
    ingredients: [["pork", "always"], ["bread", "always"], ["soy_sauce", "usually"], ["butter", "sometimes"]],
  },
  {
    name_zh: "西多士", jyutping: "sai1 do1 si2", name_en: "Hong Kong-style French toast", category: "cha chaan teng", source_url: W + "Hong_Kong-style_French_toast",
    description_en: "Deep-fried egg-dipped toast, usually with peanut butter inside and syrup or condensed milk on top.",
    ingredients: [["bread", "always"], ["egg", "always"], ["peanut", "usually"], ["butter", "always"], ["condensed_milk", "usually"], ["vegetable_oil", "always"]],
  },
  {
    name_zh: "港式奶茶", aliases: ["奶茶"], jyutping: "gong2 sik1 naai5 caa4", name_en: "Hong Kong-style milk tea", category: "drink", source_url: W + "Hong_Kong-style_milk_tea",
    description_en: "Strong black tea with evaporated or condensed milk.",
    ingredients: [["tea", "always"], ["evaporated_milk", "always"], ["condensed_milk", "sometimes"], ["sugar", "usually"]],
  },
  {
    name_zh: "鴛鴦", aliases: ["鸳鸯"], jyutping: "jyun1 joeng1", name_en: "Yuenyeung (coffee with milk tea)", category: "drink", source_url: W + "Yuenyeung",
    description_en: "Mix of coffee and Hong Kong-style milk tea.",
    ingredients: [["tea", "always"], ["evaporated_milk", "always"], ["condensed_milk", "sometimes"], ["sugar", "usually"]],
  },
  {
    name_zh: "紅豆冰", jyutping: "hung4 dau6 bing1", name_en: "Red bean ice", category: "drink", source_url: W + "Red_bean_ice",
    description_en: "Sweet red beans with evaporated milk over ice.",
    ingredients: [["red_bean", "always"], ["evaporated_milk", "always"], ["sugar", "always"], ["condensed_milk", "sometimes"]],
  },
  {
    name_zh: "餐蛋麵", aliases: ["餐蛋面"], jyutping: "caan1 daan2 min6", name_en: "Luncheon meat and egg noodles", category: "cha chaan teng", source_url: W + "Cha_chaan_teng",
    description_en: "Instant noodles in soup with fried luncheon meat and a fried egg.",
    ingredients: [["wheat_noodles", "always"], ["spam", "always"], ["egg", "always"], ["msg", "usually"], ["chicken_powder", "sometimes"]],
  },
  {
    name_zh: "公仔麵", aliases: ["公仔面"], jyutping: "gung1 zai2 min6", name_en: "Instant noodles", category: "cha chaan teng", source_url: W + "Instant_noodle",
    description_en: "Instant noodles in soup, often with toppings such as luncheon meat, egg or sausage.",
    ingredients: [["wheat_noodles", "always"], ["msg", "usually"], ["chicken_powder", "sometimes"], ["pork", "sometimes"], ["egg", "sometimes"]],
  },
  {
    name_zh: "焗豬扒飯", jyutping: "guk6 zyu1 paa1 faan6", name_en: "Baked pork chop rice", category: "cha chaan teng", source_url: W + "Baked_pork_chop_rice",
    description_en: "Pork chop on egg fried rice, baked with tomato sauce and often cheese.",
    ingredients: [["pork", "always"], ["rice", "always"], ["tomato", "always"], ["egg", "usually"], ["cheese", "usually"], ["wheat_flour", "sometimes"], ["butter", "sometimes"]],
  },
  {
    name_zh: "瑞士雞翼", jyutping: "seoi6 si6 gai1 jik6", name_en: "\"Swiss\" chicken wings", category: "cha chaan teng", source_url: W + "Swiss_wing",
    description_en: "Chicken wings braised in a sweet soy sauce.",
    ingredients: [["chicken", "always"], ["soy_sauce", "always"], ["sugar", "always"], ["rice_wine", "sometimes"]],
  },
  {
    name_zh: "格仔餅", jyutping: "gaak3 zai2 beng2", name_en: "Hong Kong-style waffle", category: "street food", source_url: W + "Hong_Kong_cuisine",
    description_en: "Thin waffle spread with butter, peanut butter, condensed milk and sugar.",
    ingredients: [["wheat_flour", "always"], ["egg", "always"], ["butter", "always"], ["peanut", "usually"], ["condensed_milk", "usually"], ["sugar", "always"]],
  },

  // Dim sum
  {
    name_zh: "叉燒包", aliases: ["叉烧包"], jyutping: "caa1 siu1 baau1", name_en: "Char siu bun (BBQ pork bun)", category: "dim sum", source_url: W + "Char_siu_bao",
    description_en: "Fluffy bun filled with sweet barbecued pork.",
    ingredients: [["wheat_flour", "always"], ["char_siu", "always"], ["oyster_sauce", "usually"], ["soy_sauce", "usually"], ["sugar", "always"], ["sesame_oil", "sometimes"]],
  },
  {
    name_zh: "蝦餃", aliases: ["虾饺"], jyutping: "haa1 gaau2", name_en: "Har gow (shrimp dumplings)", category: "dim sum", source_url: W + "Har_gow",
    description_en: "Steamed dumplings with a translucent wrapper filled with shrimp.",
    ingredients: [["shrimp", "always"], ["wheat_flour", "usually"], ["tapioca_starch", "usually"], ["lard", "sometimes"], ["sesame_oil", "sometimes"]],
  },
  {
    name_zh: "燒賣", aliases: ["烧卖", "燒麥"], jyutping: "siu1 maai2", name_en: "Siu mai (pork and shrimp dumplings)", category: "dim sum", source_url: W + "Shumai",
    description_en: "Open steamed dumplings with pork and shrimp in a yellow wheat wrapper.",
    ingredients: [["pork", "always"], ["shrimp", "usually"], ["wheat_flour", "always"], ["egg", "usually"], ["mushroom", "usually"], ["soy_sauce", "usually"], ["sesame_oil", "usually"], ["oyster_sauce", "sometimes"]],
  },
  {
    name_zh: "腸粉", aliases: ["肠粉"], jyutping: "coeng2 fan2", name_en: "Cheung fun (rice noodle roll)", category: "dim sum", source_url: W + "Rice_noodle_roll",
    description_en: "Steamed rice sheets rolled around a filling, served with sweet soy sauce.",
    ingredients: [["rice_flour", "always"], ["soy_sauce", "always"], ["shrimp", "sometimes"], ["char_siu", "sometimes"], ["beef", "sometimes"]],
  },
  {
    name_zh: "鳳爪", aliases: ["凤爪", "豉汁鳳爪"], jyutping: "fung6 zaau2", name_en: "Chicken feet in black bean sauce", category: "dim sum", source_url: W + "Chicken_feet",
    description_en: "Fried, then steamed chicken feet in fermented black bean sauce.",
    ingredients: [["chicken", "always"], ["black_bean_sauce", "always"], ["soy_sauce", "usually"], ["oyster_sauce", "usually"], ["chili", "usually"], ["sugar", "always"]],
  },
  {
    name_zh: "糯米雞", aliases: ["糯米鸡"], jyutping: "no6 mai5 gai1", name_en: "Lo mai gai (sticky rice in lotus leaf)", category: "dim sum", source_url: W + "Lo_mai_gai",
    description_en: "Glutinous rice with chicken, sausage and mushrooms steamed in a lotus leaf.",
    ingredients: [["glutinous_rice", "always"], ["chicken", "always"], ["chinese_sausage", "usually"], ["pork", "usually"], ["mushroom", "usually"], ["soy_sauce", "usually"], ["oyster_sauce", "usually"], ["dried_shrimp", "sometimes"]],
  },
  {
    name_zh: "春卷", jyutping: "ceon1 gyun2", name_en: "Spring roll", category: "dim sum", source_url: W + "Spring_roll",
    description_en: "Deep-fried wheat pastry roll with vegetables and usually pork.",
    ingredients: [["wheat_flour", "always"], ["vegetables", "always"], ["pork", "usually"], ["shrimp", "sometimes"], ["oyster_sauce", "sometimes"], ["vegetable_oil", "always"]],
  },
  {
    name_zh: "蘿蔔糕", aliases: ["萝卜糕"], jyutping: "lo4 baak6 gou1", name_en: "Turnip cake", category: "dim sum", source_url: W + "Turnip_cake",
    description_en: "Pan-fried cake of shredded radish and rice flour with Chinese sausage and dried shrimp.",
    ingredients: [["rice_flour", "always"], ["chinese_sausage", "usually"], ["dried_shrimp", "usually"], ["mushroom", "sometimes"], ["pork", "sometimes"], ["lard", "sometimes"]],
  },
  {
    name_zh: "馬拉糕", aliases: ["马拉糕"], jyutping: "maa5 laai1 gou1", name_en: "Ma lai go (steamed sponge cake)", category: "dim sum", source_url: W + "Malay_sponge_cake",
    description_en: "Fluffy steamed brown-sugar sponge cake.",
    ingredients: [["wheat_flour", "always"], ["egg", "always"], ["sugar", "always"], ["milk", "sometimes"], ["butter", "sometimes"], ["lard", "sometimes"]],
  },
  {
    name_zh: "炸兩", aliases: ["炸两"], jyutping: "zaa3 loeng2", name_en: "Zhaliang (rice roll with fried dough)", category: "dim sum", source_url: W + "Zhaliang",
    description_en: "Fried dough stick wrapped in a steamed rice sheet, with soy sauce.",
    ingredients: [["rice_flour", "always"], ["wheat_flour", "always"], ["soy_sauce", "usually"], ["sesame", "sometimes"]],
  },
  {
    name_zh: "油炸鬼", aliases: ["油條", "油条"], jyutping: "jau4 zaa3 gwai2", name_en: "Youtiao (fried dough stick)", category: "breakfast", source_url: W + "Youtiao",
    description_en: "Long deep-fried dough stick, often eaten with congee.",
    ingredients: [["wheat_flour", "always"], ["vegetable_oil", "always"], ["salt", "always"]],
  },

  // Roast meats and rice
  {
    name_zh: "叉燒飯", aliases: ["叉烧饭"], jyutping: "caa1 siu1 faan6", name_en: "Char siu rice (BBQ pork on rice)", category: "roast meat", source_url: W + "Char_siu",
    description_en: "Sweet barbecued pork over rice.",
    ingredients: [["char_siu", "always"], ["rice", "always"], ["soy_sauce", "usually"]],
  },
  {
    name_zh: "燒鵝飯", aliases: ["烧鹅饭"], jyutping: "siu1 ngo2 faan6", name_en: "Roast goose rice", category: "roast meat", source_url: W + "Roast_goose",
    description_en: "Cantonese roast goose over rice.",
    ingredients: [["goose", "always"], ["rice", "always"], ["soy_sauce", "usually"], ["rice_wine", "sometimes"]],
  },
  {
    name_zh: "白切雞", aliases: ["白切鸡"], jyutping: "baak6 cit3 gai1", name_en: "White cut chicken", category: "roast meat", source_url: W + "White_cut_chicken",
    description_en: "Poached chicken served with ginger and spring onion oil.",
    ingredients: [["chicken", "always"], ["ginger", "usually"], ["spring_onion", "usually"], ["vegetable_oil", "usually"], ["soy_sauce", "sometimes"]],
  },
  {
    name_zh: "豉油雞", aliases: ["豉油鸡"], jyutping: "si6 jau4 gai1", name_en: "Soy sauce chicken", category: "roast meat", source_url: W + "Soy_sauce_chicken",
    description_en: "Chicken braised in sweet soy sauce.",
    ingredients: [["chicken", "always"], ["soy_sauce", "always"], ["sugar", "always"], ["rice_wine", "sometimes"]],
  },
  {
    name_zh: "海南雞飯", aliases: ["海南鸡饭"], jyutping: "hoi2 naam4 gai1 faan6", name_en: "Hainanese chicken rice", category: "rice", source_url: W + "Hainanese_chicken_rice",
    description_en: "Poached chicken with rice cooked in chicken stock.",
    ingredients: [["chicken", "always"], ["rice", "always"], ["chicken_stock", "always"], ["ginger", "usually"], ["soy_sauce", "usually"], ["chili", "usually"], ["sesame_oil", "sometimes"]],
  },
  {
    name_zh: "揚州炒飯", aliases: ["扬州炒饭"], jyutping: "joeng4 zau1 caau2 faan6", name_en: "Yangzhou fried rice", category: "rice", source_url: W + "Yangzhou_fried_rice",
    description_en: "Fried rice with egg, BBQ pork and shrimp.",
    ingredients: [["rice", "always"], ["egg", "always"], ["char_siu", "usually"], ["shrimp", "usually"], ["spring_onion", "usually"], ["soy_sauce", "sometimes"]],
  },
  {
    name_zh: "煲仔飯", aliases: ["煲仔饭"], jyutping: "bou1 zai2 faan6", name_en: "Claypot rice", category: "rice", source_url: W + "Claypot_rice",
    description_en: "Rice cooked in a clay pot with toppings such as Chinese sausage or chicken, with sweet soy sauce.",
    ingredients: [["rice", "always"], ["soy_sauce", "always"], ["chinese_sausage", "usually"], ["chicken", "sometimes"], ["pork", "sometimes"], ["lard", "sometimes"]],
  },
  {
    name_zh: "皮蛋瘦肉粥", jyutping: "pei4 daan2 sau3 juk6 zuk1", name_en: "Century egg and pork congee", category: "congee", source_url: W + "Congee",
    description_en: "Rice porridge with preserved egg and lean pork.",
    ingredients: [["rice", "always"], ["egg", "always"], ["pork", "always"], ["ginger", "usually"]],
  },
  {
    name_zh: "艇仔粥", jyutping: "teng5 zai2 zuk1", name_en: "Sampan congee", category: "congee", source_url: W + "Congee",
    description_en: "Rice porridge with fish, squid, pork and peanuts.",
    ingredients: [["rice", "always"], ["fish", "usually"], ["squid", "usually"], ["pork", "usually"], ["peanut", "usually"], ["egg", "sometimes"]],
  },

  // Noodles
  {
    name_zh: "雲吞麵", aliases: ["云吞面", "雲吞面"], jyutping: "wan4 tan1 min6", name_en: "Wonton noodles", category: "noodles", source_url: W + "Wonton_noodles",
    description_en: "Thin egg noodles with shrimp wontons in a broth often made with dried fish and shrimp.",
    ingredients: [["egg_noodles", "always"], ["shrimp", "always"], ["wheat_flour", "always"], ["pork", "usually"], ["egg", "usually"], ["fish", "usually"], ["dried_shrimp", "usually"], ["pork_stock", "usually"]],
  },
  {
    name_zh: "牛腩麵", aliases: ["牛腩面"], jyutping: "ngau4 naam5 min6", name_en: "Beef brisket noodles", category: "noodles", source_url: W + "Beef_noodle_soup",
    description_en: "Noodles with slow-braised beef brisket.",
    ingredients: [["beef", "always"], ["beef_stock", "always"], ["egg_noodles", "usually"], ["soy_sauce", "usually"], ["oyster_sauce", "sometimes"], ["hoisin_sauce", "sometimes"]],
  },
  {
    name_zh: "乾炒牛河", aliases: ["干炒牛河"], jyutping: "gon1 caau2 ngau4 ho2", name_en: "Beef chow fun", category: "noodles", source_url: W + "Beef_chow_fun",
    description_en: "Wide rice noodles stir-fried with beef and soy sauce.",
    ingredients: [["rice_noodles", "always"], ["beef", "always"], ["soy_sauce", "always"], ["vegetable_oil", "always"], ["spring_onion", "usually"], ["oyster_sauce", "sometimes"]],
  },
  {
    name_zh: "星洲炒米", jyutping: "sing1 zau1 caau2 mai5", name_en: "Singapore-style noodles", category: "noodles", source_url: W + "Singapore-style_noodles",
    description_en: "Curry-flavoured stir-fried rice vermicelli with BBQ pork, shrimp and egg.",
    ingredients: [["rice_noodles", "always"], ["curry_sauce", "always"], ["char_siu", "usually"], ["shrimp", "usually"], ["egg", "usually"], ["soy_sauce", "sometimes"]],
  },
  {
    name_zh: "沙嗲牛肉麵", aliases: ["沙爹牛肉麵", "沙嗲牛肉面"], jyutping: "saa3 de1 ngau4 juk6 min6", name_en: "Satay beef noodles", category: "noodles", source_url: W + "Satay",
    description_en: "Instant noodles with beef in Hong Kong satay sauce (peanut and dried shrimp).",
    ingredients: [["beef", "always"], ["satay_sauce", "always"], ["wheat_noodles", "usually"], ["peanut", "usually"]],
  },
  {
    name_zh: "車仔麵", aliases: ["车仔面"], jyutping: "ce1 zai2 min6", name_en: "Cart noodles", category: "noodles", source_url: W + "Cart_noodle",
    description_en: "Noodles with toppings you pick yourself, e.g. fish balls, beef offal or sausages.",
    ingredients: [["wheat_noodles", "usually"], ["fish_ball", "sometimes"], ["beef", "sometimes"], ["pork", "sometimes"], ["curry_sauce", "sometimes"], ["soy_sauce", "usually"]],
  },
  {
    name_zh: "魚蛋粉", aliases: ["鱼蛋粉"], jyutping: "jyu4 daan2 fan2", name_en: "Fish ball noodles", category: "noodles", source_url: W + "Fish_ball",
    description_en: "Rice noodles in fish broth with fish balls. Contains no egg despite the name.",
    ingredients: [["fish_ball", "always"], ["fish", "usually"], ["rice_noodles", "usually"], ["wheat_flour", "sometimes"]],
  },

  // Street food and mains
  {
    name_zh: "咖喱魚蛋", aliases: ["咖喱鱼蛋"], jyutping: "gaa3 lei1 jyu4 daan2", name_en: "Curry fish balls", category: "street food", source_url: W + "Fish_ball",
    description_en: "Fish balls in a spicy curry sauce, sold on skewers.",
    ingredients: [["fish_ball", "always"], ["curry_sauce", "always"], ["wheat_flour", "sometimes"], ["coconut", "sometimes"], ["shrimp_paste", "sometimes"]],
  },
  {
    name_zh: "雞蛋仔", aliases: ["鸡蛋仔"], jyutping: "gai1 daan6 zai2", name_en: "Egg waffle", category: "street food", source_url: W + "Egg_waffle",
    description_en: "Bubble-shaped sweet waffle.",
    ingredients: [["egg", "always"], ["wheat_flour", "always"], ["sugar", "always"], ["evaporated_milk", "usually"], ["butter", "sometimes"]],
  },
  {
    name_zh: "咕嚕肉", aliases: ["咕噜肉", "生炒骨"], jyutping: "gu1 lou1 juk6", name_en: "Sweet and sour pork", category: "mains", source_url: W + "Sweet_and_sour_pork",
    description_en: "Battered fried pork in a sweet and sour sauce with pineapple and peppers.",
    ingredients: [["pork", "always"], ["vinegar", "always"], ["sugar", "always"], ["wheat_flour", "usually"], ["corn_starch", "usually"], ["egg", "usually"], ["pineapple", "usually"], ["tomato", "usually"]],
  },
  {
    name_zh: "麻婆豆腐", jyutping: "maa4 po4 dau6 fu6", name_en: "Mapo tofu", category: "mains", source_url: W + "Mapo_tofu",
    description_en: "Tofu in a spicy sauce, usually with minced pork or beef.",
    ingredients: [["tofu", "always"], ["chili", "always"], ["pork", "usually"], ["black_bean_sauce", "usually"], ["soy_sauce", "usually"], ["beef", "sometimes"], ["shaoxing_wine", "sometimes"]],
  },
  {
    name_zh: "豉汁蒸排骨", jyutping: "si6 zap1 zing1 paai4 gwat1", name_en: "Steamed spare ribs in black bean sauce", category: "dim sum", source_url: W + "Douchi",
    description_en: "Small pork spare ribs steamed with fermented black beans and garlic.",
    ingredients: [["pork", "always"], ["black_bean_sauce", "always"], ["garlic", "always"], ["soy_sauce", "usually"], ["corn_starch", "usually"], ["sugar", "usually"]],
  },
  {
    name_zh: "清蒸魚", aliases: ["清蒸鱼", "蒸魚"], jyutping: "cing1 zing1 jyu4", name_en: "Steamed fish", category: "mains", source_url: W + "Cantonese_cuisine",
    description_en: "Whole fish steamed with ginger and spring onion, with soy sauce.",
    ingredients: [["fish", "always"], ["soy_sauce", "always"], ["ginger", "always"], ["spring_onion", "always"], ["vegetable_oil", "usually"], ["sugar", "sometimes"]],
  },
  {
    name_zh: "椒鹽魷魚", aliases: ["椒盐鱿鱼"], jyutping: "ziu1 jim4 jau4 jyu2", name_en: "Salt and pepper squid", category: "mains", source_url: W + "Calamari",
    description_en: "Battered, deep-fried squid with salt, pepper and chili.",
    ingredients: [["squid", "always"], ["salt", "always"], ["wheat_flour", "usually"], ["corn_starch", "usually"], ["chili", "usually"], ["egg", "sometimes"]],
  },
  {
    name_zh: "滑蛋蝦仁", aliases: ["滑蛋虾仁"], jyutping: "waat6 daan2 haa1 jan4", name_en: "Scrambled eggs with shrimp", category: "mains", source_url: W + "Cantonese_cuisine",
    description_en: "Silky scrambled eggs with shrimp.",
    ingredients: [["egg", "always"], ["shrimp", "always"], ["corn_starch", "usually"], ["vegetable_oil", "always"], ["salt", "always"]],
  },
  {
    name_zh: "蠔油菜心", aliases: ["蚝油菜心", "白灼菜心"], jyutping: "hou4 jau4 coi3 sam1", name_en: "Choy sum with oyster sauce", category: "vegetables", source_url: W + "Choy_sum",
    description_en: "Blanched green vegetables with oyster sauce. Not vegetarian because of the oyster sauce.",
    ingredients: [["vegetables", "always"], ["oyster_sauce", "always"], ["vegetable_oil", "usually"], ["garlic", "sometimes"]],
  },

  // Desserts
  {
    name_zh: "豆腐花", jyutping: "dau6 fu6 faa1", name_en: "Tofu pudding", category: "dessert", source_url: W + "Douhua",
    description_en: "Silky soft tofu with sugar syrup.",
    ingredients: [["tofu", "always"], ["sugar", "always"], ["ginger", "sometimes"]],
  },
  {
    name_zh: "楊枝甘露", aliases: ["杨枝甘露"], jyutping: "joeng4 zi1 gam1 lou6", name_en: "Mango pomelo sago", category: "dessert", source_url: W + "Mango_pomelo_sago",
    description_en: "Chilled mango soup with pomelo and sago.",
    ingredients: [["mango", "always"], ["tapioca_starch", "always"], ["coconut", "usually"], ["evaporated_milk", "usually"], ["milk", "sometimes"], ["cream", "sometimes"], ["sugar", "always"]],
  },
];
