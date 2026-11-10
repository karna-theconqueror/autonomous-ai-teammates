import type { Request, Response, NextFunction } from 'express'
import { createClient } from '@supabase/supabase-js'

/**
 * Auth context middleware.
 * - If Supabase is configured and a Bearer token is provided, verifies the user and resolves org membership (best-effort).
 * - Otherwise falls back to local dev context (no paid services required).
 * In production, require authenticated context and enforce RBAC/RLS at DB layer.
 */
export async function authContext(req: Request, res: Response, next: NextFunction) {
  try {
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
    const authz = req.headers.authorization
    if (supabaseUrl && supabaseKey && authz?.startsWith('Bearer ')) {
      const token = authz.slice(7)
      const supabase = createClient(supabaseUrl, supabaseKey)
      const { data, error } = await supabase.auth.getUser(token)
      if (!error && data?.user) {
        ;(req as any).auth = { userId: data.user.id, organizationId: (req.headers['x-org-id'] as string) || 'org-unresolved', role: 'member', mode: 'supabase-jwt' }
        return next()
      }
    }
  } catch { /* fall through to dev */ }
  ;(req as any).auth = { userId: '00000000-0000-0000-0000-000000000002', organizationId: '00000000-0000-0000-0000-000000000001', role: 'owner', mode: process.env.SUPABASE_URL ? 'supabase-configured-no-token' : 'dev-local' }
  next()
}
