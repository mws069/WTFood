import { formatConverted, type Rate } from "@/lib/currency";

// Price as a two-part tag: HK$ in bold, the converted value next to it.
export function PriceTag({ hkd, raw, rate, size = "sm" }: { hkd: number | null; raw?: string | null; rate: Rate | null; size?: "sm" | "md" }) {
  const text = size === "md" ? "text-base" : "text-[13px]";
  return (
    <span className={`inline-flex shrink-0 items-center overflow-hidden rounded-full ring-1 ring-ink ${text} leading-none`}>
      <span className="bg-ink px-2.5 py-1.5 font-bold text-white tabular-nums">{hkd !== null ? `HK$${hkd}` : raw}</span>
      {hkd !== null && rate && <span className="bg-white px-2 py-1.5 font-semibold text-muted tabular-nums">{formatConverted(hkd, rate.code, rate.rate)}</span>}
    </span>
  );
}
