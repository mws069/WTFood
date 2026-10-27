// Shrinks a photo in the browser and re-encodes it as JPEG. Drawing it on a
// canvas keeps only the pixels, so EXIF data (GPS location, camera, time) is
// removed before anything leaves the phone. The long side stays big enough
// for small menu text.
export async function resizeImage(file: Blob, maxSide = 2000, quality = 0.85): Promise<Blob> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Could not encode image"))), "image/jpeg", quality),
  );
}

// Several photos must fit into one upload (the server accepts about 4 MB):
// shrink them step by step until they do.
const BUDGET = 3_800_000;
const STEPS: [number, number][] = [
  [1600, 0.8],
  [1300, 0.75],
  [1100, 0.7],
];

export async function fitTogether(photos: Blob[]): Promise<Blob[]> {
  let result = photos;
  for (const [maxSide, quality] of STEPS) {
    if (result.reduce((sum, b) => sum + b.size, 0) <= BUDGET) break;
    result = await Promise.all(result.map((photo) => resizeImage(photo, maxSide, quality)));
  }
  return result;
}
