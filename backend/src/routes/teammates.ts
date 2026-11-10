import { Router } from 'express'
import { z } from 'zod'
import { listTeammates, getTeammate, createTeammate, updateTeammate, deleteTeammate } from '../store/devStore'

export const teammatesRouter = Router()

const toolSchema = z.object({ tool_key: z.string().min(1), enabled: z.boolean().default(false), config: z.record(z.any()).default({}) })
const permSchema = z.object({ permission_key: z.string().min(1), allowed: z.boolean().default(false), requires_approval: z.boolean().default(true), constraints: z.record(z.any()).default({}) })
const createSchema = z.object({
  name: z.string().min(1), job_role: z.string().min(1), responsibilities: z.string().optional().default(''), objectives: z.string().optional().default(''),
  personality: z.string().optional().default(''), communication_style: z.string().optional().default(''),
  status: z.enum(['active','paused','inactive']).optional().default('inactive'), requires_human_approval: z.boolean().optional().default(true),
  tools: z.array(toolSchema).optional().default([]), permissions: z.array(permSchema).optional().default([]),
})

const orgId = (req: any) => req.auth?.organizationId as string

teammatesRouter.get('/', async (req, res, next) => { try { res.json({ source: process.env.SUPABASE_URL ? 'supabase' : 'sqlite', teammates: await listTeammates(orgId(req)) }) } catch(e){ next(e) } })
teammatesRouter.get('/:id', async (req, res, next) => { try { const tm = await getTeammate(orgId(req), req.params.id); if (!tm) return res.status(404).json({ error: 'Teammate not found' }); res.json({ teammate: tm }) } catch(e){ next(e) } })
teammatesRouter.post('/', async (req, res, next) => { try { const parsed = createSchema.safeParse(req.body); if (!parsed.success) return res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() }); const tm = await createTeammate(orgId(req), parsed.data as any); res.status(201).json({ teammate: tm }) } catch(e){ next(e) } })
teammatesRouter.patch('/:id', async (req, res, next) => { try { const patch = createSchema.partial().safeParse(req.body); if (!patch.success) return res.status(400).json({ error: 'Invalid input', details: patch.error.flatten() }); const tm = await updateTeammate(orgId(req), req.params.id, patch.data as any); if (!tm) return res.status(404).json({ error: 'Teammate not found' }); res.json({ teammate: tm }) } catch(e){ next(e) } })
teammatesRouter.delete('/:id', async (req, res, next) => { try { const ok = await deleteTeammate(orgId(req), req.params.id); if (!ok) return res.status(404).json({ error: 'Teammate not found' }); res.status(204).send() } catch(e){ next(e) } })
