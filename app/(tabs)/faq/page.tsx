import { Plus } from "lucide-react";
import { s } from "@/lib/strings";

export default function FaqPage() {
  return (
    <main className="flex flex-col gap-3 px-4 pt-[calc(1.5rem+env(safe-area-inset-top))]">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">{s.faq.title}</h1>
        <p className="text-sm text-muted">{s.faq.intro}</p>
      </div>
      <ul className="flex flex-col gap-2">
        {s.faq.items.map((item) => (
          <li key={item.q}>
            <details className="card group">
              <summary className="flex min-h-10 cursor-pointer list-none items-center gap-3 font-bold [&::-webkit-details-marker]:hidden">
                <span className="flex-1">{item.q}</span>
                <Plus size={20} className="shrink-0 text-brand transition group-open:rotate-45" aria-hidden="true" />
              </summary>
              <p className="mt-2 text-sm leading-relaxed text-ink/80">{item.a}</p>
            </details>
          </li>
        ))}
      </ul>
    </main>
  );
}
