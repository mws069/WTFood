"use client";

import { Camera, ScanText, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { FormMessage } from "@/components/auth-shell";
import { IconTile, type TileColor } from "@/components/icon-tile";
import { OAuthButtons } from "@/components/oauth-buttons";
import { Logo } from "@/lib/logo";
import { s } from "@/lib/strings";

const slides = s.welcome.slides;
const SLIDE_ICONS = [
  { icon: Camera, color: "blue" as TileColor },
  { icon: ScanText, color: "orange" as TileColor },
  { icon: ShieldCheck, color: "green" as TileColor },
];

export function Slides({ deleted }: { deleted: boolean }) {
  const [index, setIndex] = useState(0);
  const last = index === slides.length - 1;
  const slide = slides[index];

  return (
    <main className="flex flex-1 flex-col">
      <header className="flex items-center justify-between px-4 pt-6">
        <span className="flex items-center gap-2 text-lg font-extrabold text-brand">
          <Logo size={28} /> {s.appName}
        </span>
        {!last && (
          <button type="button" onClick={() => setIndex(slides.length - 1)} className="min-h-12 px-2 text-sm font-medium text-muted">
            {s.welcome.skip}
          </button>
        )}
      </header>

      {deleted && (
        <div className="px-4 pt-4">
          <FormMessage kind="info" text={s.profile.deleted} />
        </div>
      )}

      <section key={index} className="animate-slide-up flex flex-1 flex-col items-center justify-center px-6 text-center" aria-live="polite">
        <IconTile icon={SLIDE_ICONS[index].icon} color={SLIDE_ICONS[index].color} size="xl" />
        <h1 className="mt-8 text-3xl font-extrabold tracking-tight">{slide.title}</h1>
        <p className="mt-3 max-w-xs text-muted">{slide.text}</p>
      </section>

      <div className="flex justify-center gap-2 py-4" aria-hidden="true">
        {slides.map((_, i) => (
          <span key={i} className={`h-2 rounded-full transition-all ${i === index ? "w-6 bg-brand" : "w-2 bg-line"}`} />
        ))}
      </div>

      <div className="flex flex-col gap-3 px-4 pb-10">
        {last ? (
          <>
            <Link href="/signup" className="btn-primary">
              {s.welcome.createAccount}
            </Link>
            <Link href="/login" className="btn-secondary">
              {s.welcome.haveAccount}
            </Link>
            <OAuthButtons />
          </>
        ) : (
          <button type="button" onClick={() => setIndex(index + 1)} className="btn-primary">
            {s.welcome.next}
          </button>
        )}
      </div>
    </main>
  );
}
