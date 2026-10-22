"use client";

import { BookOpen, House, ScanLine, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { s } from "@/lib/strings";

const TABS = [
  { href: "/", label: s.tabs.home, Icon: House },
  { href: "/lexicon", label: s.tabs.lexicon, Icon: BookOpen },
  { href: "/profile", label: s.tabs.profile, Icon: UserRound },
];

// Bottom tab bar (Home · Lexicon · Profile) plus a floating Scan button in
// the bottom-right corner, above the bar.
export function TabBar() {
  const pathname = usePathname();
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <>
      {!pathname.startsWith("/scan") && (
        <div className="pointer-events-none fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom)+1rem)] z-30 mx-auto flex max-w-md justify-end px-4">
          <Link
            href="/scan"
            aria-label={s.tabs.scan}
            className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-[18px] bg-gradient-to-br from-[#5aa2ff] to-[#1677ff] text-white shadow-lg shadow-brand/40 ring-1 ring-white/40 transition active:scale-95"
          >
            <ScanLine size={28} strokeWidth={2.2} />
          </Link>
        </div>
      )}

      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-md border-t border-line/70 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur"
      >
        <ul className="grid grid-cols-3">
          {TABS.map(({ href, label, Icon }) => {
            const active = isActive(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`flex min-h-16 flex-col items-center justify-center gap-1 text-[11px] font-semibold ${active ? "text-brand" : "text-[#666]"}`}
                >
                  <Icon size={24} strokeWidth={active ? 2.3 : 1.8} />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
