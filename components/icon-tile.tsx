import type { LucideIcon } from "lucide-react";

// Colour palette for icon tiles: a soft gradient per colour, white glyph.
export const TILE_COLORS = {
  blue: "from-[#5aa2ff] to-[#1677ff]",
  orange: "from-[#ffc062] to-[#ff8f1f]",
  red: "from-[#ff8a6b] to-[#ff4d2e]",
  green: "from-[#4fe0a5] to-[#00b578]",
  purple: "from-[#a99bff] to-[#7158f0]",
  teal: "from-[#5be0e6] to-[#11a5b8]",
  yellow: "from-[#ffdc6b] to-[#ffb100]",
  pink: "from-[#ff9cbd] to-[#f5487f]",
  brown: "from-[#d9a57a] to-[#b06a3b]",
  slate: "from-[#9aa7bd] to-[#62708a]",
} as const;

export type TileColor = keyof typeof TILE_COLORS;

const SIZES = {
  xs: { box: "h-6 w-6 rounded-[7px]", icon: 14 },
  sm: { box: "h-8 w-8 rounded-[9px]", icon: 18 },
  md: { box: "h-10 w-10 rounded-[11px]", icon: 22 },
  lg: { box: "h-12 w-12 rounded-[14px]", icon: 26 },
  xl: { box: "h-28 w-28 rounded-[32px]", icon: 56 },
};

// A rounded square with a gradient and a white line icon, like the settings
// rows in super-apps. Decorative: the text next to it carries the meaning.
export function IconTile({ icon: Icon, color, size = "md" }: { icon: LucideIcon; color: TileColor; size?: keyof typeof SIZES }) {
  const s = SIZES[size];
  return (
    <span className={`inline-flex shrink-0 items-center justify-center bg-gradient-to-br text-white shadow-sm ${TILE_COLORS[color]} ${s.box}`} aria-hidden="true">
      <Icon size={s.icon} strokeWidth={2.2} />
    </span>
  );
}
