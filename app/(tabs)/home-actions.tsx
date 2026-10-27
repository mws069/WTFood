"use client";

import { BookOpen, Camera, CircleHelp, ImageUp, MessagesSquare, ScanLine, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { setPendingPhotos } from "@/lib/pending-photo";
import { s } from "@/lib/strings";

// The white icon row in the blue Home header (Alipay style). "Scan" asks
// camera or photo library first, then opens the scan screen with the photos.
export function HomeActions() {
  const [sheet, setSheet] = useState(false);
  const router = useRouter();
  const camera = useRef<HTMLInputElement>(null);
  const library = useRef<HTMLInputElement>(null);

  function onFiles(files: FileList | null) {
    if (!files?.length) return;
    setPendingPhotos([...files]);
    setSheet(false);
    router.push("/scan");
  }

  return (
    <>
      <ul className="mt-5 grid grid-cols-4 text-center text-[13px] font-semibold text-white">
        <li>
          <button type="button" onClick={() => setSheet(true)} className="flex w-full flex-col items-center gap-1.5 py-1">
            <ScanLine size={30} strokeWidth={1.8} aria-hidden="true" />
            {s.home.actions.scan}
          </button>
        </li>
        <Action href="/lexicon" icon={BookOpen} label={s.home.actions.lexicon} />
        <Action href="/ask" icon={MessagesSquare} label={s.home.actions.ask} />
        <Action href="/faq" icon={CircleHelp} label={s.home.actions.faq} />
      </ul>

      <input ref={camera} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => onFiles(e.target.files)} />
      {/* Several photos of a long menu can be picked at once. */}
      <input ref={library} type="file" accept="image/*" multiple className="hidden" onChange={(e) => onFiles(e.target.files)} />

      {sheet && (
        <div role="dialog" aria-modal="true" aria-label={s.home.scanSheetTitle} className="fixed inset-0 z-50 flex items-end bg-black/40" onClick={() => setSheet(false)}>
          <div
            className="animate-slide-up mx-auto flex w-full max-w-md flex-col gap-2 rounded-t-3xl bg-white px-5 pt-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] text-ink"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-1 text-lg font-extrabold">{s.home.scanSheetTitle}</h2>
            <button type="button" onClick={() => camera.current?.click()} className="btn-primary">
              <Camera size={20} /> {s.scan.takePhoto}
            </button>
            <button type="button" onClick={() => library.current?.click()} className="btn-secondary">
              <ImageUp size={20} /> {s.scan.choosePhoto}
            </button>
            <button type="button" onClick={() => setSheet(false)} className="min-h-12 text-sm font-semibold text-muted">
              {s.home.scanSheetCancel}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function Action({ href, icon: Icon, label }: { href: string; icon: LucideIcon; label: string }) {
  return (
    <li>
      <Link href={href} className="flex flex-col items-center gap-1.5 py-1">
        <Icon size={30} strokeWidth={1.8} aria-hidden="true" />
        {label}
      </Link>
    </li>
  );
}
