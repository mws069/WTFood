"use client";

import { usePathname } from "next/navigation";

// Mobile-first: a centred phone-width column on desktop. The Lab uses the full width.
export function PageColumn({ children }: { children: React.ReactNode }) {
  const wide = usePathname().startsWith("/lab");
  return <div className={`mx-auto flex w-full flex-1 flex-col bg-page ${wide ? "max-w-6xl" : "max-w-md"}`}>{children}</div>;
}
