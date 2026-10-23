import { NextResponse, type NextRequest } from "next/server";
import { runA2, ScanFailedError } from "@/lib/approaches/a2";
import { onboardingStep, getCurrentProfile } from "@/lib/profile";
import { KINDS, type Kind } from "@/lib/scan-schema";
import { createAdminClient } from "@/lib/supabase/admin";
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
        ingredients: { key: string; certainty: "listed" | "always" | "usually" | "sometimes" }[];
        notes: string | null;
        verdict: "ok" | "check" | "avoid";
        reasons: { level: "avoid" | "check"; text: string }[];
      }>;
      remaining: number;
    }
  | { ok: false; error: "onboarding" | "invalid_image" | "limit" | "failed" };

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
      const { verdict, reasons } = verdictFor({ ingredients: item.ingredients, recognised: item.recognised }, profile.restrictions);
      return {
        original_text: item.original_text,
        name_en: item.name_en,
        jyutping: item.jyutping,
        description_en: item.description_en,
        ingredients: item.ingredients,
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
