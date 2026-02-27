# OMNIEL v0.1

FastAPI + React stack with JWT auth, authenticated WebSockets, LLM chat streaming, real tools, RAG with pgvector, and Redis worker skeleton.

## Setup

1. Copy envs:

```bash
cp .env.example backend/.env
```

2. Start infra:

```bash
docker compose -f infra/docker-compose.dev.yml up -d
```

3. Run backend:

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

4. Run frontend:

```bash
cd frontend
npm install
npm run dev
```

5. Optional worker:

```bash
cd backend
python worker.py
```

## Security notes

- `/assistant/events` requires `?token=<jwt>`.
- Bearer token is required for all assistant/tools/knowledge endpoints.
- Keep secrets in `.env`; never commit real keys.

## Endpoints

- `GET /health`
- `POST /auth/login`
- `POST /assistant/chat`
- `POST /assistant/chat/stream` (SSE)
- `GET /tools/system`
- `GET /tools/weather?city=Recife`
- `POST /knowledge/ingest` (multipart field: `upload`)
- `POST /knowledge/query`

## CI

GitHub Actions runs backend lint/tests and frontend build.
