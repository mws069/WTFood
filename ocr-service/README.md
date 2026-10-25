# WTFood OCR service

Finds the text lines in a photo of a Chinese menu, kiosk screen or food label
(Traditional and Simplified Chinese and English). Uses PaddleOCR's PP-OCRv6
models through [RapidOCR](https://github.com/RapidAI/RapidOCR) on ONNX Runtime,
which is about 10× faster on normal x86 servers than the Paddle engine
(which also crashed with its fast oneDNN mode on Cloud Run). Used by the WTFood
app for approaches A1 and A3.

| Endpoint | What it does |
|---|---|
| `GET /health` | `{"status": "ok"}` – no key needed |
| `POST /ocr` | multipart field `image`, header `X-API-Key` → `{"lines": [{"text", "confidence", "box": [x1, y1, x2, y2]}], "width", "height", "latency_ms"}` |

Photos are only processed in memory and never stored.

## Configuration

| Variable | Secret? | What it is |
|---|---|---|
| `OCR_API_KEY` | **secret** | Requests without this key in `X-API-Key` are refused |

## Deploy: Google Cloud Run (current)

Cloud Run builds the container from this folder (no local Docker needed) and
only runs it while requests come in, so it costs almost nothing. The first
request after a break takes 20–40 s while the container starts.

```bash
gcloud run deploy wtfood-ocr \
  --source . \
  --region us-east4 \
  --port 7860 \
  --memory 2Gi --cpu 2 --cpu-boost \
  --concurrency 1 --min-instances 0 --max-instances 2 \
  --timeout 120 \
  --allow-unauthenticated \
  --set-env-vars OCR_API_KEY=…
```

`--allow-unauthenticated` only means Google does not check a login; the
service itself refuses every request without the right `X-API-Key`.
The app needs the service URL in `OCR_URL` and the same key in `OCR_API_KEY`.

## Deploy: any server with Docker

```bash
docker build -t wtfood-ocr .
docker run -d --restart unless-stopped -p 7860:7860 -e OCR_API_KEY=… --name wtfood-ocr wtfood-ocr
curl http://localhost:7860/health
```

Put it behind HTTPS (e.g. Caddy) before using it from the app.
