import { clearLastScan } from "@/lib/last-scan";

// Everything WTFood keeps on this phone for one account: the last scan, the
// allergy card and the Ask-staff page saved for offline use. Removed on
// logout and when the account is deleted.
export async function clearDeviceData() {
  clearLastScan();
  try {
    localStorage.removeItem("wtfood:allergy-card");
    localStorage.removeItem("wtfood:friends");
  } catch {
    // storage blocked: nothing saved
  }
  if ("caches" in window) await caches.delete("wtfood-pages-v1").catch(() => false);
}
