# Backend (Phase 1)

Node.js + Express + TypeScript API skeleton.

## Setup
```bash
npm install
cp .env.example .env
npm run dev
```

- Health: `GET /api/health`
- Dashboard metrics (Phase 1 scaffold): `GET /api/dashboard/metrics`

## Persistence
- **Default:** SQLite via Node's built-in `node:sqlite` at `backend/.data/dev.db` (no paid services, no native npm deps required).
- **Production:** swap/configure PostgreSQL/Supabase-backed repositories with `database/schema.sql` + `database/rls.sql`, Supabase Auth/JWT, and RBAC.

## Notes
- Includes basic security middleware (helmet, CORS config, rate limiting, JSON limits), auth context, validation, and centralized error handling.
- Agent engine uses mock LLM by default and simulated tool execution by default; real providers/connectors are configurable via env (see `.env.example` and `docs/PRODUCTION_READINESS.md`).
- Metrics are computed from persisted records (no fabricated statistics).
