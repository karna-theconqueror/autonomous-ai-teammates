import { Router } from 'express'
import { computeMetrics, persistenceMode } from '../store/devStore'

export const dashboardRouter = Router()

dashboardRouter.get('/metrics', async (req: any, res, next) => {
  try {
    const orgId = req.auth?.organizationId || '00000000-0000-0000-0000-000000000001'
    const metrics = await computeMetrics(orgId)
    res.json({ source: persistenceMode(), metrics })
  } catch (e) { next(e) }
})
