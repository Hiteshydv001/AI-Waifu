# --- STAGE 1: Builder ---
# This stage installs all dependencies, including build tools. It will be large.
FROM python:3.11-slim as builder

WORKDIR /app

# Install system dependencies needed for building wheels
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    espeak-ng \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Create a virtual environment
ENV VIRTUAL_ENV=/app/venv
RUN python3 -m venv $VIRTUAL_ENV
ENV PATH="$VIRTUAL_ENV/bin:$PATH"

# Copy and install Python requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# --- STAGE 2: Final ---
# This stage is the final, small image. We only copy the necessary files into it.
FROM python:3.11-slim

WORKDIR /app

# Install only the necessary system dependencies for *running* the app
RUN apt-get update && apt-get install -y --no-install-recommends \
    espeak-ng \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy the virtual environment from the builder stage
COPY --from=builder /app/venv ./venv

# Copy the application source code
COPY WaifuCore/waifu_core/ ./waifu_core
COPY WaifuCore/config/ ./config
COPY WaifuCore/main_api.py ./main.py

# Activate the virtual environment for the CMD instruction
ENV PATH="/app/venv/bin:$PATH"

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]