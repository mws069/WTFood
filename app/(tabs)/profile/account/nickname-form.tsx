"use client";

import { useState, useTransition } from "react";
import { s } from "@/lib/strings";
import { saveNickname } from "../actions";

export function NicknameForm({ initial }: { initial: string }) {
  const [value, setValue] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="flex flex-col gap-1"
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          const result = await saveNickname(value);
          if (result.error) return setStatus("error");
          setSaved(result.nickname);
          setValue(result.nickname);
          setStatus("saved");
        });
      }}
    >
      <label htmlFor="nickname" className="label">
        {s.profile.nickname}
      </label>
      <div className="flex gap-2">
        <input
          id="nickname"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setStatus("idle");
          }}
          maxLength={40}
          placeholder={s.profile.noNickname}
          className="input"
        />
        {value.trim() !== saved && (
          <button type="submit" disabled={pending} className="btn-primary shrink-0 px-5">
            {s.common.save}
          </button>
        )}
      </div>
      <p className="min-h-5 text-xs" aria-live="polite">
        {status === "saved" && <span className="text-ok">{s.profile.nicknameSaved}</span>}
        {status === "error" && <span className="text-avoid">{s.common.errorGeneric}</span>}
      </p>
    </form>
  );
}
