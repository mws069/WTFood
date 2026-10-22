import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { parseIngredients } from "@/lib/dishes";
import { s } from "@/lib/strings";
import { createClient } from "@/lib/supabase/server";
import { DishForm } from "../dish-form";

const dateFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Hong_Kong" });

export default async function EditDishPage({ params }: PageProps<"/lab/knowledge/dishes/[id]">) {
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();

  const supabase = await createClient();
  const { data: dish } = await supabase.from("dishes").select("*").eq("id", id).maybeSingle();
  if (!dish) notFound();

  const { data: verifier } = dish.verified_by
    ? await supabase.from("profiles").select("display_name").eq("id", dish.verified_by).maybeSingle()
    : { data: null };

  return (
    <>
      <Link href="/lab/knowledge/dishes" className="inline-flex min-h-12 items-center gap-1 self-start text-sm font-medium text-muted">
        <ArrowLeft size={18} /> {s.lab.tabs.dishes}
      </Link>
      <div>
        <h2 className="text-xl font-bold">
          {dish.name_en} <span lang="zh-HK">{dish.name_zh}</span>
        </h2>
        <p className="text-sm text-muted">
          {dish.status === "verified" && dish.verified_by
            ? s.lab.verifiedBy(verifier?.display_name ?? "?", dateFormat.format(new Date(dish.updated_at)))
            : s.lab.updated(dateFormat.format(new Date(dish.updated_at)))}
        </p>
      </div>
      <DishForm
        id={dish.id}
        initial={{
          name_zh: dish.name_zh,
          aliases: dish.aliases.join(", "),
          jyutping: dish.jyutping ?? "",
          name_en: dish.name_en,
          description_en: dish.description_en ?? "",
          category: dish.category ?? "",
          source_url: dish.source_url ?? "",
          status: dish.status === "verified" ? "verified" : "draft",
          ingredients: parseIngredients(dish.ingredients),
        }}
      />
    </>
  );
}
