"use client";

import { useEffect, useRef, useState } from "react";

// Records speech with the microphone. Tap once to start, again to stop;
// stops by itself after a minute. iPhones record audio/mp4, most other
// browsers audio/webm.
const MAX_MS = 60_000;

function supportedType() {
  if (typeof MediaRecorder === "undefined") return null;
  return ["audio/webm", "audio/mp4", "audio/ogg"].find((t) => MediaRecorder.isTypeSupported(t)) ?? "";
}

export function useRecorder(onDone: (audio: Blob) => void) {
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState<"unsupported" | "denied" | null>(null);
  const recorder = useRef<MediaRecorder | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const done = useRef(onDone);
  useEffect(() => {
    done.current = onDone;
  }, [onDone]);

  // Stop the microphone when the screen is left.
  useEffect(
    () => () => {
      if (recorder.current?.state === "recording") recorder.current.stop();
    },
    [],
  );

  async function start() {
    const type = supportedType();
    if (type === null || !navigator.mediaDevices?.getUserMedia) return setError("unsupported");
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      return setError("denied");
    }
    setError(null);
    const chunks: Blob[] = [];
    const rec = new MediaRecorder(stream, type ? { mimeType: type } : undefined);
    rec.ondataavailable = (e) => chunks.push(e.data);
    rec.onstop = () => {
      stream.getTracks().forEach((t) => t.stop());
      clearTimeout(timer.current);
      setRecording(false);
      const audio = new Blob(chunks, { type: rec.mimeType || type || "audio/webm" });
      if (audio.size > 0) done.current(audio);
    };
    rec.start();
    recorder.current = rec;
    setRecording(true);
    timer.current = setTimeout(() => rec.state === "recording" && rec.stop(), MAX_MS);
  }

  function stop() {
    if (recorder.current?.state === "recording") recorder.current.stop();
  }

  return { recording, error, toggle: () => (recording ? stop() : start()) };
}
