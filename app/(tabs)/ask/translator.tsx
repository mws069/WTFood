"use client";

import { Languages, Loader2, Maximize2, Mic, Square } from "lucide-react";
import { useState } from "react";
import type { TranslateResponse } from "@/app/api/translate/route";
import { FormMessage } from "@/components/auth-shell";
import { s } from "@/lib/strings";
import { FullScreen, PhraseBig, type Phrase } from "./phrase";
import { useRecorder } from "./use-recorder";

type Entry = { id: number; who: "you"; heard: string; phrase: Phrase } | { id: number; who: "staff"; heard: string; text_en: string };
type ErrorKey = keyof typeof s.translator.errors;

// Two directions: the student's English → Cantonese to show, and the staff's
// spoken (or typed) answer → English. The conversation stays on the screen
// only; nothing is stored.
export function Translator() {
  const [youText, setYouText] = useState("");
  const [staffText, setStaffText] = useState("");
  const [busy, setBusy] = useState<"say" | "listen" | null>(null);
  const [error, setError] = useState<ErrorKey | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [big, setBig] = useState<Phrase | null>(null);

  async function send(mode: "say" | "listen", input: { text?: string; audio?: Blob }) {
    setBusy(mode);
    setError(null);
    const body = new FormData();
    body.append("mode", mode);
    if (input.text) body.append("text", input.text);
    if (input.audio) body.append("audio", input.audio, "speech");
    try {
      const data = (await fetch("/api/translate", { method: "POST", body }).then((r) => r.json())) as TranslateResponse;
      if (!data.ok) return setError(data.error);
      const id = Date.now();
      if (data.mode === "say") {
        setEntries((list) => [{ id, who: "you", heard: data.heard, phrase: { ...data.phrase, text_en: data.heard } }, ...list]);
        setYouText("");
      } else if (data.mode === "listen") {
        setEntries((list) => [{ id, who: "staff", heard: data.heard, text_en: data.text_en }, ...list]);
        setStaffText("");
      }
    } catch {
      setError("network");
    } finally {
      setBusy(null);
    }
  }

  const you = useRecorder((audio) => send("say", { audio }));
  const staff = useRecorder((audio) => send("listen", { audio }));
  const recError = you.error ?? staff.error;

  return (
    <div className="flex flex-col gap-3">
      <section className="card flex flex-col gap-2">
        <h2 className="text-[17px] font-bold">{s.translator.youSay}</h2>
        <p className="text-sm text-muted">{s.translator.youSayHint}</p>
        <label htmlFor="you-text" className="sr-only">
          {s.translator.youSay}
        </label>
        <textarea
          id="you-text"
          value={youText}
          onChange={(e) => setYouText(e.target.value)}
          maxLength={500}
          rows={2}
          placeholder={s.translator.youPlaceholder}
          className="input min-h-20 py-3"
        />
        {you.recording ? (
          <RecordingBar levels={you.levels} seconds={you.seconds} onStop={you.toggle} />
        ) : (
          <div className="flex gap-2">
            <RecordButton recording={false} disabled={busy !== null || staff.recording} onClick={you.toggle} label={s.translator.record} />
            <button
              type="button"
              onClick={() => send("say", { text: youText })}
              disabled={!youText.trim() || busy !== null}
              className="btn-primary flex-1"
            >
              {busy === "say" ? <Loader2 size={18} className="animate-spin" /> : <Languages size={18} />}
              {busy === "say" ? s.translator.working : s.translator.translate}
            </button>
          </div>
        )}
      </section>

      <section className="card flex flex-col gap-2">
        <h2 className="text-[17px] font-bold">{s.translator.staffSays}</h2>
        <p className="text-sm text-muted">{s.translator.staffSaysHint}</p>
        {staff.recording ? (
          <RecordingBar levels={staff.levels} seconds={staff.seconds} onStop={staff.toggle} />
        ) : (
          <RecordButton
            recording={false}
            disabled={busy !== null || you.recording}
            onClick={staff.toggle}
            label={busy === "listen" ? s.translator.working : s.translator.recordStaff}
            busy={busy === "listen"}
            wide
          />
        )}
        <div className="flex gap-2">
          <label htmlFor="staff-text" className="sr-only">
            {s.translator.staffPlaceholder}
          </label>
          <input
            id="staff-text"
            value={staffText}
            onChange={(e) => setStaffText(e.target.value)}
            maxLength={500}
            placeholder={s.translator.staffPlaceholder}
            className="input min-w-0 flex-1"
            lang="zh-HK"
          />
          <button
            type="button"
            onClick={() => send("listen", { text: staffText })}
            disabled={!staffText.trim() || busy !== null}
            aria-label={s.translator.translate}
            className="btn-secondary w-14 shrink-0 px-0"
          >
            <Languages size={18} />
          </button>
        </div>
      </section>

      {(error || recError) && <FormMessage kind="error" text={s.translator.errors[error ?? recError!]} />}

      {entries.length > 0 && (
        <section className="flex flex-col gap-2">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-[17px] font-bold">{s.translator.history}</h2>
            <button type="button" onClick={() => setEntries([])} className="min-h-10 text-sm font-semibold text-muted">
              {s.translator.clear}
            </button>
          </div>
          <ul className="flex flex-col gap-2">
            {entries.map((entry) =>
              entry.who === "you" ? (
                <li key={entry.id} className="card animate-slide-up flex flex-col gap-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">{s.translator.youSay}</p>
                  <PhraseBig phrase={entry.phrase} size="md" />
                  <button type="button" onClick={() => setBig(entry.phrase)} className="inline-flex min-h-10 items-center gap-1.5 self-start text-sm font-semibold text-brand">
                    <Maximize2 size={15} /> {s.translator.showBig}
                  </button>
                </li>
              ) : (
                <li key={entry.id} className="card animate-slide-up flex flex-col gap-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">{s.translator.staffSays}</p>
                  <p className="text-lg font-bold">{entry.text_en}</p>
                  <p className="text-sm text-muted">
                    {s.translator.heard} <span lang="zh-HK">{entry.heard}</span>
                  </p>
                </li>
              ),
            )}
          </ul>
        </section>
      )}

      <p className="px-1 text-xs text-muted">{s.translator.privacy}</p>

      {big && (
        <FullScreen title={s.askStaff.title} onClose={() => setBig(null)}>
          <PhraseBig phrase={big} />
        </FullScreen>
      )}
    </div>
  );
}

