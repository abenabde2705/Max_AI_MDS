# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Max** is a mental health support platform with an AI chatbot. It is a monorepo with three independently runnable services:

| Service | Stack | Port |
|---|---|---|
| `frontend-react` | React 18 + Vite + TypeScript | 5173 |
| `server-app` | Express + TypeScript + Sequelize | 3000 |
| `chat_api` | Python FastAPI + Ollama (qwen2:3b) | 8000 |

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

# Run a single test file
npx vitest run src/tests/Chat.test.tsx
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

# Run a single test file
npx jest src/tests/auth.test.ts
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
               ↓ REST (JWT via localStorage)
          server-app (Express) → PostgreSQL
               ↓ proxies chat via POST /api/chat
          chat_api (FastAPI) → Ollama (qwen2:3b on VPS)
```

The frontend uses **Firebase** for authentication and Firestore for some real-time data. The backend uses **Passport.js** for OAuth and **JWT** for API authentication. These are two separate auth mechanisms that coexist.

**Chat message flow**: The frontend never calls the Python `chat_api` directly. It calls `server-app`'s `POST /api/chat`, which proxies to the Python service and also persists the messages to PostgreSQL. The `x-api-key` header for the chat service stays server-side and is never exposed to the browser.

### Backend (`server-app/src/`)
- `routes/` — One file per resource: `auth.ts`, `conversations.ts`, `messages.ts`, `users.ts`, `feedback.ts`
- `models/` — Sequelize models: `User`, `Conversation`, `Message`, `EmotionalJournal`, `Recommendation`, `Subscription`, `Feedback`
- `middleware/` — `auth.ts` (JWT verification), `roleAuth.ts` (role-based access)
- `config/` — `db.ts` (Sequelize/PG connection), `passport.ts` (OAuth strategies), `swagger.ts`
- `migrations/` — TypeScript migration files run at startup

Database schema changes should go through migration files in `src/migrations/`, not by altering models directly with `sync({ force: true })`.

### Frontend (`frontend-react/src/`)
- State management: **Zustand** (not Redux)
- HTTP: **Axios** — all API calls are in the single file `src/services/chat.api.ts`
- Auth: **Firebase** (`firebaseConfig.ts`). Protected routes check `localStorage.getItem('token')` in the `ProtectedRoute` wrapper in `App.tsx`.
- Routing: React Router v6 (`App.tsx`). Protected routes: `/chatbot`, `/dashboard`, `/profile`, `/journal`, `/statistics`, `/coaches`
- Styling: Tailwind CSS v4 + `src/style.css` (main, large file) + `src/styles/gradients.css` and `src/styles/buttons.css` (imported separately in components)
- Key custom hook: `src/hooks/useChat.ts` (manages conversation state)
- `vite.config.js` has `server.allowedHosts` — add your local domain or `localhost` if accessing outside Docker

### Chat API (`chat_api/qwen_api.py`)
- `EmotionalChatbot` class holds per-session conversation history
- Model: `qwen2:3b` via Ollama running on the VPS at `OLLAMA_HOST`
- Uses `httpx` directly (not the `ollama` Python library) — `OLLAMA_HOST` must be the full endpoint URL including path (e.g. `.../api/chat`)
- `POST /chat` requires `x-api-key` header matching `API_KEY`
- Detects user language and responds in kind
- `GET /health` makes a live test call to Ollama to verify connectivity

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

**Chat API** (root `.env`, read via `env_file: ./.env` in docker-compose):
- `OLLAMA_HOST` — full endpoint URL, e.g. `http://ollama:11434/api/chat` or `https://chat.dev.maxai-mds.fr/chat`
- `API_KEY` — required; sent as `x-api-key` header on all `POST /chat` requests

---

## Key Technical Notes

- **TypeScript strictness**: Frontend uses `strict: true`; backend does not — less strict typing is intentional.
- **Sequelize sync**: `alter: false` in production — schema must be updated via migrations.
- **Ollama**: Runs on the VPS (not locally). `OLLAMA_HOST` must be a full URL with path (e.g. `http://ollama:11434/api/chat`). The `ollama` Python library is **not** used — raw `httpx` POSTs are made instead, so path-suffixed URLs work correctly.
- **Grafana default credentials**: `admin` / `admin123` (local dev only).
- **Monorepo**: Each service (`frontend-react`, `server-app`, `chat_api`) manages its own `node_modules` / virtualenv. The root `package.json` only contains scripts for data generation/benchmarking.
- **SonarCloud**: Project key `abenabde2705_Max_AI_MDS`, org `abenabde2705`. Coverage is uploaded from Jest (backend priority).
- **Backend is ES Modules**: `server-app` has `"type": "module"` in `package.json` — use `import/export`, not `require()`. File extensions must be explicit in imports (`.js` even for `.ts` source files).
- **Backend `.env` loading**: In Docker (`DOCKER_ENV=true`) uses standard `dotenv.config()`; locally it loads from the root `.env` two levels up.
