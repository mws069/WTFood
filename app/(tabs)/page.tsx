import Link from "next/link";
import { BookIcon, BulbIcon, CameraIcon, ChatIcon, ChevronRightIcon, LabelIcon, MenuIcon, ShieldIcon } from "@/components/icons";
import { getCurrentProfile } from "@/lib/profile";
import { restrictionByKey } from "@/lib/restrictions";
import { s } from "@/lib/strings";

const QUICK_ACTIONS = [
  { href: "/scan?kind=menu", label: s.home.quickActions.scanMenu, Icon: MenuIcon },
  { href: "/scan?kind=label", label: s.home.quickActions.scanLabel, Icon: LabelIcon },
  { href: "/lexicon", label: s.home.quickActions.lexicon, Icon: BookIcon },
  { href: "/scan", label: s.home.quickActions.askStaff, Icon: ChatIcon },
  { href: "/restrictions", label: s.home.quickActions.restrictions, Icon: ShieldIcon },
];

// Home like a super-app: blue header with greeting and a big Scan card,
// a grid of round quick actions, then a tips card.
export default async function HomePage() {
  const profile = await getCurrentProfile();
  const restrictions = profile.restrictions.map(restrictionByKey).filter((r) => r !== undefined);

  return (
    <main className="flex flex-col">
      <header className="bg-brand px-4 pb-16 pt-[calc(1.5rem+env(safe-area-inset-top))] text-white">
        <p className="text-sm font-medium text-white/80">{s.home.greeting(profile.displayName)}</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight">{s.home.headline}</h1>
      </header>

      <div className="-mt-12 flex flex-col gap-4 px-4">
        <Link href="/scan" className="card animate-slide-up flex items-center gap-4 p-5 shadow-lg shadow-brand/10 active:scale-[0.99]">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-brand text-white">
            <CameraIcon size={32} />
          </span>
          <span className="flex-1">
            <span className="block text-lg font-bold">{s.home.scanTitle}</span>
            <span className="block text-sm text-muted">{s.home.scanText}</span>
          </span>
          <ChevronRightIcon className="text-muted" />
        </Link>

        <nav aria-label="Quick actions" className="card grid grid-cols-5 gap-1 px-2 py-4">
          {QUICK_ACTIONS.map(({ href, label, Icon }) => (
            <Link key={label} href={href} className="flex flex-col items-center gap-2 text-center text-xs font-medium leading-tight">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-light text-brand">
                <Icon size={22} />
              </span>
              {label}
            </Link>
          ))}
        </nav>

        <section className="card">
          <h2 className="text-sm font-semibold text-muted">{s.home.checkingFor}</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {restrictions.map((r) => (
              <li key={r.key} className="inline-flex items-center gap-1.5 rounded-full bg-brand-light px-3 py-1.5 text-sm font-medium text-brand-dark">
                <span aria-hidden="true">{r.emoji}</span>
                {r.label}
              </li>
            ))}
          </ul>
        </section>

        <section className="card flex gap-3 bg-[#fff7ec]">
          <BulbIcon className="shrink-0 text-check" />
          <div>
            <h2 className="font-bold">{s.home.tipTitle}</h2>
            <p className="mt-1 text-sm">{s.home.tipText}</p>
          </div>
        </section>
      </div>
    </main>
  );
}
