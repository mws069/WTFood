// Photos picked on Home ("Scan" icon) wait here until the scan screen takes
// them. Kept in memory only (client-side navigation keeps them).
let pending: File[] = [];

export function setPendingPhotos(files: File[]) {
  pending = files;
}

export function takePendingPhotos() {
  const files = pending;
  pending = [];
  return files;
}
