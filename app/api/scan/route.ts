import { NextResponse, type NextRequest } from "next/server";
import { runA2, ScanFailedError } from "@/lib/approaches/a2";
import { onboardingStep, getCurrentProfile } from "@/lib/profile";
import { KINDS, type Kind } from "@/lib/scan-schema";
import { createAdminClient } from "@/lib/supabase/admin";
import { ingredientByKey, type Category } from "@/lib/ingredients";
import { verdictFor } from "@/lib/verdict";

// Vision calls can take a while.
export const maxDuration = 120;

const MAX_BYTES = 5 * 1024 * 1024;
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export type ScanResponse =
  | {
      ok: true;
      kind: Kind;
      items: Array<{
        original_text: string;
        name_en: string;
        jyutping: string | null;
        description_en: string | null;
        ingredients: { key: string; name_en: string; certainty: "listed" | "always" | "usually" | "sometimes"; verified: boolean }[];
        notes: string | null;
        verdict: "ok" | "check" | "avoid";
        reasons: { level: "avoid" | "check"; text: string }[];
      }>;
      remaining: number;
    }
  | { ok: false; error: "onboarding" | "invalid_image" | "limit" | "failed" };

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

function fail(error: Extract<ScanResponse, { ok: false }>["error"], status: number) {
  return NextResponse.json<ScanResponse>({ ok: false, error }, { status });
}

// The photo is only held in memory for this request: it is never stored.
export async function POST(request: NextRequest) {
  const profile = await getCurrentProfile();
  if (onboardingStep(profile)) return fail("onboarding", 403);

  const form = await request.formData().catch(() => null);
  const image = form?.get("image");
  const kindValue = form?.get("kind");
  const kind = KINDS.includes(kindValue as Kind) ? (kindValue as Kind) : null;
  if (!(image instanceof Blob) || !IMAGE_TYPES.includes(image.type) || image.size === 0 || image.size > MAX_BYTES) {
    return fail("invalid_image", 400);
  }

  // Daily limit (configurable), counted before the model call.
  const limit = Number(process.env.SCAN_DAILY_LIMIT) || 30;
  const admin = createAdminClient();
  const { data: used, error: quotaError } = await admin.rpc("consume_scan", { p_user: profile.id, p_limit: limit });
  if (quotaError) return fail("failed", 500);
  if (used === -1) return fail("limit", 429);

  try {
    const base64 = Buffer.from(await image.arrayBuffer()).toString("base64");
    const result = await runA2(base64, image.type, kind);

    // Anonymous statistics only: no user id, no photo, no text.
    await admin.from("scan_stats").insert({
      approach: result.approach,
      kind: result.kind,
      item_count: result.items.length,
      latency_ms: result.latency_ms,
      cost_usd: result.cost_usd,
    });

    // The rule engine decides, never the model.
    const items = result.items.map((item) => {
      const ingredients = item.ingredients.map((i) => ({
        key: i.key,
        certainty: i.certainty,
        name: i.name_en,
        categories: i.categories as Category[],
      }));
      const { verdict, reasons } = verdictFor(
        { ingredients, recognised: item.recognised, isLabel: result.kind === "label" },
        profile.restrictions,
      );
      return {
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
        verdict,
        reasons: reasons.map((r) => ({ level: r.level, text: r.text })),
      };
    });

    return NextResponse.json<ScanResponse>({ ok: true, kind: result.kind, items, remaining: Math.max(0, limit - used) });
  } catch (error) {
    if (!(error instanceof ScanFailedError)) console.error("scan failed", error);
    return fail("failed", 502);
  }
}
