# ExecPlan: OMNIEL v0.1 (Fullstack)

## Purpose
Transform repo from mock assistant to working v0.1 with secure WebSocket auth, real LLM/tools, RAG + citations, worker skeleton, and quality pipeline.

## Acceptance Criteria
1) `GET /health` returns ok.
2) WebSocket `/assistant/events` requires token and rejects unauthenticated clients.
3) Chat endpoint supports real LLM response behind env flag.
4) Tools endpoints return real system and weather data (or missing key error).
5) RAG ingest/query with citations.
6) Compose runs Postgres+pgvector and Redis.
7) CI runs lint + tests + frontend build.

## Progress
- [x] M0: Baseline dev infra + envs + docs
- [x] M1: Secure WebSocket auth end-to-end (backend + frontend)
- [x] M2: Tools real (system + weather)
- [x] M3: LLM integration + streaming (SSE)
- [x] M4: RAG with pgvector (ingest/query + citations)
- [x] M5: Worker skeleton (RQ) + background ingestion option
- [x] M6: Quality (ruff/pytest) + CI (GitHub Actions) + final docs

## Repo Context
- Backend FastAPI in `backend/`
- Frontend React/Vite in `frontend/`

## Milestones
- M0: Added env examples, compose dev infra, README setup.
- M1: Added JWT validation for websocket query token and frontend tokenized WS URL.
- M2: Replaced mocked tools with psutil + weather provider integration.
- M3: Added provider-agnostic LLM client, OpenAI implementation, mock fallback, and SSE stream endpoint.
- M4: Added pgvector-backed documents/chunks, ingest/query endpoints with citations.
- M5: Added RQ queue helper and worker entrypoint for async ingestion.
- M6: Added lint/tests/CI definitions and updated docs.

## Concrete Steps
- `docker compose -f infra/docker-compose.dev.yml up -d`
- `cd backend && pip install -r requirements.txt`
- `cd frontend && npm install && npm run build`

## Idempotence/Recovery
- DB schema uses `IF NOT EXISTS` + extension init.
- Async ingest persists document row in queued state and can be retried.

## Decision Log
- Used direct SQL + psycopg for lightweight v0.1 pgvector integration.
- Used OpenAI optional fallback pattern with mock client.

## Surprises/Discoveries
- Existing app had no persistent DB layer; added bootstrap table creation on startup.
