"""WTFood OCR service: finds the text lines in a photo (PaddleOCR).

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
from paddleocr import PaddleOCR

API_KEY = os.environ.get("OCR_API_KEY", "")
LANG = os.environ.get("OCR_LANG", "chinese_cht")  # recognises Traditional and Simplified Chinese and English
MAX_BYTES = 8 * 1024 * 1024

app = FastAPI(title="WTFood OCR", docs_url=None, redoc_url=None)

# Loading the models takes a while, so it happens once at start-up.
ocr = PaddleOCR(
    lang=LANG,
    use_doc_orientation_classify=False,
    use_doc_unwarping=False,
    use_textline_orientation=False,
)
# One recognition at a time: the model is not thread-safe.
ocr_lock = threading.Lock()


@app.get("/")
@app.get("/health")
def health():
    return {"status": "ok", "lang": LANG}


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
    with ocr_lock:
        result = ocr.predict(picture)[0]

    lines = [
        {"text": text, "confidence": round(float(score), 4), "box": [int(v) for v in box]}
        for text, score, box in zip(result["rec_texts"], result["rec_scores"], result["rec_boxes"])
        if text.strip()
    ]
    height, width = picture.shape[:2]
    return {
        "lines": lines,
        "width": int(width),
        "height": int(height),
        "latency_ms": int((time.time() - started) * 1000),
    }
