# WTFood OCR service (PP-OCR models via RapidOCR/ONNX Runtime + FastAPI).
# Runs on Google Cloud Run or any server with Docker, on port 7860.
FROM python:3.12-slim

# System libraries OpenCV needs.
RUN apt-get update \
    && apt-get install -y --no-install-recommends libgl1 libglib2.0-0 libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Runs as a normal user (uid 1000), not as root.
RUN useradd -m -u 1000 app
USER app
ENV HOME=/home/app \
    PATH=/home/app/.local/bin:$PATH \
    PYTHONUNBUFFERED=1
WORKDIR /home/app

COPY --chown=app requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# Load (and if needed download) the OCR models while building, so the first request is fast.
RUN python -c "from rapidocr import RapidOCR; RapidOCR()"

COPY --chown=app app.py .

EXPOSE 7860
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "7860", "--workers", "1"]
