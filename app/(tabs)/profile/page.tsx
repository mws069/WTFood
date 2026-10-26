import { Banknote, FlaskConical, Salad, ShieldCheck, UserRound } from "lucide-react";
import { IconTile } from "@/components/icon-tile";
import { RestrictionIcon } from "@/components/restriction-icon";
import { SettingsGroup, SettingsRow } from "@/components/settings-row";
import { getCurrentProfile } from "@/lib/profile";
import { s } from "@/lib/strings";
import { LogoutButton } from "./logout-button";

// Profile as a grouped settings list.
export default async function ProfilePage() {
  const profile = await getCurrentProfile();

  return (
    <main className="flex flex-col gap-3 px-3 pt-[calc(1.5rem+env(safe-area-inset-top))]">
      <h1 className="px-1 text-2xl font-extrabold tracking-tight">{s.profile.title}</h1>

      <section className="card flex items-center gap-3">
        <IconTile icon={UserRound} color="orange" size="lg" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-bold">@{profile.username}</p>
          <p className="truncate text-sm text-muted">{profile.email}</p>
        </div>
        <div className="flex -space-x-1.5">
          {profile.restrictions.slice(0, 4).map((key) => (
            <span key={key} className="rounded-[9px] ring-2 ring-white">
              <RestrictionIcon restrictionKey={key} size="xs" />
            </span>
          ))}
        </div>
      </section>

      <SettingsGroup>
        <SettingsRow href="/restrictions" icon={Salad} color="green" label={s.profile.restrictions} value={s.profile.selected(profile.restrictions.length)} />
        <SettingsRow href="/profile/account" icon={UserRound} color="orange" label={s.profile.account} value={profile.username ? `@${profile.username}` : undefined} />
        <SettingsRow href="/profile/currency" icon={Banknote} color="teal" label={s.profile.currency} value={profile.currency ?? s.profile.currencyNone} />
      </SettingsGroup>

      <SettingsGroup>
        {profile.role === "team" && <SettingsRow href="/lab" icon={FlaskConical} color="purple" label={s.lab.entry} />}
        <SettingsRow href="/privacy" icon={ShieldCheck} color="blue" label={s.profile.privacy} />
      </SettingsGroup>

      <LogoutButton />
    </main>
  );
}
