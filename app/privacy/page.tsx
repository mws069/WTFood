import Link from "next/link";
import { ArrowLeftIcon } from "@/components/icons";
import { s } from "@/lib/strings";

export const metadata = { title: `${s.privacy.title} · ${s.appName}` };

// Public page: plain-language privacy notice (PDPO).
export default function PrivacyPage() {
  return (
    <main className="flex flex-col gap-4 px-4 pb-10 pt-6">
      <Link href="/" className="inline-flex min-h-12 items-center gap-1 self-start text-sm font-medium text-muted">
        <ArrowLeftIcon size={18} /> {s.privacy.back}
      </Link>
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">{s.privacy.title}</h1>
        <p className="mt-1 text-sm text-muted">{s.privacy.updated}</p>
      </div>
      {s.privacy.sections.map((section) => (
        <section key={section.title} className="card">
          <h2 className="font-bold">{section.title}</h2>
          <ul className="mt-2 flex flex-col gap-2 text-sm">
            {section.text.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </section>
      ))}
    </main>
  );
}
