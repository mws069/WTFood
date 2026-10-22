import Link from "next/link";
import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { IconTile } from "@/components/icon-tile";
import { getCurrentProfile } from "@/lib/profile";
import { s } from "@/lib/strings";
import { ConsentForm } from "./consent-form";

// Shown once after sign-up: restrictions are health data (PDPO), so we ask
// for explicit consent before storing any.
export default async function ConsentPage() {
  const profile = await getCurrentProfile();
  if (profile.healthConsentAt) redirect("/");

  return (
    <main className="flex flex-1 flex-col justify-center gap-6 px-4 py-10">
      <div className="text-center">
        <span className="inline-flex">
          <IconTile icon={ShieldCheck} color="blue" size="xl" />
        </span>
        <h1 className="mt-4 text-2xl font-extrabold tracking-tight">{s.consent.title}</h1>
      </div>

      <div className="card flex flex-col gap-3">
        <p className="font-medium">{s.consent.text}</p>
        <ul className="flex flex-col gap-2 text-sm text-muted">
          {s.consent.points.map((point) => (
            <li key={point} className="flex gap-2">
              <span aria-hidden="true">•</span>
              {point}
            </li>
          ))}
        </ul>
        <Link href="/privacy" className="link text-sm">
          {s.consent.privacyLink}
        </Link>
      </div>

      <ConsentForm />

      <form action="/auth/signout" method="post" className="text-center">
        <button type="submit" className="min-h-12 text-sm font-medium text-muted">
          {s.consent.logout}
        </button>
      </form>
    </main>
  );
}
