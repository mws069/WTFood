import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { getCurrentProfile } from "@/lib/profile";
import { s } from "@/lib/strings";
import { CurrencyForm } from "./currency-form";

export default async function CurrencyPage() {
  const profile = await getCurrentProfile();
  return (
    <main className="flex flex-col gap-3 px-3 pt-[calc(1rem+env(safe-area-inset-top))]">
      <Link href="/profile" className="inline-flex min-h-11 items-center gap-0.5 self-start px-1 text-[15px] text-brand">
        <ChevronLeft size={20} aria-hidden="true" /> {s.profile.back}
      </Link>
      <div className="px-1">
        <h1 className="text-2xl font-extrabold tracking-tight">{s.profile.currencyTitle}</h1>
        <p className="mt-1 text-sm text-muted">{s.profile.currencyIntro}</p>
      </div>
      <CurrencyForm current={profile.currency} />
    </main>
  );
}
