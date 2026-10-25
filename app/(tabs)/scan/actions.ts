"use server";

import { z } from "zod";
import { getCurrentProfile } from "@/lib/profile";
import { createClient } from "@/lib/supabase/server";

const reportSchema = z.object({
  approach: z.enum(["A1", "A2", "A3"]),
  itemText: z.string().max(200),
  verdict: z.enum(["ok", "check", "avoid"]),
  comment: z.string().trim().max(1000),
});

// "Report mistake" on a result card. Stored with the user id (deleted with the
// account); only the team can read it.
export async function reportMistake(input: z.infer<typeof reportSchema>) {
  const parsed = reportSchema.safeParse(input);
  if (!parsed.success) return { error: true };
  const profile = await getCurrentProfile();
  const supabase = await createClient();
  const { error } = await supabase.from("feedback").insert({
    user_id: profile.id,
    approach: parsed.data.approach,
    item_text: parsed.data.itemText,
    verdict_shown: parsed.data.verdict,
    comment: parsed.data.comment || null,
  });
  return { error: Boolean(error) };
}
