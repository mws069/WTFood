import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ServiceWorker } from "@/components/service-worker";
import { s } from "@/lib/strings";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
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
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        {/* Mobile-first: on desktop a centred phone-width column. */}
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col bg-page">{children}</div>
        <ServiceWorker />
      </body>
    </html>
  );
}
