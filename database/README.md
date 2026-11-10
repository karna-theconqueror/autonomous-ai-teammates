# Database (All Phases)

PostgreSQL / Supabase schema and RLS for the Autonomous AI Teammates platform.

## Files
- `schema.sql` – core tables, constraints, indexes, and RLS enablement
- `rls.sql` – organization-isolation RLS policies (Supabase `auth.uid()` + membership)

## Notes
- Uses UUID primary keys, timestamps, status fields, and foreign keys.
- Organization-level isolation via `organization_id` and `organization_members`.
- **Never store plaintext integration secrets.** `integration_credentials.credential_ref` is for vault/secret-manager references or server-managed encrypted handles.
- Apply `schema.sql` then `rls.sql` in Supabase SQL editor or via migrations. Refine role-based policies (e.g. admin-only credential access) per your security model.
- The application runs without a live DB using a local dev store; configure `DATABASE_URL`/Supabase and implement DB repositories for production persistence.
