import Link from "next/link";
import { Logo } from "@/lib/logo";

// Frame for the logged-out pages: logo, headline, intro, then the form.
export function AuthShell({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: string;
  children: React.ReactNode;
}) {
  return (
    <main className="flex flex-1 flex-col justify-center gap-6 px-4 py-10">
      <div className="text-center">
        <Link href="/welcome" className="inline-flex text-brand" aria-label="WTFood">
          <Logo size={64} />
        </Link>
        <h1 className="mt-3 text-2xl font-extrabold tracking-tight">{title}</h1>
        {intro && <p className="mt-2 text-muted">{intro}</p>}
      </div>
      {children}
    </main>
  );
}

export function FormMessage({ kind, text }: { kind: "error" | "info"; text: string }) {
  return (
    <p
      role={kind === "error" ? "alert" : "status"}
      className={`rounded-xl px-3 py-2 text-sm ${
        kind === "error" ? "bg-avoid/10 text-[#c4142a]" : "bg-brand-light text-brand-dark"
      }`}
    >
      {text}
    </p>
  );
}
