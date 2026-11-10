# Autonomous AI Teammates

Production-oriented Autonomous AI Teammates platform (modular, end-to-end foundation) for creating, configuring, deploying, and monitoring AI employees that perform real business workflows.

## Structure
- `frontend/` – React + TypeScript + Vite + Tailwind + shadcn-style UI + Recharts
- `backend/` – Node.js + Express + TypeScript API, agent engine, mock/real-configurable AI provider, tool/queue scaffolding
- `database/` – PostgreSQL/Supabase schema and RLS (`schema.sql`, `rls.sql`)
- `docs/` – phase plans and production readiness/configuration

## Implemented (Phases 1–6)
- **Foundation/UI:** landing, auth scaffold, dashboard, all required app pages, responsive enterprise UI, reusable components, navigation.
- **AI Teammates:** create/configure/list/workspace with roles, responsibilities, objectives, personality/style, tool assignment, permissions, human-approval policy, activate/pause/deactivate (persisted).
- **Agent Engine:** controlled loop `PLAN → VALIDATE PERMISSIONS → EXECUTE → VERIFY → UPDATE STATE → REPORT`, task/step states, permission/tool validation, approval gating, verification, execution/audit logging, workflow memory, safeguards (max steps, retries, timeout/idempotency in queue, no self-permission changes, no false success claims).
- **AI providers:** provider-independent interface with **mock provider** (default, no paid APIs) and configurable **OpenAI-compatible** real provider via env.
- **Tools:** tool registry with simulated execution by default; optional real HTTP/webhook execution only when explicitly enabled and configured with secure env credentials/refs.
- **Workflows/Operations:** tasks/objectives, workflows, conversations/messages (untrusted input treated as data), knowledge base, integration registry (no plaintext secrets).
- **Human-in-the-loop:** approval center (approve/reject/edit/takeover), escalation/state transitions, audit history.
- **Analytics:** dashboard/analytics/reports/history computed from real persisted records (no fabricated statistics).

## Runs without paid APIs
- Default: mock LLM + simulated tools + **SQLite local persistence** (`backend/.data/dev.db` via Node `node:sqlite`) + dev auth context.
- Configure Supabase/Postgres, LLM provider, and authorized connectors for live production operation (see `docs/PRODUCTION_READINESS.md`).

## Quick start
```bash
# backend
cd backend && npm install && cp .env.example .env && npm run dev

# frontend
cd frontend && npm install && cp .env.example .env && npm run dev
```
- Frontend: http://localhost:5173 (proxies `/api` to backend http://localhost:4000)

## Verification
- Backend: `npm run typecheck` and `npm run build`
- Frontend: `npm run build`

## Notes
- This is a complete, modular codebase foundation; live production autonomy requires configuring real DB/auth, LLM keys, and authorized integrations/secrets as documented. External actions are not claimed successful unless actually executed and verified.
