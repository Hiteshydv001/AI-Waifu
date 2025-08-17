
FROM python:3.11-slim
ENV PYTHONUNBUFFERED=1
WORKDIR /app

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    gcc \
    g++ \
    make \
    espeak-ng \
    libsndfile1 \
    ffmpeg && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

COPY WaifuCore ./WaifuCore
COPY README.md ./

RUN pip install --no-cache-dir --upgrade pip
RUN pip install --no-cache-dir -r WaifuCore/requirements.txt

EXPOSE 8000

CMD ["uvicorn", "WaifuCore.main_api:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]