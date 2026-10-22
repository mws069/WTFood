"use client";

import Link from "next/link";
import { useState } from "react";
import { SearchIcon } from "@/components/icons";
import { dishMatches } from "@/lib/dishes";
import { s } from "@/lib/strings";

type Row = {
  id: number;
  name_zh: string;
  aliases: string[];
  jyutping: string | null;
  name_en: string;
  category: string | null;
  status: string;
};

const FILTERS = [
  { key: "all", label: s.lab.all },
  { key: "draft", label: s.lab.drafts },
  { key: "verified", label: s.lab.verified },
] as const;

export function DishTable({ dishes }: { dishes: Row[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<(typeof FILTERS)[number]["key"]>("all");
  const shown = dishes.filter((d) => (status === "all" || d.status === status) && dishMatches(d, query));
  const verified = dishes.filter((d) => d.status === "verified").length;

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <label className="relative min-w-60 flex-1">
          <span className="sr-only">{s.lab.search}</span>
          <SearchIcon size={20} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={s.lexicon.searchPlaceholder} className="input rounded-full pl-11" />
        </label>
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            aria-pressed={status === f.key}
            onClick={() => setStatus(f.key)}
            className={`min-h-12 rounded-full px-4 text-sm font-semibold ${status === f.key ? "bg-ink text-white" : "bg-white ring-1 ring-line"}`}
          >
            {f.label}
          </button>
        ))}
        <Link href="/lab/knowledge/dishes/new" className="btn-primary">
          + {s.lab.newDish}
        </Link>
      </div>

      <p className="text-sm text-muted">{s.lab.dishesCount(dishes.length, verified)}</p>

      <div className="card overflow-x-auto p-0">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3">{s.lab.fields.nameEn}</th>
              <th className="px-4 py-3">{s.lab.fields.nameZh}</th>
              <th className="hidden px-4 py-3 md:table-cell">{s.lab.fields.jyutping}</th>
              <th className="hidden px-4 py-3 md:table-cell">{s.lab.fields.category}</th>
              <th className="px-4 py-3">{s.lab.fields.status}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {shown.map((d) => (
              <tr key={d.id} className="hover:bg-page">
                <td className="px-4 py-3 font-medium">
                  <Link href={`/lab/knowledge/dishes/${d.id}`} className="link">
                    {d.name_en}
                  </Link>
                </td>
                <td className="px-4 py-3" lang="zh-HK">
                  {d.name_zh}
                </td>
                <td className="hidden px-4 py-3 text-muted md:table-cell">{d.jyutping}</td>
                <td className="hidden px-4 py-3 text-muted md:table-cell">{d.category}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      d.status === "verified" ? "bg-ok/12 text-[#007a55]" : "bg-page text-muted ring-1 ring-line"
                    }`}
                  >
                    {d.status === "verified" ? s.lab.verified : s.lexicon.draft}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {shown.length === 0 && <p className="px-4 py-8 text-center text-muted">{s.lexicon.noResults}</p>}
      </div>
    </section>
  );
}