// Shown while recording: red dot and time, the loudness as moving bars, Stop.
function RecordingBar({ levels, seconds, onStop }: { levels: number[]; seconds: number; onStop: () => void }) {
  return (
    <div className="flex min-h-12 items-center gap-3 rounded-full bg-avoid/10 py-1.5 pr-1.5 pl-4" role="status" aria-label={s.translator.recording}>
      <span className="size-2.5 shrink-0 animate-pulse rounded-full bg-avoid" aria-hidden="true" />
      <span className="w-9 shrink-0 text-sm font-semibold tabular-nums text-[#c4142a]">
        {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}
      </span>
      <span className="flex h-8 min-w-0 flex-1 items-center justify-end gap-[2px] overflow-hidden" aria-hidden="true">
        {levels.map((level, i) => (
          <span
            key={i}
            className="w-[3px] shrink-0 rounded-full bg-avoid transition-[height] duration-75"
            style={{ height: `${Math.max(3, Math.round(level * 32))}px`, opacity: 0.35 + 0.65 * ((i + 1) / levels.length) }}
          />
        ))}
      </span>
      <button type="button" onClick={onStop} className="inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-full bg-avoid px-4 text-sm font-semibold text-white">
        <Square size={14} fill="currentColor" /> {s.translator.stop}
      </button>
    </div>
  );
}

function RecordButton({
  recording,
  disabled,
  onClick,
  label,
  busy = false,
  wide = false,
}: {
  recording: boolean;
  disabled: boolean;
  onClick: () => void;
  label: string;
  busy?: boolean;
  wide?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled && !recording}
      aria-pressed={recording}
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-5 font-semibold ${wide ? "w-full" : ""} ${
        recording ? "animate-pulse bg-avoid text-white" : "bg-brand-light text-brand-dark"
      } disabled:opacity-50`}
    >
      {busy ? <Loader2 size={18} className="animate-spin" /> : recording ? <Square size={16} fill="currentColor" /> : <Mic size={18} />}
      {recording ? s.translator.stop : label}
    </button>
  );
}
