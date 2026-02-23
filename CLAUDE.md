# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Max** is a mental health support platform with an AI chatbot. It is a monorepo with three independently runnable services:

| Service | Stack | Port |
|---|---|---|
| `frontend-react` | React 18 + Vite + TypeScript | 5173 |
| `server-app` | Express + TypeScript + Sequelize | 3000 |
| `chat_api` | Python FastAPI + Mistral AI / Ollama | 8000 |

Supporting infrastructure: PostgreSQL 15, pgAdmin (5050), Prometheus (9090), Grafana (3002).

---

## Commands

### Run Everything (Docker)
```bash
docker compose up -d --build   # Build and start all services
docker compose down             # Stop all services
docker compose logs -f          # Stream logs
```

### Frontend (`frontend-react/`)
```bash
npm run dev           # Vite dev server
npm run build         # Production build
npm run lint          # ESLint check
npm run lint:fix      # ESLint with auto-fix
npm run test          # Vitest unit tests
npm run test:coverage # Coverage report
npm run test:ci       # CI mode (no watch)
```

### Backend (`server-app/`)
```bash
npm run dev           # Nodemon dev server
npm run build         # TypeScript compile to dist/
npm run lint:check    # ESLint (no auto-fix, used in CI)
npm run lint          # ESLint with auto-fix
npm run test          # Jest tests
npm run test:coverage # Coverage report
npm run test:watch    # Watch mode
npm run type-check    # TypeScript type validation only
```

### Chat API (`chat_api/`)
```bash
pip install -r requirements.txt
uvicorn qwen_api:app --reload --host 0.0.0.0 --port 8000
```

### Load Testing (`k6/`)
```bash
k6 run stress-test-progressive.js  # Progressive load test (0→100 users)
k6 run auth-test.js                # Auth flow load test
```

### Monitoring (`monitoring/`)
```bash
docker compose up -d   # Start Prometheus + Grafana
```

---

## Architecture

### Data Flow
```
Browser → frontend-react (React/Vite)
               ↓ REST
          server-app (Express) → PostgreSQL
               ↓ also handles auth via Firebase + Passport (Google/Facebook OAuth)
          chat_api (FastAPI) → Ollama (qwen2:3b on VPS)
```

The frontend uses **Firebase** for authentication and Firestore for some real-time data. The backend uses **Passport.js** for OAuth and **JWT** for API authentication. These are two separate auth mechanisms that coexist.

### Backend (`server-app/src/`)
- `routes/` — One file per resource: `auth.ts`, `conversations.ts`, `messages.ts`, `users.ts`, `feedback.ts`
- `models/` — Sequelize models: `User`, `Conversation`, `Message`, `EmotionalJournal`, `Recommendation`, `Subscription`, `Feedback`
- `middleware/` — `auth.ts` (JWT verification), `roleAuth.ts` (role-based access)
- `config/` — `db.ts` (Sequelize/PG connection), `passport.ts` (OAuth strategies), `swagger.ts`
- `migrations/` — TypeScript migration files run at startup

Database schema changes should go through migration files in `src/migrations/`, not by altering models directly with `sync({ force: true })`.

### Frontend (`frontend-react/src/`)
- State management: **Zustand** (not Redux)
- HTTP: **Axios** via `src/services/`
- Auth: **Firebase** (`firebaseConfig.ts`)
- Routing: React Router v6 (`App.tsx`)
- Styling: Tailwind CSS v4
- Key custom hook: `src/hooks/useChat.ts` (manages conversation state)

### Chat API (`chat_api/qwen_api.py`)
- `EmotionalChatbot` class holds per-session conversation history
- Model: `qwen2:3b` via Ollama running on the VPS
- Detects user language and responds in kind
- Health check at `GET /health` verifies Ollama connectivity

---

## CI/CD

GitHub Actions (`.github/workflows/`):

- **On push/PR to `dev` or `main`**: runs `backend-tests` (Node 20 + PostgreSQL service container) and `frontend-tests` (build + lint)
- **On push to `dev`**: SSH deploys to VPS (`git pull` + `docker compose up --build`)
- **On push to `main`**: also runs SonarCloud scan, then deploys frontend to Vercel (`--prod`) and backend to VPS

CI uses `npm run lint:check` (not `lint`) for backend and `npm run lint` for frontend.

---

## Environment Variables

Each service needs its own `.env`. Key variables:

**Backend** (`server-app/.env`):
- `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_PORT`
- `JWT_SECRET`, `JWT_EXPIRES_IN`
- `ALLOWED_ORIGINS` (comma-separated, controls CORS)

**Frontend** (`frontend-react/.env`):
- `VITE_FIREBASE_*` (11 Firebase config variables)
- `VITE_API_URL`

**Chat API** (`chat_api/.env`):
- `OLLAMA_HOST` (défaut : `http://localhost:11434`)

---

## Key Technical Notes

- **TypeScript strictness**: Frontend uses `strict: true`; backend does not — less strict typing is intentional.
- **Sequelize sync**: `alter: false` in production — schema must be updated via migrations.
- **Ollama**: The chat API expects a running Ollama instance on startup; it logs a warning but won't crash if unavailable.
- **Grafana default credentials**: `admin` / `admin123` (local dev only).
- **Monorepo**: Each service (`frontend-react`, `server-app`, `chat_api`) manages its own `node_modules` / virtualenv. The root `package.json` only contains scripts for data generation/benchmarking.
- **SonarCloud**: Project key `abenabde2705_Max_AI_MDS`, org `abenabde2705`. Coverage is uploaded from Jest (backend priority).
