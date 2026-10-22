"use client";

import { s } from "@/lib/strings";

// Username input that already lower-cases and drops characters that aren't allowed.
export function UsernameField({ value, onChange, error }: { value: string; onChange: (v: string) => void; error?: string | null }) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor="username" className="label">
        {s.signup.usernameLabel}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted">@</span>
        <input
          id="username"
          name="username"
          value={value}
          onChange={(e) => onChange(e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, "").slice(0, 20))}
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          placeholder={s.signup.usernamePlaceholder}
          aria-describedby="username-hint"
          aria-invalid={error ? true : undefined}
          className="input pl-9"
          required
        />
      </div>
      <p id="username-hint" className={`text-xs ${error ? "text-[#c4142a]" : "text-muted"}`}>
        {error ?? s.signup.usernameHint}
      </p>
    </div>
  );
}
