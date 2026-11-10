# Phase 2: AI Teammates – Implementation Notes

## Implemented (foundation-level, working)
- **Teammate persistence API** (`/api/teammates` CRUD): create, list, get, update (config/status/tools/permissions), delete.
  - Validation via `zod` for core fields, tool assignments, and permission entries.
  - Org-scoped operations using request context.
- **Dev-local persistence (no paid DB required):** JSON store at `backend/.data/dev-store.json` via `src/store/devStore.ts`, clearly separated from production PostgreSQL/Supabase paths. Used when production DB integration is not configured.
- **Dev context scaffold:** `src/middleware/devContext.ts` injects a local org/user context for development; to be replaced by Supabase JWT verification + membership lookup and RLS-safe DB access.
- **Frontend wiring:**
  - Directory (`/app/teammates`) lists teammates from API with status/role/tool-permission summary.
  - Create (`/app/teammates/new`) configures name, role, responsibilities, objectives, personality, communication style, approval policy, status (activate/pause/inactive), tool assignment, and operational permissions (allowed + requires approval), then persists.
  - Workspace (`/app/teammates/:id`) views/edits configuration, toggles activation/status, updates tool assignments and permissions, persists changes.
- **Roles supported:** Sales, Customer Support, Lead Generation, Order Management, Appointment Booking, Business Operations.

## Verification
- Backend: `npm run typecheck` and `npm run build` pass.
- Frontend: `npm run build` passes.

## Deferred / next hardening
- Supabase Auth session/JWT verification, RBAC enforcement, and real org membership resolution.
- PostgreSQL/Supabase-backed repository implementation (replace/swap dev store) with RLS-compliant queries.
- Per-tool config schemas, permission constraints UI, and server-side authorization enforcement.
- Audit logging for configuration changes and teammate lifecycle events.
- Agent execution engine, real integrations, and approval workflows (Phases 3+).
