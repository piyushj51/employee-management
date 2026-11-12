# Docker & Docker Compose Reference Guide
**Full-Stack Application: FastAPI + PostgreSQL + React**

This document summarizes the exact Docker workflow, CLI commands, and troubleshooting solutions used to containerize and run this application. You can use this as a reference template for future projects.

---

## 1. Project Architecture Overview

| Service | Technology | Port (Host:Container) | Internal Network DNS |
| :--- | :--- | :--- | :--- |
| **`db`** | PostgreSQL 15 | `5433:5432` *(avoid host 5432 conflicts)* | `db:5432` |
| **`backend`** | FastAPI / Python 3.11 | `8000:8000` | `backend:8000` |
| **`frontend`**| React + Vite + Nginx | `3000:80` | `frontend:80` |

---

## 2. Essential Docker Compose Commands

### A. First-Time Setup & Build
Build all service images and start the containers in detached (background) mode:
```bash
docker compose up -d --build
```

### B. Daily Usage
Start existing containers:
```bash
docker compose up -d
```

Stop containers (keeps database data safe in volume):
```bash
docker compose down
```

Stop containers and remove volumes (⚠️ wipes database clean):
```bash
docker compose down -v
```

### C. Viewing Status & Logs
Check running container status and health:
```bash
docker compose ps
```

View real-time logs for all services:
```bash
docker compose logs -f
```

View logs for a specific service:
```bash
docker compose logs -f backend
docker compose logs -f db
docker compose logs -f frontend
```

---

## 3. Database Migrations & Commands Inside Containers

Execute commands inside a running container without SSH:

### Run Alembic Migrations
```bash
docker compose exec backend alembic upgrade head
```

### Create a New Alembic Migration Revision
```bash
docker compose exec backend alembic revision --autogenerate -m "describe_changes"
```

### Open PostgreSQL Shell (psql)
```bash
docker compose exec db psql -U postgres -d employee_db
```

### Open Bash / Shell Inside Backend Container
```bash
docker compose exec backend /bin/bash
# or if bash is not available:
docker compose exec backend /bin/sh
```

---

## 4. Standalone Image Build Commands (Without Compose)

### Fast & Reliable Build (Mac / Apple Silicon)
```bash
docker build --network=host --progress=plain -t employee-mgmt-container .
```
- `--network=host`: Uses the host Mac connection to prevent DNS hangs inside Docker's virtual bridge.
- `--progress=plain`: Shows live download percentages instead of hiding progress.

### Force Clean Build (Bypassing Cached Layers)
```bash
docker build --no-cache -t employee-mgmt-container .
```

### Run Standalone Image
```bash
docker run -d \
  --name employee-api \
  -p 8000:8000 \
  --env-file .env \
  employee-mgmt-container
```

---

## 5. Key Lessons & Troubleshooting Cheatsheet

### 1. `bind: address already in use: 0.0.0.0:5432`
- **Cause**: Local PostgreSQL (Homebrew or Postgres.app) is already running on port 5432.
- **Fix**: Map the host port to `5433` in `docker-compose.yml`:
  ```yaml
  ports:
    - "5433:5432"
  ```
  Containers on the internal Docker network still talk to each other via `db:5432`.

### 2. `sqlalchemy.exc.ProgrammingError: relation "users" does not exist`
- **Cause**: PostgreSQL starts clean with an empty database; tables haven't been created yet.
- **Fix**: Ensure `docker-compose.yml` runs migrations on backend boot:
  ```yaml
  command: sh -c "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000"
  ```

### 3. `ModuleNotFoundError: No module named 'passlib'`
- **Cause**: Adding new dependencies to `requirements.txt` requires rebuilding Docker layers without cache.
- **Fix**: Rebuild with `--no-cache`:
  ```bash
  docker compose build --no-cache backend
  docker compose up -d --force-recreate backend
  ```

### 4. Docker Build Freezing on ARM64 / Mac
- **Fix 1**: Use stable `python:3.11-slim-bookworm` rather than generic `python:3.11-slim` (which can default to unstable Debian trixie mirrors).
- **Fix 2**: Use `psycopg[binary]==3.2.3` instead of separate `psycopg` + `psycopg-binary` source compilations.
- **Fix 3**: Add `"dns": ["8.8.8.8", "1.1.1.1"]` in Docker Desktop **Settings -> Docker Engine**.
