"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { s } from "@/lib/strings";

const TABS = [
  { href: "/lab/knowledge/dishes", label: s.lab.tabs.dishes },
  { href: "/lab/knowledge/terms", label: s.lab.tabs.terms },
  { href: "/lab/knowledge/phrases", label: s.lab.tabs.phrases },
];

export function KnowledgeTabs() {
  const pathname = usePathname();
  return (
    <nav aria-label={s.lab.knowledgeBase} className="flex gap-2 overflow-x-auto">
      {TABS.map((t) => {
        const active = pathname.startsWith(t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={active ? "page" : undefined}
            className={`inline-flex min-h-12 shrink-0 items-center rounded-full px-5 text-sm font-semibold ${
              active ? "bg-brand text-white" : "bg-white text-ink ring-1 ring-line"
            }`}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
