import { CircleCheck, CircleX, type LucideIcon, TriangleAlert } from "lucide-react";
import { s } from "@/lib/strings";
import type { Verdict } from "@/lib/verdict";

const STYLE: Record<Verdict, { className: string; label: string; Icon: LucideIcon }> = {
  ok: { className: "bg-ok/12 text-[#007a55]", label: s.verdict.ok, Icon: CircleCheck },
  check: { className: "bg-check/15 text-[#b35c00]", label: s.verdict.check, Icon: TriangleAlert },
  avoid: { className: "bg-avoid/12 text-[#c4142a]", label: s.verdict.avoid, Icon: CircleX },
};

// Verdict as a pill: always icon + word + colour, never colour alone.
export function VerdictPill({ verdict, size = "md" }: { verdict: Verdict; size?: "sm" | "md" }) {
  const { className, label, Icon } = STYLE[verdict];
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-full font-bold ${className} ${
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"
      }`}
    >
      <Icon size={size === "sm" ? 14 : 16} strokeWidth={2.5} />
      {label}
    </span>
  );
}
