"use client";

import { Camera, Check, History, ImageUp, Loader2, RotateCcw, Users } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { ScanError, ScanEvent } from "@/app/api/scan/route";
import { FormMessage } from "@/components/auth-shell";
import { loadLastScan, saveLastScan, type SavedScan } from "@/lib/last-scan";
import { takePendingPhoto } from "@/lib/pending-photo";
import { resizeImage } from "@/lib/resize-image";
import { RESTRICTIONS } from "@/lib/restrictions";
import type { Approach, Kind } from "@/lib/scan-schema";
import { s } from "@/lib/strings";
import type { StaffPhrase } from "./ask-staff";
import { Results, type ResultData } from "./results";

type Stage =
  | { name: "pick" }
  | { name: "preview"; blob: Blob; url: string }
  | { name: "processing"; url: string }
  | { name: "results"; data: ResultData }
  | { name: "error"; message: string; url?: string; blob?: Blob };

const FRIENDS_KEY = "wtfood:friends";

const KIND_OPTIONS: (Kind | null)[] = [null, "menu", "kiosk", "label"];

export function ScanFlow({
  initialKind,
  limit,
  isTeam,
  phrases,
  userId,
  restrictions,
  hasCurrency,
}: {
  initialKind: Kind | null;
  limit: number;
  isTeam: boolean;
  phrases: StaffPhrase[];
  userId: string;
  restrictions: string[];
  hasCurrency: boolean;
}) {
  const [kind, setKind] = useState<Kind | null>(initialKind);
  // Team only: which approach to test. Normal users always get the default.
  const [approach, setApproach] = useState<Approach>("A3");
  const [stage, setStage] = useState<Stage>({ name: "pick" });
  const [step, setStep] = useState(0);
  const cameraInput = useRef<HTMLInputElement>(null);
  const libraryInput = useRef<HTMLInputElement>(null);
  // "Eating with friends": extra restrictions for the next scans (remembered on this phone).
  const [friends, setFriends] = useState<string[]>([]);
  const [lastScan, setLastScan] = useState<SavedScan<ResultData> | null>(null);
  const [now, setNow] = useState(0);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(FRIENDS_KEY) ?? "[]");
      // eslint-disable-next-line react-hooks/set-state-in-effect -- read once from this phone's storage
      if (Array.isArray(saved)) setFriends(saved.filter((key) => !restrictions.includes(key)));
    } catch {
      // storage blocked: no friends preselected
    }
    setLastScan(loadLastScan<ResultData>(userId));
    setNow(Date.now());
  }, [userId, restrictions]);

  function toggleFriend(key: string) {
    const next = friends.includes(key) ? friends.filter((k) => k !== key) : [...friends, key];
    setFriends(next);
    try {
      localStorage.setItem(FRIENDS_KEY, JSON.stringify(next));
    } catch {
      // storage blocked: the choice still applies to this visit
    }
  }

  // The three processing steps advance on a timer; the request is one call.
  useEffect(() => {
    if (stage.name !== "processing") return;
    const timers = [setTimeout(() => setStep(1), 4000), setTimeout(() => setStep(2), 12000)];
    return () => timers.forEach(clearTimeout);
  }, [stage.name]);

  // A photo picked with the Scan icon on Home goes straight to the preview.
  useEffect(() => {
    const file = takePendingPhoto();
    if (file) void onFile(file);
  }, []);

  async function onFile(file: File | undefined) {
    if (!file) return;
    try {
      const blob = await resizeImage(file);
      setStage({ name: "preview", blob, url: URL.createObjectURL(blob) });
    } catch {
      setStage({ name: "error", message: s.scan.prepareError });
    }
  }

  // The answer is a stream: each dish appears as soon as it is ready.
  async function submit(blob: Blob, url: string) {
    setStep(0);
    setStage({ name: "processing", url });
    const body = new FormData();
    body.append("image", blob, "photo.jpg");
    if (kind) body.append("kind", kind);
    if (isTeam) body.append("approach", approach);
    if (friends.length) body.append("friends", friends.join(","));
    const fail = (message: string) => setStage({ name: "error", message, url, blob });
    const errorText = (error: ScanError) => (error === "limit" ? s.scan.errors.limit(limit) : s.scan.errors[error]);

    let response: Response;
    try {
      response = await fetch("/api/scan", { method: "POST", body });
    } catch {
      return fail(s.scan.errors.network);
    }
    if (!response.ok || !response.body || !response.headers.get("content-type")?.includes("ndjson")) {
      const data = (await response.json().catch(() => null)) as { error?: ScanError } | null;
      return fail(errorText(data?.error ?? "failed"));
    }

    let data: ResultData = { items: [], approach: isTeam ? approach : "A3", kind: null, remaining: null, rate: null, streaming: true, failed: false };
    const show = (next: Partial<ResultData>) => {
      data = { ...data, ...next };
      setStage({ name: "results", data });
    };
    const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
    let buffer = "";
    try {
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += value;
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines.filter((l) => l.trim())) {
          const event = JSON.parse(line) as ScanEvent;
          if (event.type === "item") show({ items: [...data.items, event.item] });
          else if (event.type === "done") {
            show({ approach: event.approach, kind: event.kind, remaining: event.remaining, rate: event.rate, streaming: false });
            saveLastScan(userId, data);
            setLastScan(loadLastScan<ResultData>(userId));
            URL.revokeObjectURL(url);
          } else if (event.type === "error") {
            if (data.items.length === 0) return fail(errorText(event.error));
            show({ streaming: false, failed: true });
          }
        }
      }
    } catch {
      if (data.items.length === 0) return fail(s.scan.errors.network);
      show({ streaming: false, failed: true });
    }
    // The stream ended without "done".
    if (data.streaming) {
      if (data.items.length === 0) return fail(s.scan.errors.failed);
      show({ streaming: false, failed: true });
    }
  }

  function reset() {
    setStage({ name: "pick" });
  }

  if (stage.name === "results")
    return <Results data={stage.data} phrases={phrases} isTeam={isTeam} hasCurrency={hasCurrency} onScanAgain={reset} />;

  return (
    <main className="flex flex-col gap-4 px-4 pt-[calc(1.5rem+env(safe-area-inset-top))]">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">{s.scan.title}</h1>
        <p className="mt-1 text-sm text-muted">{s.scan.intro}</p>
      </div>

      {/* Hidden file inputs: camera (phones open it directly) and photo library */}
      <input ref={cameraInput} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
      <input ref={libraryInput} type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />

      {(stage.name === "pick" || stage.name === "preview") && (
        <div>
          <p className="label mb-2">{s.scan.kindLabel}</p>
          <div className="flex flex-wrap gap-2">
            {KIND_OPTIONS.map((k) => (
              <button
                key={k ?? "auto"}
                type="button"
                aria-pressed={kind === k}
                onClick={() => setKind(k)}
                className={`min-h-11 rounded-full px-4 text-sm font-semibold ${kind === k ? "bg-brand text-white" : "bg-white ring-1 ring-line"}`}
              >
                {s.scan.kinds[k ?? "auto"]}
              </button>
            ))}
          </div>
        </div>
      )}

      {isTeam && (stage.name === "pick" || stage.name === "preview") && (
        <div>
          <p className="label mb-2">{s.scan.approachLabel}</p>
          <div className="flex flex-wrap gap-2">
            {(["A1", "A2", "A3"] as Approach[]).map((a) => (
              <button
                key={a}
                type="button"
                aria-pressed={approach === a}
                onClick={() => setApproach(a)}
                className={`min-h-11 rounded-full px-4 text-sm font-semibold ${approach === a ? "bg-[#7158f0] text-white" : "bg-white ring-1 ring-line"}`}
              >
                {s.scan.approaches[a]}
              </button>
            ))}
          </div>
        </div>
      )}

      {(stage.name === "pick" || stage.name === "preview") && (
        <details className="card group" open={friends.length > 0}>
          <summary className="flex min-h-8 cursor-pointer list-none items-center gap-2 font-semibold [&::-webkit-details-marker]:hidden">
            <Users size={18} className="text-brand" aria-hidden="true" />
            <span className="flex-1">{s.scan.friendsLabel}</span>
            {friends.length > 0 && <span className="rounded-full bg-brand px-2 text-xs font-bold text-white">{friends.length}</span>}
          </summary>
          <p className="mt-1 text-sm text-muted">{s.scan.friendsHint}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {RESTRICTIONS.filter((r) => !restrictions.includes(r.key)).map((r) => (
              <button
                key={r.key}
                type="button"
                aria-pressed={friends.includes(r.key)}
                onClick={() => toggleFriend(r.key)}
                className={`min-h-10 rounded-full px-3.5 text-sm font-semibold ${friends.includes(r.key) ? "bg-ink text-white" : "bg-white ring-1 ring-line"}`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </details>
      )}

      {stage.name === "pick" && (
        <div className="flex flex-col gap-3">
          {lastScan && (
            <button type="button" onClick={() => setStage({ name: "results", data: lastScan.data })} className="card flex items-center gap-3 py-3 text-left active:scale-[0.99]">
              <History size={20} className="shrink-0 text-brand" aria-hidden="true" />
              <span className="flex-1 text-sm font-semibold">
                {s.scan.lastResult(lastScan.data.items.length, s.scan.ago(Math.max(0, Math.floor((now - lastScan.savedAt) / 60000))))}
              </span>
            </button>
          )}
          <button type="button" onClick={() => cameraInput.current?.click()} className="card flex flex-col items-center gap-3 py-10 active:scale-[0.99]">
            <span className="flex h-20 w-20 items-center justify-center rounded-[24px] bg-gradient-to-br from-[#5aa2ff] to-[#1677ff] text-white shadow-lg shadow-brand/30">
              <Camera size={38} strokeWidth={2} />
            </span>
            <span className="text-lg font-bold">{s.scan.takePhoto}</span>
          </button>
          <button type="button" onClick={() => libraryInput.current?.click()} className="btn-secondary">
            <ImageUp size={20} /> {s.scan.choosePhoto}
          </button>
          <p className="px-2 text-center text-xs text-muted">{s.scan.privacyNote}</p>
        </div>
      )}

      {stage.name === "preview" && (
        <div className="flex flex-col gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element -- local preview of the user's photo */}
          <img src={stage.url} alt="" className="max-h-[50vh] w-full rounded-card bg-black object-contain" />
          <div className="flex gap-2">
            <button type="button" onClick={reset} className="btn-secondary flex-1">
              <RotateCcw size={18} /> {s.scan.retake}
            </button>
            <button type="button" onClick={() => submit(stage.blob, stage.url)} className="btn-primary flex-[2]">
              {s.scan.check}
            </button>
          </div>
        </div>
      )}

      {stage.name === "processing" && (
        <div className="flex flex-col gap-4">
          <div className="relative overflow-hidden rounded-card bg-black">
            {/* eslint-disable-next-line @next/next/no-img-element -- local preview of the user's photo */}
            <img src={stage.url} alt="" className="max-h-[45vh] w-full object-contain opacity-80" />
            <div className="animate-scan-line absolute inset-x-0 h-1 bg-brand shadow-[0_0_24px_6px_rgba(22,119,255,0.7)]" />
          </div>
          <ol className="card flex flex-col gap-3" aria-live="polite">
            {s.scan.steps.map((label, i) => (
              <li key={label} className={`flex items-center gap-3 text-sm font-medium ${i > step ? "text-muted" : ""}`}>
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full ${
                    i < step ? "bg-ok text-white" : i === step ? "bg-brand-light text-brand" : "bg-page"
                  }`}
                >
                  {i < step ? <Check size={16} strokeWidth={3} /> : i === step ? <Loader2 size={16} className="animate-spin" /> : i + 1}
                </span>
                {label}
              </li>
            ))}
          </ol>
          <p className="text-center text-xs text-muted">{s.scan.stepsHint}</p>
        </div>
      )}

      {stage.name === "error" && (
        <div className="flex flex-col gap-3">
          <FormMessage kind="error" text={stage.message} />
          <div className="flex gap-2">
            <button type="button" onClick={reset} className="btn-secondary flex-1">
              <RotateCcw size={18} /> {s.scan.retake}
            </button>
            {stage.blob && stage.url && (
              <button type="button" onClick={() => submit(stage.blob!, stage.url!)} className="btn-primary flex-1">
                {s.scan.tryAgain}
              </button>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
