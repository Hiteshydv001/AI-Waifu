
FROM python:3.11-slim
ENV PYTHONUNBUFFERED=1
WORKDIR /app

# Install only essential dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    gcc \
    g++ && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copy only the minimal requirements
COPY WaifuCore/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy only the minimal API file
COPY WaifuCore/main_api_minimal.py ./main.py

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]