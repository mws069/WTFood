---
title: WTFood OCR
emoji: 🔤
colorFrom: blue
colorTo: indigo
sdk: docker
app_port: 7860
pinned: false
---

# WTFood OCR service

Finds the text lines in a photo of a Chinese menu, kiosk screen or food label
(PaddleOCR, Traditional and Simplified Chinese and English). Used by the WTFood
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
| `OCR_LANG` | public | PaddleOCR language, default `chinese_cht` |

## Deploy

**Hugging Face Spaces (current):** this folder is pushed as a Docker Space; `OCR_API_KEY` is set as a Space secret.

**Any server with Docker** (e.g. a small VPS with 4 GB RAM):

```bash
docker build -t wtfood-ocr .
docker run -d --restart unless-stopped -p 7860:7860 -e OCR_API_KEY=… --name wtfood-ocr wtfood-ocr
curl http://localhost:7860/health
```

Put it behind HTTPS (e.g. Caddy) before using it from the app.
