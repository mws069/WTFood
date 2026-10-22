import Link from "next/link";
import { ChevronRightIcon, ShieldIcon } from "@/components/icons";
import { getCurrentProfile } from "@/lib/profile";
import { restrictionByKey } from "@/lib/restrictions";
import { s } from "@/lib/strings";
import { DeleteAccount } from "./delete-account";
import { NicknameForm } from "./nickname-form";

const dateFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Hong_Kong" });

export default async function ProfilePage() {
  const profile = await getCurrentProfile();
  const restrictions = profile.restrictions.map(restrictionByKey).filter((r) => r !== undefined);

  return (
    <main className="flex flex-col gap-4 px-4 pt-[calc(1.5rem+env(safe-area-inset-top))]">
      <h1 className="text-2xl font-extrabold tracking-tight">{s.profile.title}</h1>

      <section className="card flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-bold">{s.profile.restrictions}</h2>
          <Link href="/restrictions" className="link inline-flex min-h-12 items-center px-1 text-sm">
            {s.profile.edit}
          </Link>
        </div>
        <ul className="flex flex-wrap gap-2">
          {restrictions.map((r) => (
            <li key={r.key} className="inline-flex items-center gap-1.5 rounded-full bg-brand-light px-3 py-1.5 text-sm font-medium text-brand-dark">
              <span aria-hidden="true">{r.emoji}</span>
              {r.label}
            </li>
          ))}
        </ul>
        {profile.healthConsentAt && (
          <p className="text-xs text-muted">{s.profile.consentGiven(dateFormat.format(new Date(profile.healthConsentAt)))}</p>
        )}
      </section>

      <section className="card flex flex-col gap-3">
        <h2 className="font-bold">{s.profile.account}</h2>
        <NicknameForm initial={profile.displayName ?? ""} />
        <div>
          <p className="label">{s.profile.email}</p>
          <p className="mt-1 break-all text-muted">{profile.email}</p>
        </div>
      </section>

      <Link href="/privacy" className="card flex min-h-12 items-center gap-3 active:scale-[0.99]">
        <ShieldIcon className="text-brand" />
        <span className="flex-1 font-medium">{s.profile.privacy}</span>
        <ChevronRightIcon className="text-muted" />
      </Link>

      <form action="/auth/signout" method="post">
        <button type="submit" className="btn-secondary w-full">
          {s.profile.logout}
        </button>
      </form>

      <DeleteAccount />
    </main>
  );
}
