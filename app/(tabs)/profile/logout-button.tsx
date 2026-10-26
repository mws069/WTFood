"use client";

import { useRef } from "react";
import { clearDeviceData } from "@/lib/offline";
import { s } from "@/lib/strings";

// Logging out also removes what WTFood saved on this phone (last scan,
// allergy card, the Ask-staff page kept for offline use).
export function LogoutButton() {
  const form = useRef<HTMLFormElement>(null);
  return (
    <form
      ref={form}
      action="/auth/signout"
      method="post"
      onSubmit={(e) => {
        e.preventDefault();
        void clearDeviceData().finally(() => form.current?.submit());
      }}
    >
      <button type="submit" className="min-h-14 w-full rounded-card bg-white text-[16px] font-medium active:bg-page">
        {s.profile.logout}
      </button>
    </form>
  );
}
