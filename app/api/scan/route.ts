import { NextResponse, type NextRequest } from "next/server";
import { runA1 } from "@/lib/approaches/a1";
import { runA2, ScanFailedError, type OnItem } from "@/lib/approaches/a2";
import { runA3 } from "@/lib/approaches/a3";
import { OcrUnavailableError } from "@/lib/approaches/ocr";
import { hkdRate, type Rate } from "@/lib/currency";
import { ingredientByKey, type Category } from "@/lib/ingredients";
import { onboardingStep, getCurrentProfile } from "@/lib/profile";
import { RESTRICTION_KEYS } from "@/lib/restrictions";
import { KINDS, type Approach, type DishCategory, type KbDish, type Kind, type ScanItem } from "@/lib/scan-schema";
import { createAdminClient } from "@/lib/supabase/admin";
import { verdictFor, type Verdict } from "@/lib/verdict";

// Vision calls can take a while.
export const maxDuration = 120;

// Up to 4 photos of one menu; together they must stay below Vercel's upload limit.
const MAX_PHOTOS = 4;
const MAX_BYTES = 4.4 * 1024 * 1024;
const DEFAULT_APPROACH: Approach = "A3";
const APPROACHES: Approach[] = ["A1", "A2", "A3"];
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export type ResultItem = {
  position: number;
  menu_number: string | null;
  price: string | null;
  category: DishCategory | null;
  original_text: string;
  name_en: string;
  jyutping: string | null;
  description_en: string | null;
  ingredients: { key: string; name_en: string; certainty: "listed" | "always" | "usually" | "sometimes"; verified: boolean }[];
  notes: string | null;
  // A3 only: the knowledge-base entry the ingredients come from (null = AI estimate)
  kb_dish?: KbDish | null;
  verdict: Verdict;
  reasons: { level: "avoid" | "check"; text: string; restriction?: string }[];
  // "Eating with friends": the verdict for each extra restriction picked for this scan
  friends: { restriction: string; verdict: Verdict; reason: string | null }[];
};

// Errors before the scan starts come as JSON with a status code. A started
// scan is a stream of JSON lines (application/x-ndjson): one "item" event per
// dish as soon as it is ready, then "done" (or "error").
export type ScanError = "onboarding" | "invalid_image" | "limit" | "failed" | "ocr_unavailable";
export type ScanEvent =
  | { type: "item"; item: ResultItem }
  | { type: "done"; approach: Approach; kind: Kind; remaining: number; rate: Rate | null }
  | { type: "error"; error: ScanError };

const CERTAINTY_RANK = ["listed", "always", "usually", "sometimes"];

function dedupe<T extends { name_en: string; certainty: string }>(list: T[]): T[] {
  const byName = new Map<string, T>();
  for (const item of list) {
    const key = item.name_en.toLowerCase();
    const seen = byName.get(key);
    if (!seen || CERTAINTY_RANK.indexOf(item.certainty) < CERTAINTY_RANK.indexOf(seen.certainty)) byName.set(key, item);
  }
  return [...byName.values()];
}

// The rule engine decides, never the model.
function toResultItem(item: ScanItem, position: number, kind: Kind, restrictions: string[], friends: string[]): ResultItem {
  const input = {
    ingredients: item.ingredients.map((i) => ({ key: i.key, certainty: i.certainty, name: i.name_en, categories: i.categories as Category[] })),
    recognised: item.recognised,
    lowConfidence: item.low_confidence,
    isLabel: kind === "label",
  };
  const { verdict, reasons } = verdictFor(input, restrictions);
  return {
    // Position on the photo (reading order), so users can count along the menu.
    position,
    menu_number: item.menu_number,
    price: item.price,
    category: item.category,
    original_text: item.original_text,
    name_en: item.name_en,
    jyutping: item.jyutping,
    description_en: item.description_en,
    // verified = one of our known ingredients (categories checked by us).
    // The same ingredient can appear twice (ingredient list + allergen
    // statement): show it once, with its strongest certainty.
    ingredients: dedupe(
      item.ingredients.map((i) => ({
        key: i.key,
        name_en: ingredientByKey(i.key)?.label ?? i.name_en,
        certainty: i.certainty,
        verified: Boolean(ingredientByKey(i.key)),
      })),
    ),
    notes: item.notes,
    kb_dish: item.kb_dish,
    verdict,
    reasons: reasons.map((r) => ({ level: r.level, text: r.text, restriction: r.restriction })),
    friends: friends.map((restriction) => {
      const result = verdictFor(input, [restriction]);
      return { restriction, verdict: result.verdict, reason: result.reasons[0]?.text ?? null };
    }),
  };
}

