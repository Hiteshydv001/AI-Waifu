# Use a slim Python base image
FROM python:3.11-slim

# Set the working directory in the container
WORKDIR /app

# Prevent Python from writing .pyc files
ENV PYTHONDONTWRITEBYTECODE 1
# Ensure Python output is sent straight to the terminal
ENV PYTHONUNBUFFERED 1

# --- System Dependencies ---
# Install any system packages your Python libraries might need.
# 'espeak-ng' is required for Kokoro TTS, for example.
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    espeak-ng \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# --- Python Dependencies ---
# Copy the full requirements file from the project root
COPY requirements.txt .

# Install the dependencies
RUN pip install --no-cache-dir -r requirements.txt

# --- Application Code ---
# Copy the application source code into the container
COPY WaifuCore/waifu_core/ ./waifu_core
COPY WaifuCore/config/ ./config
COPY WaifuCore/main_api.py ./main.py

# --- Expose Port and Run ---
EXPOSE 8000

# Command to run the application using uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]