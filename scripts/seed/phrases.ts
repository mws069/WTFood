// "Ask staff" questions per restriction, in spoken Cantonese.
// All start as NOT reviewed: a local speaker must check them in the Lab
// before users see them.
// [restriction key, Chinese, Jyutping, English]
export const PHRASES: [string, string, string, string][] = [
  ["lactose", "呢個有冇牛奶或者奶類？", "ni1 go3 jau5 mou5 ngau4 naai5 waak6 ze2 naai5 leoi6?", "Does this contain milk or dairy?"],
  ["gluten", "呢個有冇麵粉或者豉油？", "ni1 go3 jau5 mou5 min6 fan2 waak6 ze2 si6 jau4?", "Does this contain wheat flour or soy sauce?"],
  ["peanut", "呢個有冇花生？", "ni1 go3 jau5 mou5 faa1 sang1?", "Does this contain peanuts?"],
  ["tree_nuts", "呢個有冇果仁？例如杏仁、腰果、合桃。", "ni1 go3 jau5 mou5 gwo2 jan4? lai6 jyu4 hang6 jan4, jiu1 gwo2, hap6 tou4.", "Does this contain nuts, e.g. almonds, cashews or walnuts?"],
  ["shellfish", "呢個有冇蝦、蟹或者蠔油？", "ni1 go3 jau5 mou5 haa1, haai5 waak6 ze2 hou4 jau4?", "Does this contain shrimp, crab or oyster sauce?"],
  ["egg", "呢個有冇蛋？", "ni1 go3 jau5 mou5 daan2?", "Does this contain egg?"],
  ["fish", "呢個有冇魚或者魚露？", "ni1 go3 jau5 mou5 jyu4 waak6 ze2 jyu4 lou6?", "Does this contain fish or fish sauce?"],
  ["soy", "呢個有冇黃豆、豆腐或者豉油？", "ni1 go3 jau5 mou5 wong4 dau2, dau6 fu6 waak6 ze2 si6 jau4?", "Does this contain soybeans, tofu or soy sauce?"],
  ["sesame", "呢個有冇芝麻或者麻油？", "ni1 go3 jau5 mou5 zi1 maa4 waak6 ze2 maa4 jau4?", "Does this contain sesame or sesame oil?"],
  ["vegetarian", "呢個有冇肉、海鮮、豬油或者蠔油？", "ni1 go3 jau5 mou5 juk6, hoi2 sin1, zyu1 jau4 waak6 ze2 hou4 jau4?", "Does this contain meat, seafood, lard or oyster sauce?"],
  ["vegan", "呢個有冇肉、海鮮、蛋、奶或者蜜糖？", "ni1 go3 jau5 mou5 juk6, hoi2 sin1, daan2, naai5 waak6 ze2 mat6 tong4?", "Does this contain meat, seafood, egg, milk or honey?"],
  ["halal", "呢個有冇豬肉、豬油或者酒？", "ni1 go3 jau5 mou5 zyu1 juk6, zyu1 jau4 waak6 ze2 zau2?", "Does this contain pork, lard or alcohol?"],
  ["no_pork", "呢個有冇豬肉或者豬油？", "ni1 go3 jau5 mou5 zyu1 juk6 waak6 ze2 zyu1 jau4?", "Does this contain pork or lard?"],
  ["no_beef", "呢個有冇牛肉？", "ni1 go3 jau5 mou5 ngau4 juk6?", "Does this contain beef?"],
  ["no_alcohol", "呢個有冇酒？", "ni1 go3 jau5 mou5 zau2?", "Does this contain alcohol?"],
  // For everyone, whatever the restrictions ("general").
  ["general", "唔該，呢個有啲咩材料？", "m4 goi1, ni1 go3 jau5 di1 me1 coi4 liu2?", "Excuse me, what ingredients are in this?"],
  ["general", "我有食物敏感。", "ngo5 jau5 sik6 mat6 man5 gam2.", "I have a food allergy."],
  ["general", "可唔可以寫低啲材料俾我睇？", "ho2 m4 ho2 ji5 se2 dai1 di1 coi4 liu2 bei2 ngo5 tai2?", "Could you write down the ingredients for me?"],
  ["general", "呢個辣唔辣？", "ni1 go3 laat6 m4 laat6?", "Is this spicy?"],
  ["general", "有冇推介？", "jau5 mou5 teoi1 gaai3?", "What do you recommend?"],
  ["general", "唔該，埋單。", "m4 goi1, maai4 daan1.", "The bill, please."],
];
