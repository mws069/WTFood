"use client";

import { BookOpen, House, ScanLine, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { s } from "@/lib/strings";

const TABS = [
  { href: "/", label: s.tabs.home, Icon: House },
  { href: "/scan", label: s.tabs.scan, Icon: ScanLine, centre: true },
  { href: "/lexicon", label: s.tabs.lexicon, Icon: BookOpen },
  { href: "/profile", label: s.tabs.profile, Icon: UserRound },
];

// Bottom tab bar: Home · Scan (centre, prominent) · Lexicon · Profile.
export function TabBar() {
  const pathname = usePathname();
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-md border-t border-line/70 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur"
    >
      <ul className="grid grid-cols-4">
        {TABS.map(({ href, label, Icon, centre }) => {
          const active = isActive(href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-16 flex-col items-center justify-center gap-1 text-[11px] font-semibold ${active ? "text-brand" : "text-[#666]"}`}
              >
                {centre ? (
                  <span className="-mt-7 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#5aa2ff] to-[#1677ff] text-white shadow-lg shadow-brand/30 ring-4 ring-white">
                    <Icon size={26} strokeWidth={2.2} />
                  </span>
                ) : (
                  <Icon size={24} strokeWidth={active ? 2.3 : 1.8} />
                )}
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
