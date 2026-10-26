"use client";

import { useEffect, useRef, useState } from "react";

// Records speech with the microphone. Tap once to start, again to stop;
// stops by itself after a minute. iPhones record audio/mp4, most other
// browsers audio/webm. While recording, `levels` holds the loudness of the
// last moments (0–1, newest last) for the moving bars, and `seconds` the time.
const MAX_MS = 60_000;
export const BARS = 32;
const SAMPLE_MS = 70;
const SILENT = Array<number>(BARS).fill(0);

function supportedType() {
  if (typeof MediaRecorder === "undefined") return null;
  return ["audio/webm", "audio/mp4", "audio/ogg"].find((t) => MediaRecorder.isTypeSupported(t)) ?? "";
}

export function useRecorder(onDone: (audio: Blob) => void) {
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState<"unsupported" | "denied" | null>(null);
  const [levels, setLevels] = useState<number[]>(SILENT);
  const [seconds, setSeconds] = useState(0);
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
    const stopMeter = startMeter(stream, (level, elapsed) => {
      setLevels((list) => [...list.slice(1), level]);
      setSeconds(Math.floor(elapsed / 1000));
    });
    const chunks: Blob[] = [];
    const rec = new MediaRecorder(stream, type ? { mimeType: type } : undefined);
    rec.ondataavailable = (e) => chunks.push(e.data);
    rec.onstop = () => {
      stopMeter();
      stream.getTracks().forEach((t) => t.stop());
      clearTimeout(timer.current);
      setRecording(false);
      setLevels(SILENT);
      setSeconds(0);
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

  return { recording, error, levels, seconds, toggle: () => (recording ? stop() : start()) };
}

// Measures the loudness of the microphone a few times per second.
function startMeter(stream: MediaStream, onLevel: (level: number, elapsedMs: number) => void) {
  const AudioCtx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return () => {};
  const context = new AudioCtx();
  const analyser = context.createAnalyser();
  analyser.fftSize = 512;
  context.createMediaStreamSource(stream).connect(analyser);
  const samples = new Float32Array(analyser.fftSize);
  const started = Date.now();
  const interval = setInterval(() => {
    analyser.getFloatTimeDomainData(samples);
    let sum = 0;
    for (const v of samples) sum += v * v;
    // Speech is quiet in absolute terms: scale it up so normal talking fills the bars.
    onLevel(Math.min(1, Math.sqrt(sum / samples.length) * 6), Date.now() - started);
  }, SAMPLE_MS);
  return () => {
    clearInterval(interval);
    void context.close();
  };
}
