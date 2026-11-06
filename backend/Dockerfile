# Lightweight Python 3.11 base image
FROM python:3.11-slim

# Prevent Python from writing .pyc files & enable immediate log streaming
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV STOCKFISH_PATH=/usr/games/stockfish

# Install system dependencies & the Linux Stockfish chess engine
RUN apt-get update && apt-get install -y --no-install-recommends \
    stockfish \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy dependency specifications first for Docker layer caching
COPY pyproject.toml .

# Install Python packages
RUN pip install --no-cache-dir .

# Copy application code
COPY ./app ./app

# Expose default API port
EXPOSE 8000

# Default command: Runs FastAPI with dynamic $PORT support for cloud hosts (Render / Railway)

CMD ["sh", "-c", "exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]