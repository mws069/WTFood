import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FlaskConical } from "lucide-react";
import { getCurrentProfile } from "@/lib/profile";
import { s } from "@/lib/strings";

// Team only. Everyone else gets a 404, so the Lab isn't even visible.
// (The database checks the team role again on every read and write.)
export default async function LabLayout({ children }: LayoutProps<"/lab">) {
  const profile = await getCurrentProfile();
  if (profile.role !== "team") notFound();

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between gap-3 border-b border-line bg-white px-4 py-3 sm:px-6">
        <Link href="/lab" className="flex items-center gap-2 text-lg font-extrabold text-brand">
          <FlaskConical /> {s.lab.title}
        </Link>
        <Link href="/profile" className="inline-flex min-h-12 items-center gap-1 text-sm font-medium text-muted">
          <ArrowLeft size={18} /> {s.lab.backToApp}
        </Link>
      </header>
      <div className="flex flex-1 flex-col gap-4 px-4 py-6 sm:px-6">{children}</div>
    </div>
  );
}
