import { z } from "zod";

// DeepL machine translation for A1 (Chinese → English). Plain HTTP, no
// extra package. Free keys end in ":fx" and use the free endpoint.

const deeplSchema = z.object({ translations: z.array(z.object({ text: z.string() })) });

// Returns one English text per input, or null if translation is not
// available (no key, quota used up, network error): A1 then shows the
// Chinese text instead of failing the whole scan.
export async function translateToEnglish(texts: string[]): Promise<(string | null)[]> {
  const key = process.env.DEEPL_API_KEY;
  if (!key || texts.length === 0) return texts.map(() => null);

  const host = key.endsWith(":fx") ? "https://api-free.deepl.com" : "https://api.deepl.com";
  try {
    const response = await fetch(`${host}/v2/translate`, {
      method: "POST",
      headers: { Authorization: `DeepL-Auth-Key ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ text: texts, source_lang: "ZH", target_lang: "EN-US" }),
      signal: AbortSignal.timeout(20_000),
    });
    if (!response.ok) return texts.map(() => null);
    const parsed = deeplSchema.safeParse(await response.json());
    if (!parsed.success) return texts.map(() => null);
    return texts.map((_, i) => parsed.data.translations[i]?.text ?? null);
  } catch {
    return texts.map(() => null);
  }
}
