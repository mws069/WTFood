import { ChevronRight, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { IconTile, type TileColor } from "@/components/icon-tile";

// One row of a grouped settings list: icon tile, label, optional value, chevron.
export function SettingsRow({ href, icon, color, label, value }: { href: string; icon: LucideIcon; color: TileColor; label: string; value?: string }) {
  return (
    <Link href={href} className="flex min-h-14 items-center gap-3 px-4 active:bg-page">
      <IconTile icon={icon} color={color} size="sm" />
      <span className="flex min-h-14 flex-1 items-center gap-2 border-b border-line/70">
        <span className="flex-1 text-[16px]">{label}</span>
        {value && <span className="max-w-[45%] truncate text-sm text-muted">{value}</span>}
        <ChevronRight size={18} className="shrink-0 text-[#c4c4c4]" aria-hidden="true" />
      </span>
    </Link>
  );
}

export function SettingsGroup({ children }: { children: React.ReactNode }) {
  return <div className="overflow-hidden rounded-card bg-white [&>*:last-child>span]:border-0">{children}</div>;
}
