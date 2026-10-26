import { getCurrentProfile } from "@/lib/profile";
import { KINDS, type Kind } from "@/lib/scan-schema";
import { createClient } from "@/lib/supabase/server";
import { ScanFlow } from "./scan-flow";

export default async function ScanPage({ searchParams }: PageProps<"/scan">) {
  const { kind } = await searchParams;
  const initialKind = KINDS.includes(kind as Kind) ? (kind as Kind) : null;
  const profile = await getCurrentProfile();
  // Ask-staff questions for the user's restrictions, in the order they chose them.
  const supabase = await createClient();
  const { data } = await supabase
    .from("staff_phrases")
    .select("restriction_key, text_zh, jyutping, text_en, reviewed")
    .in("restriction_key", profile.restrictions);
  const phrases = profile.restrictions.flatMap((key) => (data ?? []).filter((p) => p.restriction_key === key).slice(0, 1));
  return (
    <ScanFlow
      initialKind={initialKind}
      limit={Number(process.env.SCAN_DAILY_LIMIT) || 30}
      isTeam={profile.role === "team"}
      phrases={phrases}
      userId={profile.id}
      restrictions={profile.restrictions}
      hasCurrency={profile.currency !== null}
    />
  );
}