function fail(error: ScanError, status: number) {
  return NextResponse.json({ ok: false, error }, { status });
}

// The photo is only held in memory for this request: it is never stored.
export async function POST(request: NextRequest) {
  const profile = await getCurrentProfile();
  if (onboardingStep(profile)) return fail("onboarding", 403);

  const form = await request.formData().catch(() => null);
  const images = form?.getAll("image") ?? [];
  const kindValue = form?.get("kind");
  const kind = KINDS.includes(kindValue as Kind) ? (kindValue as Kind) : null;
  const valid = images.every((image) => image instanceof Blob && IMAGE_TYPES.includes(image.type) && image.size > 0);
  const total = images.reduce((sum, image) => sum + (image instanceof Blob ? image.size : 0), 0);
  if (images.length === 0 || images.length > MAX_PHOTOS || !valid || total > MAX_BYTES) return fail("invalid_image", 400);
  const photos = images as Blob[];
  // Users get the default approach; only the team may switch (for testing).
  const requested = form?.get("approach");
  const approach: Approach = profile.role === "team" && APPROACHES.includes(requested as Approach) ? (requested as Approach) : DEFAULT_APPROACH;
  // Friends' restrictions for this scan only (never stored).
  const friends = String(form?.get("friends") ?? "")
    .split(",")
    .filter((key) => RESTRICTION_KEYS.includes(key) && !profile.restrictions.includes(key));

  // Daily limit (configurable), counted before the model call: one scan per photo.
  const limit = Number(process.env.SCAN_DAILY_LIMIT) || 30;
  const admin = createAdminClient();
  let used = 0;
  for (let i = 0; i < photos.length; i++) {
    const { data, error: quotaError } = await admin.rpc("consume_scan", { p_user: profile.id, p_limit: limit });
    if (quotaError) return fail("failed", 500);
    if (data === -1) return fail("limit", 429);
    used = data;
  }

  // Started here, inside the request (fetch caching needs it), awaited in the stream.
  const ratePromise = profile.currency ? hkdRate(profile.currency) : Promise.resolve(null);

  // The response goes out at once; the scan runs on and writes into it.
  const encoder = new TextEncoder();
  const { readable, writable } = new TransformStream<Uint8Array, Uint8Array>();
  const writer = writable.getWriter();
  void (async () => {
    // A closed app ends the stream; the scan then simply finishes unseen.
    const send = (event: ScanEvent) => void writer.write(encoder.encode(JSON.stringify(event) + "\n")).catch(() => {});
    let position = 0;
    const onItem: OnItem = (item, itemKind) => send({ type: "item", item: toResultItem(item, ++position, itemKind, profile.restrictions, friends) });

    try {
      const encoded =
        approach === "A1"
          ? []
          : await Promise.all(photos.map(async (photo) => ({ base64: Buffer.from(await photo.arrayBuffer()).toString("base64"), mediaType: photo.type })));
      const [result, rate] = await Promise.all([
        approach === "A1" ? runA1(photos, kind) : approach === "A3" ? runA3(encoded, kind, onItem) : runA2(encoded, kind, onItem),
        ratePromise,
      ]);
      // A1 has no stream: all its items come at the end.
      if (approach === "A1") result.items.forEach((item) => onItem(item, result.kind));

      // Anonymous statistics only: no user id, no photo, no text.
      await admin.from("scan_stats").insert({
        approach: result.approach,
        kind: result.kind,
        item_count: result.items.length,
        latency_ms: result.latency_ms,
        cost_usd: result.cost_usd,
      });
      send({ type: "done", approach: result.approach, kind: result.kind, remaining: Math.max(0, limit - used), rate });
    } catch (error) {
      if (error instanceof OcrUnavailableError) console.error("ocr unavailable", error.message);
      else if (!(error instanceof ScanFailedError)) console.error("scan failed", error);
      send({ type: "error", error: error instanceof OcrUnavailableError ? "ocr_unavailable" : "failed" });
    } finally {
      await writer.close().catch(() => {});
    }
  })();

  return new Response(readable, { headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store" } });
}
