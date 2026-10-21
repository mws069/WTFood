import { ImageResponse } from "next/og";
import { AppIcon } from "@/lib/app-icon";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Home-screen icon on iPhone.
export default function AppleIcon() {
  return new ImageResponse(<AppIcon size={180} />, size);
}
