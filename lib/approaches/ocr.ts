import { z } from "zod";
import type { OcrLine } from "@/lib/a1-text";

// Calls our OCR service (PaddleOCR in a Docker container, see ocr-service/).
// Used by A1 and, later, A3.

const ocrResponseSchema = z.object({
  lines: z.array(z.object({ text: z.string(), confidence: z.number(), box: z.array(z.number()) })),
  latency_ms: z.number(),
});

export class OcrUnavailableError extends Error {}

export async function readText(image: Blob): Promise<OcrLine[]> {
  const url = process.env.OCR_URL;
  const key = process.env.OCR_API_KEY;
  if (!url || !key) throw new OcrUnavailableError("OCR_URL or OCR_API_KEY is not set");

  const body = new FormData();
  body.append("image", image, "photo.jpg");
  // A sleeping free Hugging Face Space needs up to about a minute to wake up.
  const response = await fetch(`${url.replace(/\/$/, "")}/ocr`, {
    method: "POST",
    headers: { "X-API-Key": key },
    body,
    signal: AbortSignal.timeout(90_000),
  }).catch((error) => {
    throw new OcrUnavailableError(String(error));
  });
  if (!response.ok) throw new OcrUnavailableError(`OCR service answered ${response.status}`);

  const parsed = ocrResponseSchema.safeParse(await response.json());
  if (!parsed.success) throw new OcrUnavailableError("Unexpected OCR response");
  return parsed.data.lines;
}
