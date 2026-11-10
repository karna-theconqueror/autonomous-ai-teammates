# Phase 1: Foundation – Implementation Plan

## Scope (Phase 1)
- Project setup (frontend, backend, shared conventions)
- Database architecture (initial schema + RLS scaffolding)
- Authentication (Supabase Auth integration scaffolding + local dev-safe UI flow)
- Dashboard (shell with real-data-ready structure, no fabricated stats)
- Navigation (sidebar/topbar, responsive)
- Responsive UI foundation (layout, reusable components, dark enterprise theme)

## Repository layout
- `frontend/` – React + TypeScript + Vite + Tailwind + shadcn-style UI primitives + Recharts-ready
- `backend/` – Node.js + Express + TypeScript API skeleton (health, placeholder routes, validation/error handling)
- `database/` – PostgreSQL/Supabase SQL migrations, RLS policies, seed notes
- `docs/` – plans and phase notes

## Phase 1 deliverables
1. **Frontend**
   - Vite React TS app with routing and layout shell
   - Pages/routes: Landing, Auth, Main Dashboard (plus placeholders for required nav items)
   - Reusable components: Sidebar, TopNav, TeammateCard, StatusIndicator, TaskTable, ActivityTimeline, ApprovalCard, AnalyticsChart wrapper, IntegrationCard
   - Theme: dark navy/charcoal surfaces, electric blue/violet accents
   - Auth UI wired to Supabase client config (env-based), with mock/dev fallback messaging

2. **Backend**
   - Express TS server with structured modules (`/routes`, `/middleware`, `/config`)
   - Auth middleware placeholder compatible with Supabase JWT verification
   - Health endpoint and stub endpoints for dashboard metrics (querying DB when configured, empty/zero states otherwise)
   - Security basics: validation hooks, rate limiting, centralized error handling, no secrets in frontend

3. **Database**
   - Initial SQL schema for required core tables (users/orgs/members/ai_teammates/tasks/approvals/etc.) with UUID PKs, FKs, timestamps, status fields, indexes
   - Organization-level isolation model and RLS policy templates (Supabase-oriented)
   - Notes on secret storage (encrypted/managed, never plaintext)

## Verification checklist (end of Phase 1)
- Frontend builds (`npm run build`) and dev server runs
- Backend typechecks/builds and starts
- Basic navigation and responsive layout render correctly
- Dashboard shows real/empty-state metrics only (no hardcoded fake numbers)
- Auth screens render and Supabase env config is externalized
- SQL files are syntactically organized and reviewed

## Deferred to later phases
- Full agent planner/executor loop and tool execution
- Real integrations (CRM/email/calendar/webhooks) beyond scaffolding
- Background job queue processing
- Full approval workflows and conversation monitoring logic
- Complete analytics aggregations from production data
