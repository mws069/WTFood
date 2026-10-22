import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { UsernameForm } from "@/components/username-form";
import { getCurrentProfile } from "@/lib/profile";
import { s } from "@/lib/strings";
import { DeleteAccount } from "./delete-account";

const dateFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Hong_Kong" });

export default async function AccountPage() {
  const profile = await getCurrentProfile();

  return (
    <main className="flex flex-col gap-3 px-3 pt-[calc(1rem+env(safe-area-inset-top))]">
      <Link href="/profile" className="inline-flex min-h-12 items-center gap-1 self-start px-1 text-sm font-medium text-muted">
        <ArrowLeft size={18} /> {s.profile.back}
      </Link>
      <h1 className="px-1 text-2xl font-extrabold tracking-tight">{s.profile.accountTitle}</h1>

      <section className="card flex flex-col gap-3">
        <UsernameForm initial={profile.username ?? ""} onboarding={false} />
        <div>
          <p className="label">{s.profile.email}</p>
          <p className="mt-1 break-all text-muted">{profile.email}</p>
        </div>
        {profile.healthConsentAt && <p className="text-xs text-muted">{s.profile.consentGiven(dateFormat.format(new Date(profile.healthConsentAt)))}</p>}
      </section>

      <DeleteAccount />
    </main>
  );
}
