import { s } from "@/lib/strings";
import { createClient } from "@/lib/supabase/server";
import { PhrasesEditor } from "./phrases-editor";

export default async function LabPhrasesPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("staff_phrases").select("id, restriction_key, text_zh, jyutping, text_en, reviewed").order("id");
  return (
    <>
      <p className="rounded-xl bg-check/10 px-3 py-2 text-sm text-[#8a4700]">⚠️ {s.lab.phrasesNote}</p>
      <PhrasesEditor phrases={data ?? []} />
    </>
  );
}
