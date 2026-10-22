import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeftIcon } from "@/components/icons";
import { getCurrentProfile } from "@/lib/profile";
import { s } from "@/lib/strings";
import { RestrictionsPicker } from "./picker";

// Used twice: during onboarding (after consent) and from the profile to edit.
export default async function RestrictionsPage({ searchParams }: PageProps<"/restrictions">) {
  const profile = await getCurrentProfile();
  if (!profile.healthConsentAt) redirect("/consent");

  const onboarding = (await searchParams).onboarding === "1" || profile.restrictions.length === 0;

  return (
    <main className="flex flex-1 flex-col px-4 pb-6 pt-6">
      {!onboarding && (
        <Link href="/profile" className="mb-2 inline-flex min-h-12 items-center gap-1 self-start text-sm font-medium text-muted">
          <ArrowLeftIcon size={18} /> {s.common.back}
        </Link>
      )}
      <h1 className="text-2xl font-extrabold tracking-tight">{onboarding ? s.restrictions.title : s.restrictions.editTitle}</h1>
      <p className="mt-2 text-muted">{s.restrictions.intro}</p>
      <RestrictionsPicker initial={profile.restrictions} onboarding={onboarding} />
    </main>
  );
}
