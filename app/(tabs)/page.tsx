import { ArrowRight, BookOpen, Camera, ChevronRight, Lightbulb, MessagesSquare, ScanLine, ScanText, Search } from "lucide-react";
import Link from "next/link";
import { IconTile } from "@/components/icon-tile";
import { RestrictionIcon } from "@/components/restriction-icon";
import { getCurrentProfile } from "@/lib/profile";
import { restrictionByKey } from "@/lib/restrictions";
import { s } from "@/lib/strings";

const QUICK_ACTIONS = [
  { href: "/scan?kind=menu", label: s.home.quickActions.scanMenu, Icon: ScanLine },
  { href: "/scan?kind=label", label: s.home.quickActions.scanLabel, Icon: ScanText },
  { href: "/lexicon", label: s.home.quickActions.lexicon, Icon: BookOpen },
  { href: "/scan", label: s.home.quickActions.askStaff, Icon: MessagesSquare },
];

// Home like a super-app: blue header with greeting, search and white quick
// actions; below a white sheet with the big Scan card, the user's
// restrictions as an icon grid and a tip.
export default async function HomePage() {
  const profile = await getCurrentProfile();
  const restrictions = profile.restrictions.map(restrictionByKey).filter((r) => r !== undefined);

  return (
    <main className="flex flex-col">
      <header className="bg-gradient-to-b from-[#2b86ff] to-[#1677ff] px-4 pb-10 pt-[calc(1.25rem+env(safe-area-inset-top))] text-white">
        <p className="text-sm font-semibold text-white/85">{s.home.greeting(profile.username)}</p>
        <h1 className="mt-0.5 text-[26px] font-extrabold leading-tight tracking-tight">{s.home.headline}</h1>

        <form action="/lexicon" className="mt-4 flex h-11 items-center gap-2 rounded-full bg-white pl-4 pr-1.5 text-ink">
          <Search size={18} className="shrink-0 text-muted" aria-hidden="true" />
          <label htmlFor="home-search" className="sr-only">
            {s.home.searchPlaceholder}
          </label>
          <input id="home-search" name="q" type="search" placeholder={s.home.searchPlaceholder} className="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-muted" />
          <span className="h-5 w-px bg-line" aria-hidden="true" />
          <button type="submit" className="h-8 rounded-full px-3 text-[15px] font-semibold text-brand">
            {s.home.search}
          </button>
        </form>

        <nav aria-label="Quick actions" className="mt-5 grid grid-cols-4">
          {QUICK_ACTIONS.map(({ href, label, Icon }) => (
            <Link key={label} href={href} className="flex flex-col items-center gap-1.5 py-1 text-[13px] font-semibold active:opacity-70">
              <Icon size={34} strokeWidth={1.7} aria-hidden="true" />
              {label}
            </Link>
          ))}
        </nav>
      </header>

      <div className="-mt-5 flex flex-col gap-3 rounded-t-[22px] bg-page px-3 pt-3">
        <Link href="/scan" className="card animate-slide-up flex items-center gap-4 p-4 active:scale-[0.99]">
          <IconTile icon={Camera} color="blue" size="lg" />
          <span className="min-w-0 flex-1">
            <span className="block text-[17px] font-bold">{s.home.scanTitle}</span>
            <span className="block text-sm text-muted">{s.home.scanText}</span>
          </span>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand text-white">
            <ArrowRight size={20} strokeWidth={2.4} aria-hidden="true" />
          </span>
        </Link>

        <section className="card">
          <div className="flex items-center justify-between">
            <h2 className="text-[17px] font-bold">{s.home.myRestrictions}</h2>
            <Link href="/restrictions" className="inline-flex min-h-10 items-center gap-0.5 text-sm text-muted">
              {s.home.edit} <ChevronRight size={16} aria-hidden="true" />
            </Link>
          </div>
          <ul className="mt-2 grid grid-cols-4 gap-y-4">
            {restrictions.map((r) => (
              <li key={r.key} className="flex flex-col items-center gap-1.5 text-center text-xs font-medium leading-tight">
                <RestrictionIcon restrictionKey={r.key} size="lg" />
                {r.label}
              </li>
            ))}
          </ul>
        </section>

        <section className="card flex items-center gap-3">
          <IconTile icon={Lightbulb} color="yellow" size="md" />
          <p className="text-sm">
            <span className="font-bold">{s.home.tipTitle}: </span>
            {s.home.tipText}
          </p>
        </section>
      </div>
    </main>
  );
}
