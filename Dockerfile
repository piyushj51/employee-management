# Use official lightweight Python image (pinned to stable Debian Bookworm)
FROM python:3.11-slim-bookworm

# Prevent Python from writing .pyc files and buffer stdout/stderr
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Upgrade pip and install dependencies (binary wheels only, no compiler needed)
COPY requirements.txt .
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy application source code and migrations
COPY app ./app
COPY alembic ./alembic
COPY alembic.ini .

# Expose FastAPI default port
EXPOSE 8000

# Run FastAPI with uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

