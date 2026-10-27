import { NextResponse, type NextRequest } from "next/server";
import { onboardingStep, getCurrentProfile } from "@/lib/profile";
import { restrictionByKey } from "@/lib/restrictions";
import { createAdminClient } from "@/lib/supabase/admin";
import { allergyCard, dishQuestions, toCantonese, toEnglish, toKitchenRequest, transcribe, type CantonesePhrase } from "@/lib/translator";

// Ask-staff translator. Three modes:
// - say:    the student's English (typed or spoken) → Cantonese to show
// - listen: the staff's answer (spoken or typed Chinese) → English
// - dish:   questions about one dish for the user's restrictions
// - card:   the user's allergy card (all restrictions in one text)
// - request: an own request for the order card, in the kitchen's short form
// Audio and text are processed in memory and never stored.

export const maxDuration = 60;

const MAX_TEXT = 500;
const MAX_AUDIO = 4 * 1024 * 1024; // about a minute of speech
const AUDIO_TYPES = ["audio/webm", "audio/mp4", "audio/mpeg", "audio/ogg", "audio/wav", "audio/x-m4a", "audio/aac"];

export type TranslateResponse =
  | { ok: true; mode: "say"; heard: string; phrase: CantonesePhrase }
  | { ok: true; mode: "listen"; heard: string; text_en: string }
  | { ok: true; mode: "dish"; questions: (CantonesePhrase & { text_en: string })[] }
  | { ok: true; mode: "card"; card: CantonesePhrase & { text_en: string } }
  | { ok: true; mode: "request"; text_zh: string }
  | { ok: false; error: "onboarding" | "invalid" | "limit" | "nothing_heard" | "failed" };

function fail(error: Extract<TranslateResponse, { ok: false }>["error"], status: number) {
  return NextResponse.json<TranslateResponse>({ ok: false, error }, { status });
}

function isAudio(value: FormDataEntryValue | null | undefined): value is File {
  return value instanceof Blob && value.size > 0 && value.size <= MAX_AUDIO && AUDIO_TYPES.includes(value.type.split(";")[0]);
}

export async function POST(request: NextRequest) {
  const profile = await getCurrentProfile();
  if (onboardingStep(profile)) return fail("onboarding", 403);

  const form = await request.formData().catch(() => null);
  const mode = form?.get("mode");
  const text = String(form?.get("text") ?? "").trim().slice(0, MAX_TEXT);
  const audio = form?.get("audio");
  if (mode !== "say" && mode !== "listen" && mode !== "dish" && mode !== "card" && mode !== "request") return fail("invalid", 400);
  if ((mode === "say" || mode === "listen") && !text && !isAudio(audio)) return fail("invalid", 400);
  if (mode === "request" && !text) return fail("invalid", 400);

  // Daily limit (TRANSLATE_DAILY_LIMIT, default 100).
  const limit = Number(process.env.TRANSLATE_DAILY_LIMIT) || 100;
  const { data: used, error: quotaError } = await createAdminClient().rpc("consume_quota", {
    p_user: profile.id,
    p_kind: "translate",
    p_limit: limit,
  });
  if (quotaError) return fail("failed", 500);
  if (used === -1) return fail("limit", 429);

  try {
    if (mode === "request") return NextResponse.json<TranslateResponse>({ ok: true, mode, text_zh: await toKitchenRequest(text.slice(0, 120)) });
    if (mode === "card") {
      const restrictions = profile.restrictions
        .map(restrictionByKey)
        .filter((r) => r !== undefined)
        .map((r) => ({ label: r.label, group: r.group, forbids: r.forbids }));
      return NextResponse.json<TranslateResponse>({ ok: true, mode, card: await allergyCard(restrictions) });
    }
    if (mode === "dish") {
      const dish = { zh: String(form?.get("dish_zh") ?? "").slice(0, 60), en: String(form?.get("dish_en") ?? "").slice(0, 120) };
      if (!dish.zh) return fail("invalid", 400);
      const restrictions = profile.restrictions.map((key) => restrictionByKey(key)?.label ?? key);
      return NextResponse.json<TranslateResponse>({ ok: true, mode, questions: await dishQuestions(dish, restrictions) });
    }

    const heard = text || (await transcribe(audio as File, mode === "say" ? "en" : "staff")).slice(0, MAX_TEXT);
    if (!heard) return fail("nothing_heard", 422);

    if (mode === "say") return NextResponse.json<TranslateResponse>({ ok: true, mode, heard, phrase: await toCantonese(heard) });
    return NextResponse.json<TranslateResponse>({ ok: true, mode, heard, text_en: await toEnglish(heard) });
  } catch (error) {
    console.error("translate failed", error);
    return fail("failed", 502);
  }
}
