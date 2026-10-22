import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { PageColumn } from "@/components/page-column";
import { ServiceWorker } from "@/components/service-worker";
import { s } from "@/lib/strings";
import "./globals.css";

// Manrope (SIL Open Font License, see app/fonts/OFL.txt), self-hosted, Latin only.
const manrope = localFont({
  variable: "--font-manrope",
  display: "swap",
  src: [
    { path: "./fonts/manrope-regular.woff2", weight: "400" },
    { path: "./fonts/manrope-medium.woff2", weight: "500" },
    { path: "./fonts/manrope-semibold.woff2", weight: "600" },
    { path: "./fonts/manrope-bold.woff2", weight: "700" },
    { path: "./fonts/manrope-extrabold.woff2", weight: "800" },
  ],
});

export const metadata: Metadata = {
  title: s.appName,
  description: "What can I eat here? Check Chinese menus and food labels against your dietary restrictions.",
  appleWebApp: { capable: true, title: s.appName, statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: "#1677ff",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${manrope.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <PageColumn>{children}</PageColumn>
        <ServiceWorker />
      </body>
    </html>
  );
}
