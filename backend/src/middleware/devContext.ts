import type { Request, Response, NextFunction } from 'express'

// Phase 2 dev scaffold: provides a local organization/user context when real auth is not configured.
// Replace with Supabase JWT verification and membership lookup in production.
export function devContext(req: Request, _res: Response, next: NextFunction) {
  ;(req as any).auth = {
    userId: 'dev-user',
    organizationId: 'dev-org-00000000-0000-0000-0000-000000000001',
    role: 'owner',
    mode: process.env.SUPABASE_URL ? 'supabase-configured' : 'dev-local',
  }
  next()
}
