import Link from "next/link";
import { BookOpen, ChevronRight } from "lucide-react";
import { IconTile } from "@/components/icon-tile";
import { s } from "@/lib/strings";

export default function LabPage() {
  return (
    <>
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">{s.lab.title}</h1>
        <p className="mt-1 text-muted">{s.lab.intro}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/lab/knowledge" className="card flex items-center gap-4 active:scale-[0.99]">
          <IconTile icon={BookOpen} color="blue" size="lg" />
          <span className="flex-1">
            <span className="block font-bold">{s.lab.knowledgeBase}</span>
            <span className="block text-sm text-muted">{s.lab.knowledgeBaseText}</span>
          </span>
          <ChevronRight className="text-muted" />
        </Link>
      </div>
    </>
  );
}
