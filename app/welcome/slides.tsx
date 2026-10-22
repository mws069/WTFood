"use client";

import Link from "next/link";
import { useState } from "react";
import { FormMessage } from "@/components/auth-shell";
import { Logo } from "@/lib/logo";
import { s } from "@/lib/strings";

const slides = s.welcome.slides;

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
        <div className="flex h-40 w-40 items-center justify-center rounded-full bg-brand-light text-7xl">{slide.emoji}</div>
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
