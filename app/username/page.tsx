import { AtSign } from "lucide-react";
import { redirect } from "next/navigation";
import { IconTile } from "@/components/icon-tile";
import { UsernameForm } from "@/components/username-form";
import { getCurrentProfile } from "@/lib/profile";
import { s } from "@/lib/strings";

// Onboarding step for accounts without a username (e.g. older accounts).
export default async function UsernamePage() {
  const profile = await getCurrentProfile();
  if (profile.username) redirect("/");

  return (
    <main className="flex flex-1 flex-col justify-center gap-6 px-4 py-10">
      <div className="text-center">
        <span className="inline-flex">
          <IconTile icon={AtSign} color="purple" size="xl" />
        </span>
        <h1 className="mt-4 text-2xl font-extrabold tracking-tight">{s.username.title}</h1>
        <p className="mt-2 text-muted">{s.username.intro}</p>
      </div>
      <div className="card">
        <UsernameForm initial="" onboarding />
      </div>
      <form action="/auth/signout" method="post" className="text-center">
        <button type="submit" className="min-h-12 text-sm font-medium text-muted">
          {s.consent.logout}
        </button>
      </form>
    </main>
  );
}
