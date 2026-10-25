# WTFood OCR service (PaddleOCR + FastAPI). Runs on Hugging Face Spaces
# (Docker, port 7860) or any server with Docker.
FROM python:3.12-slim

# System libraries OpenCV and Paddle need.
RUN apt-get update \
    && apt-get install -y --no-install-recommends libgl1 libglib2.0-0 libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Hugging Face Spaces run the container as user 1000.
RUN useradd -m -u 1000 app
USER app
ENV HOME=/home/app \
    PATH=/home/app/.local/bin:$PATH \
    PADDLE_PDX_DISABLE_MODEL_SOURCE_CHECK=True \
    PYTHONUNBUFFERED=1
WORKDIR /home/app

COPY --chown=app requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# Download the OCR models while building, so the first request is fast.
RUN python -c "from paddleocr import PaddleOCR; PaddleOCR(lang='chinese_cht', use_doc_orientation_classify=False, use_doc_unwarping=False, use_textline_orientation=False)"

COPY --chown=app app.py .

EXPOSE 7860
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "7860", "--workers", "1"]
