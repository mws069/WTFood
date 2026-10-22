import type { LucideIcon } from "lucide-react";
import { IconTile, type TileColor } from "@/components/icon-tile";

// Empty state for screens that arrive in a later milestone.
export function Placeholder({ title, text, icon, color }: { title: string; text: string; icon: LucideIcon; color: TileColor }) {
  return (
    <main className="flex flex-1 flex-col px-4 pt-[calc(1.5rem+env(safe-area-inset-top))]">
      <h1 className="text-2xl font-extrabold tracking-tight">{title}</h1>
      <div className="card mt-6 flex flex-col items-center gap-3 py-12 text-center">
        <IconTile icon={icon} color={color} size="xl" />
        <p className="max-w-xs text-muted">{text}</p>
      </div>
    </main>
  );
}
