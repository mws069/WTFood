import { getCurrentProfile } from "@/lib/profile";
import { parseIngredients } from "@/lib/dishes";
import { s } from "@/lib/strings";
import { createClient } from "@/lib/supabase/server";
import { verdictFor } from "@/lib/verdict";
import { LexiconList } from "./lexicon-list";

// Users see verified dishes; team members also see drafts (Row Level Security).
export default async function LexiconPage() {
  const profile = await getCurrentProfile();
  const supabase = await createClient();
  const { data } = await supabase
    .from("dishes")
    .select("id, name_zh, aliases, jyutping, name_en, ingredients, status")
    .order("name_en");

  const dishes = (data ?? []).map((d) => ({
    id: d.id,
    name_zh: d.name_zh,
    aliases: d.aliases,
    jyutping: d.jyutping,
    name_en: d.name_en,
    draft: d.status === "draft",
    verdict: verdictFor({ ingredients: parseIngredients(d.ingredients) }, profile.restrictions).verdict,
  }));

  return (
    <main className="flex flex-col gap-4 px-4 pt-[calc(1.5rem+env(safe-area-inset-top))]">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">{s.lexicon.title}</h1>
        <p className="mt-1 text-sm text-muted">{s.lexicon.intro}</p>
      </div>
      {dishes.length === 0 ? <div className="card py-10 text-center text-muted">{s.lexicon.empty}</div> : <LexiconList dishes={dishes} />}
    </main>
  );
}
