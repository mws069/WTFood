import {
  Bean,
  Beef,
  Droplet,
  Egg,
  Fish,
  Ham,
  type LucideIcon,
  Milk,
  MoonStar,
  Nut,
  Salad,
  Shrimp,
  TreeDeciduous,
  Vegan,
  Wheat,
  WineOff,
} from "lucide-react";
import { IconTile, type TileColor } from "@/components/icon-tile";

// Icon and colour per restriction (kept out of lib/restrictions.ts so the
// rule engine stays free of React).
const ICONS: Record<string, { icon: LucideIcon; color: TileColor }> = {
  lactose: { icon: Milk, color: "blue" },
  gluten: { icon: Wheat, color: "yellow" },
  peanut: { icon: Nut, color: "brown" },
  tree_nuts: { icon: TreeDeciduous, color: "brown" },
  shellfish: { icon: Shrimp, color: "red" },
  egg: { icon: Egg, color: "orange" },
  fish: { icon: Fish, color: "teal" },
  soy: { icon: Bean, color: "green" },
  sesame: { icon: Droplet, color: "yellow" },
  vegetarian: { icon: Salad, color: "green" },
  vegan: { icon: Vegan, color: "green" },
  halal: { icon: MoonStar, color: "teal" },
  no_pork: { icon: Ham, color: "pink" },
  no_beef: { icon: Beef, color: "red" },
  no_alcohol: { icon: WineOff, color: "purple" },
};

export function RestrictionIcon({ restrictionKey, size = "sm" }: { restrictionKey: string; size?: "xs" | "sm" | "md" | "lg" }) {
  const { icon, color } = ICONS[restrictionKey] ?? { icon: Salad, color: "slate" };
  return <IconTile icon={icon} color={color} size={size} />;
}
