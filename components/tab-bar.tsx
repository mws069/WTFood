"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookIcon, HomeIcon, ScanIcon, UserIcon } from "@/components/icons";
import { s } from "@/lib/strings";

const TABS = [
  { href: "/", label: s.tabs.home, Icon: HomeIcon },
  { href: "/scan", label: s.tabs.scan, Icon: ScanIcon, centre: true },
  { href: "/lexicon", label: s.tabs.lexicon, Icon: BookIcon },
  { href: "/profile", label: s.tabs.profile, Icon: UserIcon },
];

// Bottom tab bar: Home · Scan (centre, prominent) · Lexicon · Profile.
export function TabBar() {
  const pathname = usePathname();
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-md border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur"
    >
      <ul className="grid grid-cols-4">
        {TABS.map(({ href, label, Icon, centre }) => {
          const active = isActive(href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-16 flex-col items-center justify-center gap-0.5 text-xs font-medium ${
                  active ? "text-brand" : "text-muted"
                }`}
              >
                {centre ? (
                  <span className="-mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-brand text-white shadow-lg shadow-brand/30 ring-4 ring-white">
                    <Icon size={26} />
                  </span>
                ) : (
                  <Icon size={24} />
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
