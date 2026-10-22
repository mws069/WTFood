import { AvoidIcon, CheckIcon, OkIcon } from "@/components/icons";
import { s } from "@/lib/strings";
import type { Verdict } from "@/lib/verdict";

const STYLE: Record<Verdict, { className: string; label: string; Icon: typeof OkIcon }> = {
  ok: { className: "bg-ok/12 text-[#007a55]", label: s.verdict.ok, Icon: OkIcon },
  check: { className: "bg-check/15 text-[#b35c00]", label: s.verdict.check, Icon: CheckIcon },
  avoid: { className: "bg-avoid/12 text-[#c4142a]", label: s.verdict.avoid, Icon: AvoidIcon },
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
      <Icon size={size === "sm" ? 14 : 16} />
      {label}
    </span>
  );
}
