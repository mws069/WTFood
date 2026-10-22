import { ImageResponse } from "next/og";
import { AppIcon } from "@/lib/app-icon";

const SIZES = [32, 192, 512];

// Serves /icon/32 (favicon), /icon/192 and /icon/512 (PWA manifest).
export function generateImageMetadata() {
  return SIZES.map((s) => ({
    id: String(s),
    size: { width: s, height: s },
    contentType: "image/png",
  }));
}

export default async function Icon({ id }: { id: Promise<string> }) {
  const size = Number(await id);
  return new ImageResponse(<AppIcon size={size} />, { width: size, height: size });
}
