// A photo picked on Home ("Scan" icon) waits here until the scan screen
// takes it. Kept in memory only (client-side navigation keeps it).
let pending: File | null = null;

export function setPendingPhoto(file: File) {
  pending = file;
}

export function takePendingPhoto() {
  const file = pending;
  pending = null;
  return file;
}
