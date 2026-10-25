// Tips and fun facts about Cantonese food for the Home screen. One is shown
// at random on every visit.
export type Tip = { kind: "tip" | "fact"; text: string };

export const TIPS: Tip[] = [
  { kind: "tip", text: "Soy sauce usually contains wheat, and many \"vegetable\" dishes are cooked with oyster sauce or lard." },
  { kind: "fact", text: "A pineapple bun (菠蘿包) contains no pineapple – the name comes from its crackly, golden top." },
  { kind: "fact", text: "Fish balls are called 魚蛋 (\"fish eggs\") but usually contain no egg – just fish paste and starch." },
  { kind: "fact", text: "Yuenyeung (鴛鴦) is coffee mixed with Hong Kong milk tea – named after a pair of mandarin ducks." },
  { kind: "fact", text: "Hong Kong milk tea is also called \"silk stocking\" tea, because the cloth filter looks like a stocking." },
  { kind: "tip", text: "走 means \"without\": 走甜 = no sugar, 走蔥 = no spring onion, 走蠔油 = no oyster sauce." },
  { kind: "tip", text: "Choy sum (菜心) is often served with oyster sauce on top. Vegetarians can ask for 走蠔油." },
  { kind: "fact", text: "飲茶 (yum cha) literally means \"drinking tea\" – dim sum is what you eat with it." },
  { kind: "tip", text: "At dim sum, leave the teapot lid open or tilted and the staff will refill it with hot water." },
  { kind: "fact", text: "Tapping two fingers on the table is a silent \"thank you\" when someone pours you tea." },
  { kind: "tip", text: "Hong Kong French toast (西多士) often has peanut butter inside – important with a peanut allergy." },
  { kind: "fact", text: "Char siu (叉燒) gets its sweet, sticky glaze from honey or maltose – and usually soy sauce too." },
  { kind: "tip", text: "Some egg tart (蛋撻) crusts are made with lard. Ask if you avoid pork." },
  { kind: "tip", text: "Congee (粥) is often cooked with pork bones or dried scallops, even when it looks plain." },
  { kind: "fact", text: "Wonton noodles get their bite from alkaline water and duck egg in the dough." },
  { kind: "tip", text: "Cantonese \"slow-cooked soups\" (老火湯) simmer for hours, usually with pork or chicken bones." },
  { kind: "tip", text: "Sesame oil (麻油) is common in dumplings, noodles and dressings – check with a sesame allergy." },
  { kind: "fact", text: "Cha chaan teng (茶餐廳) means \"tea restaurant\" – Hong Kong's mix of Western and Cantonese diner food." },
  { kind: "tip", text: "In a cha chaan teng set, a cold drink often costs a few dollars more than a hot one." },
  { kind: "fact", text: "Snake soup (蛇羹) is a classic Hong Kong winter dish, believed to warm the body." },
  { kind: "tip", text: "Many sauces (XO sauce, shrimp paste, fish sauce) contain seafood – even in meat dishes." },
  { kind: "fact", text: "Pineapple bun with butter (菠蘿油) is a pineapple bun with a thick slice of cold butter inside." },
];

export function randomTip(): Tip {
  return TIPS[Math.floor(Math.random() * TIPS.length)];
}
