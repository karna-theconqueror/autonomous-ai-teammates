# Production Readiness & Configuration (All Phases)

This project is a **working, modular, end-to-end foundation** that runs without paid APIs using a **mock AI provider**, **simulated tool execution (by default)**, and **local dev persistence**. To operate as a fully live production system, configure the components below.

## 1) Persistence & Auth (Supabase/PostgreSQL + RLS)
- Apply `database/schema.sql` and `database/rls.sql` to your Supabase/Postgres project.
- Configure backend env: `SUPABASE_URL`, `SUPABASE_ANON_KEY` (and/or service role for server-side admin flows as appropriate), `DATABASE_URL`.
- Frontend: set `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` for Supabase Auth UI/session integration.
- **Current state:** dev auth context + local JSON store (`backend/.data/dev-store.json`) when not configured. Replace store/repository with DB-backed implementation and enforce JWT+RBAC+RLS in production.

## 2) AI Provider (provider-independent)
- **Default:** Mock planner (`mock`) – no paid APIs required.
- **Real LLM:** set `LLM_BASE_URL`, `LLM_API_KEY`, `LLM_MODEL` for OpenAI-compatible chat completions (structured JSON plan). Extend `backend/src/ai/provider.ts` for additional providers.
- Safety: planner prompt treats objective/user content as untrusted data; permissions/approvals are enforced by engine regardless of plan text.

## 3) Agent Engine Safeguards (implemented)
- Controlled loop: `PLAN → VALIDATE PERMISSIONS → EXECUTE → VERIFY → UPDATE STATE → REPORT`
- Max steps, retry limits, execution timeout/idempotency in in-memory queue, tool/permission validation, approval gating, audit logging, no self-permission modification, no false success claims.
- **Production:** move to durable job queue (e.g. Redis/BullMQ/Postgres-backed), persistent idempotency keys, distributed timeouts/retries, and concurrency controls.

## 4) Tool Integrations & Secrets
- **Default:** simulated connectors (no unauthorized external side effects).
- **HTTP/Webhook (opt-in):** set `ENABLE_REAL_HTTP_TOOLS=true` and configure `DEFAULT_WEBHOOK_URL` / `HTTP_TOOL_AUTH_*` (from secure env/secret manager). Only authorized, validated calls are made.
- CRM/Email/Calendar/DB/KB connectors: implement provider-specific adapters behind the tool registry with auth, permission checks, error handling, and execution logs.
- **Never** store plaintext secrets or expose keys in frontend. Use `integration_credentials.credential_ref` / vault references.

## 5) Human-in-the-Loop & Security
- Approval required for sensitive/approval-flagged actions; approve/reject/edit/takeover supported with audit trail.
- Treat external emails/documents/websites/customer messages as untrusted input (not system instructions).
- Harden with: strict RBAC, tenant isolation, prompt-injection defenses, input/output validation, secret rotation, monitoring/alerting, and compliance logging.

## 6) Analytics
- Metrics are computed from persisted records (no fabricated statistics). Connect to production DB for org-scoped aggregation at scale.

## Run (dev, no paid APIs)
- Backend: `cd backend && npm install && npm run dev`
- Frontend: `cd frontend && npm install && npm run dev`
- Data persists locally in **SQLite** at `backend/.data/dev.db` (Node built-in `node:sqlite`, no paid services). Configure Supabase/PostgreSQL for production.
