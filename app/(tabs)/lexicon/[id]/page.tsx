import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon } from "@/components/icons";
import { VerdictPill } from "@/components/verdict-pill";
import { parseIngredients } from "@/lib/dishes";
import { ingredientByKey } from "@/lib/ingredients";
import { getCurrentProfile } from "@/lib/profile";
import { s } from "@/lib/strings";
import { createClient } from "@/lib/supabase/server";
import { verdictFor } from "@/lib/verdict";

const CERTAINTY_ORDER = ["listed", "always", "usually", "sometimes"] as const;

export default async function DishPage({ params }: PageProps<"/lexicon/[id]">) {
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();

  const profile = await getCurrentProfile();
  const supabase = await createClient();
  const { data: dish } = await supabase.from("dishes").select("*").eq("id", id).maybeSingle();
  if (!dish) notFound();

  const ingredients = parseIngredients(dish.ingredients).sort(
    (a, b) => CERTAINTY_ORDER.indexOf(a.certainty) - CERTAINTY_ORDER.indexOf(b.certainty),
  );
  const result = verdictFor({ ingredients }, profile.restrictions);
  const flagged = new Set(result.reasons.map((r) => r.ingredient));

  return (
    <main className="flex flex-col gap-4 px-4 pb-4 pt-[calc(1rem+env(safe-area-inset-top))]">
      <Link href="/lexicon" className="inline-flex min-h-12 items-center gap-1 self-start text-sm font-medium text-muted">
        <ArrowLeftIcon size={18} /> {s.lexicon.back}
      </Link>

      {dish.status === "draft" && <p className="rounded-xl bg-page px-3 py-2 text-sm text-muted ring-1 ring-line">{s.lexicon.draftNote}</p>}

      <div className="animate-slide-up">
        <p className="text-4xl font-bold" lang="zh-HK">
          {dish.name_zh}
        </p>
        {dish.jyutping && <p className="mt-1 text-muted">{dish.jyutping}</p>}
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight">{dish.name_en}</h1>
        {dish.description_en && <p className="mt-2">{dish.description_en}</p>}
        {dish.aliases.length > 0 && (
          <p className="mt-2 text-sm text-muted" lang="zh-HK">
            {dish.aliases.join(" · ")}
          </p>
        )}
      </div>

      <section className="card flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-bold">{s.lexicon.forYou}</h2>
          <VerdictPill verdict={result.verdict} />
        </div>
        {result.reasons.length > 0 ? (
          <ul className="flex flex-col gap-1 text-sm">
            {result.reasons.map((r) => (
              <li key={r.text} className={r.level === "avoid" ? "font-semibold text-[#c4142a]" : "text-[#b35c00]"}>
                {r.text}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted">{s.verdict.noIssues}</p>
        )}
      </section>

      {ingredients.length > 0 && (
        <section className="card">
          <h2 className="font-bold">{s.lexicon.ingredients}</h2>
          <ul className="mt-3 flex flex-col divide-y divide-line">
            {ingredients.map((i) => (
              <li key={i.key} className="flex items-center justify-between gap-3 py-2 text-sm">
                <span className={flagged.has(i.key) ? "font-semibold" : undefined}>{ingredientByKey(i.key)?.label ?? i.key}</span>
                <span className="shrink-0 text-muted">{s.certainty[i.certainty]}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="text-xs text-muted">
        {s.lexicon.disclaimer}
        {dish.source_url && (
          <>
            {" "}
            <a href={dish.source_url} target="_blank" rel="noreferrer" className="link">
              {s.lexicon.source}
            </a>
          </>
        )}
      </p>
    </main>
  );
}
