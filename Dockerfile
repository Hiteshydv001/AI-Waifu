# Stage 1: Build the React Frontend
FROM node:18-slim AS builder
WORKDIR /app/Frontend

COPY WaifuCore/Frontend/package*.json ./
RUN npm install

COPY WaifuCore/Frontend ./
RUN npm run build

# Stage 2: Build the Python Backend and Final Image
FROM python:3.11-slim
ENV PYTHONUNBUFFERED=1
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    espeak-ng \
    libsndfile1 \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/Frontend/dist /app/static
COPY WaifuCore ./WaifuCore
COPY README.md ./

RUN pip install --no-cache-dir --upgrade pip
RUN pip install --no-cache-dir -r WaifuCore/requirements.txt

EXPOSE 8000

CMD ["uvicorn", "WaifuCore.main_api:app", "--host", "0.0.0.0", "--port", "8000"]