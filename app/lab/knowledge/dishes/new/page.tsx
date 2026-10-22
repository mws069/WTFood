import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { s } from "@/lib/strings";
import { DishForm } from "../dish-form";

export default function NewDishPage() {
  return (
    <>
      <Link href="/lab/knowledge/dishes" className="inline-flex min-h-12 items-center gap-1 self-start text-sm font-medium text-muted">
        <ArrowLeft size={18} /> {s.lab.tabs.dishes}
      </Link>
      <h2 className="text-xl font-bold">{s.lab.newDish}</h2>
      <DishForm
        id={null}
        initial={{ name_zh: "", aliases: "", jyutping: "", name_en: "", description_en: "", category: "", source_url: "", status: "draft", ingredients: [] }}
      />
    </>
  );
}
