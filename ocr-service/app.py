"""WTFood OCR service: finds the text lines in a photo.

Uses PaddleOCR's PP-OCR models (Chinese incl. Traditional, and English)
through RapidOCR, which runs them on ONNX Runtime: much faster on normal
x86 servers than the Paddle engine.

POST /ocr     multipart field "image", header "X-API-Key" → text lines with confidence and box
GET  /health  no key needed → {"status": "ok"}

The photo is only held in memory for the request and never written to disk.
"""

import hmac
import os
import threading
import time

import cv2
import numpy as np
from fastapi import FastAPI, File, Header, HTTPException, UploadFile
from rapidocr import RapidOCR

API_KEY = os.environ.get("OCR_API_KEY", "")
MAX_BYTES = 8 * 1024 * 1024

app = FastAPI(title="WTFood OCR", docs_url=None, redoc_url=None)

# Loading the models takes a moment, so it happens once at start-up.
engine = RapidOCR()
# One recognition at a time keeps memory use predictable.
engine_lock = threading.Lock()


@app.get("/")
@app.get("/health")
def health():
    return {"status": "ok", "engine": "rapidocr"}


@app.post("/ocr")
def run_ocr(image: UploadFile = File(...), x_api_key: str = Header(default="")):
    # Constant-time comparison, and refuse everything if no key is configured.
    if not API_KEY or not hmac.compare_digest(x_api_key.encode(), API_KEY.encode()):
        raise HTTPException(status_code=401, detail="invalid api key")

    data = image.file.read(MAX_BYTES + 1)
    if not data or len(data) > MAX_BYTES:
        raise HTTPException(status_code=413, detail="image missing or too large")

    picture = cv2.imdecode(np.frombuffer(data, dtype=np.uint8), cv2.IMREAD_COLOR)
    if picture is None:
        raise HTTPException(status_code=400, detail="not an image")

    started = time.time()
    with engine_lock:
        result = engine(picture)

    lines = []
    if result.txts:
        for text, score, polygon in zip(result.txts, result.scores, result.boxes):
            if not text.strip():
                continue
            xs = [p[0] for p in polygon]
            ys = [p[1] for p in polygon]
            lines.append(
                {
                    "text": text,
                    "confidence": round(float(score), 4),
                    "box": [int(min(xs)), int(min(ys)), int(max(xs)), int(max(ys))],
                }
            )

    height, width = picture.shape[:2]
    return {
        "lines": lines,
        "width": int(width),
        "height": int(height),
        "latency_ms": int((time.time() - started) * 1000),
    }
