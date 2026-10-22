import { createClient } from "@/lib/supabase/server";
import { TermsEditor } from "./terms-editor";

export default async function LabTermsPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("ingredient_terms").select("id, term_zh, variants, ingredient_key, note").order("ingredient_key").order("term_zh");
  return <TermsEditor terms={data ?? []} />;
}
