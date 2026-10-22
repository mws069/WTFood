import {
  ChefHat,
  CookingPot,
  Croissant,
  CupSoda,
  Drumstick,
  EggFried,
  HandPlatter,
  IceCreamBowl,
  LeafyGreen,
  type LucideIcon,
  Popcorn,
  Soup,
  Utensils,
} from "lucide-react";
import { IconTile, type TileColor } from "@/components/icon-tile";

// Icon and colour per dish category (free text in the database; unknown → fork and knife).
const CATEGORIES: Record<string, { icon: LucideIcon; color: TileColor }> = {
  bakery: { icon: Croissant, color: "orange" },
  "cha chaan teng": { icon: EggFried, color: "yellow" },
  breakfast: { icon: EggFried, color: "yellow" },
  drink: { icon: CupSoda, color: "teal" },
  "dim sum": { icon: HandPlatter, color: "red" },
  "roast meat": { icon: Drumstick, color: "brown" },
  rice: { icon: CookingPot, color: "blue" },
  congee: { icon: Soup, color: "blue" },
  noodles: { icon: Soup, color: "orange" },
  "street food": { icon: Popcorn, color: "pink" },
  mains: { icon: ChefHat, color: "purple" },
  vegetables: { icon: LeafyGreen, color: "green" },
  dessert: { icon: IceCreamBowl, color: "pink" },
};

export function CategoryIcon({ category, size = "md" }: { category: string | null; size?: "sm" | "md" | "lg" }) {
  const { icon, color } = CATEGORIES[category?.toLowerCase() ?? ""] ?? { icon: Utensils, color: "slate" };
  return <IconTile icon={icon} color={color} size={size} />;
}
