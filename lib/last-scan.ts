// The last scan result, kept only on this phone (localStorage), so it is
// still there after switching apps. Never sent anywhere. Saved per account,
// so another account on the same phone doesn't see it.
const KEY = "wtfood:last-scan";

export type SavedScan<T> = { userId: string; savedAt: number; data: T };

export function saveLastScan<T>(userId: string, data: T) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ userId, savedAt: Date.now(), data } satisfies SavedScan<T>));
  } catch {
    // Storage full or blocked: then there is simply no saved result.
  }
}

export function loadLastScan<T>(userId: string): SavedScan<T> | null {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) ?? "null") as SavedScan<T> | null;
    return saved?.userId === userId ? saved : null;
  } catch {
    return null;
  }
}

export function clearLastScan() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // nothing to do
  }
}
