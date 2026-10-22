"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronRight, Search } from "lucide-react";
import { CategoryIcon } from "@/components/category-icon";
import { VerdictPill } from "@/components/verdict-pill";
import { dishMatches } from "@/lib/dishes";
import { s } from "@/lib/strings";
import type { Verdict } from "@/lib/verdict";

type Dish = {
  id: number;
  name_zh: string;
  aliases: string[];
  jyutping: string | null;
  name_en: string;
  category: string | null;
  draft: boolean;
  verdict: Verdict;
};

// Search runs in the browser: the whole list is small (≈200 dishes).
export function LexiconList({ dishes, initialQuery }: { dishes: Dish[]; initialQuery: string }) {
  const [query, setQuery] = useState(initialQuery);
  const shown = dishes.filter((d) => dishMatches(d, query));

  return (
    <>
      <label className="relative block">
        <span className="sr-only">{s.lexicon.searchLabel}</span>
        <Search size={20} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={s.lexicon.searchPlaceholder}
          className="input rounded-full pl-11"
        />
      </label>

      <p className="text-xs font-medium text-muted" aria-live="polite">
        {s.lexicon.count(shown.length)}
      </p>

      {shown.length === 0 ? (
        <div className="card py-8 text-center text-sm text-muted">{s.lexicon.noResults}</div>
      ) : (
        <ul className="card flex flex-col divide-y divide-line p-0">
          {shown.map((d) => (
            <li key={d.id}>
              <Link href={`/lexicon/${d.id}`} className="flex min-h-16 items-center gap-3 px-4 py-3 active:bg-page">
                <CategoryIcon category={d.category} />
                <span className="min-w-0 flex-1">
                  <span className="line-clamp-2 font-semibold leading-snug">{d.name_en}</span>
                  <span className="mt-0.5 flex items-center gap-1.5 text-sm text-muted">
                    {d.draft && <span className="shrink-0 rounded-full bg-page px-1.5 text-xs font-semibold ring-1 ring-line">{s.lexicon.draft}</span>}
                    <span className="truncate">
                      <span lang="zh-HK">{d.name_zh}</span>
                      {d.jyutping && ` · ${d.jyutping}`}
                    </span>
                  </span>
                </span>
                <VerdictPill verdict={d.verdict} size="sm" />
                <ChevronRight size={18} className="shrink-0 text-muted" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
