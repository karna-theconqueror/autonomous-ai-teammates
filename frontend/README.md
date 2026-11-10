# Frontend (Phase 1)

React + TypeScript + Vite + Tailwind UI for Autonomous AI Teammates.

## Setup
```bash
npm install
cp .env.example .env
npm run dev
```

- Dev server: http://localhost:5173
- API proxy: `/api` -> `http://localhost:4000` (configure backend)

## Notes
- Dashboard metrics come from `/api/dashboard/metrics` and render empty/zero states when unavailable (no fabricated statistics).
- Supabase Auth is scaffolded; set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to enable live auth wiring in later iterations.
