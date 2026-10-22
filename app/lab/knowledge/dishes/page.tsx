import { createClient } from "@/lib/supabase/server";
import { DishTable } from "./dish-table";

export default async function LabDishesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("dishes")
    .select("id, name_zh, aliases, jyutping, name_en, category, status, updated_at")
    .order("updated_at", { ascending: false });
  return <DishTable dishes={data ?? []} />;
}
