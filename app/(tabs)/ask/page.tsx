import { getCurrentProfile } from "@/lib/profile";
import { s } from "@/lib/strings";
import { createClient } from "@/lib/supabase/server";
import { QuickPhrases } from "./quick-phrases";
import { Translator } from "./translator";

// Ask staff: translator (both directions) and ready-made questions.
export default async function AskPage() {
  const profile = await getCurrentProfile();
  const supabase = await createClient();
  const { data } = await supabase
    .from("staff_phrases")
    .select("restriction_key, text_zh, jyutping, text_en, reviewed")
    .in("restriction_key", [...profile.restrictions, "general"])
    .order("id");
  const phrases = data ?? [];

  return (
    <main className="flex flex-col gap-3 px-4 pt-[calc(1.5rem+env(safe-area-inset-top))]">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">{s.translator.title}</h1>
        <p className="text-sm text-muted">{s.translator.intro}</p>
      </div>
      <Translator />
      <QuickPhrases
        groups={[
          { title: s.translator.forYou, phrases: profile.restrictions.flatMap((key) => phrases.filter((p) => p.restriction_key === key)) },
          { title: s.translator.general, phrases: phrases.filter((p) => p.restriction_key === "general") },
        ]}
      />
    </main>
  );
}
