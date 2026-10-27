import { CircleDot, CupSoda, HandPlatter, IceCreamBowl, LeafyGreen, type LucideIcon, Package, Soup, Utensils, UtensilsCrossed } from "lucide-react";
import type { DishCategory } from "@/lib/scan-schema";
import { s } from "@/lib/strings";

// Kind of dish on a result card: soft colour, icon and word (never colour alone).
const STYLE: Record<DishCategory, { icon: LucideIcon; className: string }> = {
  drink: { icon: CupSoda, className: "bg-[#e3f7f9] text-[#0b7d8c]" },
  snack: { icon: HandPlatter, className: "bg-[#ffece7] text-[#c4371a]" },
  main: { icon: UtensilsCrossed, className: "bg-[#fff2e0] text-[#b35c00]" },
  soup: { icon: Soup, className: "bg-[#e8f1ff] text-[#0e5fd8]" },
  side: { icon: LeafyGreen, className: "bg-[#e3f8ef] text-[#007a55]" },
  dessert: { icon: IceCreamBowl, className: "bg-[#ffe9f1] text-[#c4285e]" },
  set: { icon: Utensils, className: "bg-[#efecff] text-[#5a43d6]" },
  packaged: { icon: Package, className: "bg-[#eef1f5] text-[#4b586e]" },
  other: { icon: CircleDot, className: "bg-[#eef1f5] text-[#4b586e]" },
};

export function DishCategoryChip({ category }: { category: DishCategory }) {
  const { icon: Icon, className } = STYLE[category];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ${className}`}>
      <Icon size={13} strokeWidth={2.4} aria-hidden="true" />
      {s.dishCategories[category]}
    </span>
  );
}
