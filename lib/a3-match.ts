// A3 retrieval: find the dishes in our knowledge base that are most similar
// to an item read from the photo, by character-bigram similarity on the
// Chinese text (name and aliases). Pure functions, unit-tested.

export type MatchableDish = { id: number; name_zh: string; aliases: string[] };
export type DishMatch<D extends MatchableDish> = { dish: D; similarity: number };

const NOT_CJK = /[^㐀-鿿豈-﫿]/g;

// Only the Chinese characters count: spaces, prices, Latin text and
// punctuation are dropped. A single character is its own "bigram".
export function bigrams(text: string): string[] {
  const chars = [...text.replace(NOT_CJK, "")];
  if (chars.length < 2) return chars;
  return chars.slice(1).map((c, i) => chars[i] + c);
}

// Dice coefficient: 1 = same bigrams, 0 = nothing in common.
export function similarity(a: string, b: string): number {
  const x = bigrams(a);
  const y = bigrams(b);
  if (x.length === 0 || y.length === 0) return 0;
  const rest = [...y];
  let common = 0;
  for (const g of x) {
    const at = rest.indexOf(g);
    if (at >= 0) {
      common++;
      rest.splice(at, 1);
    }
  }
  return (2 * common) / (x.length + y.length);
}

// The k most similar dishes with at least minSimilarity, best first.
// A dish counts with its best-matching name or alias.
export function nearestDishes<D extends MatchableDish>(text: string, dishes: D[], k: number, minSimilarity: number): DishMatch<D>[] {
  return dishes
    .map((dish) => ({ dish, similarity: Math.max(...[dish.name_zh, ...dish.aliases].map((name) => similarity(text, name))) }))
    .filter((m) => m.similarity >= minSimilarity)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, k);
}
