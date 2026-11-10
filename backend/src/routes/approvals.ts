import { Router } from 'express'
import { z } from 'zod'
import * as store from '../store/devStore'
import { resumeAfterApproval } from '../engine/executor'

export const approvalsRouter = Router()
const org = (req:any)=>req.auth.organizationId as string

approvalsRouter.get('/', async (req,res,next)=>{ try{ res.json({ approvals: await store.listApprovals(org(req)) }) }catch(e){next(e)} })
approvalsRouter.get('/:id', async (req,res,next)=>{ try{ const a=await store.getApproval(org(req), req.params.id); if(!a) return res.status(404).json({error:'Not found'}); res.json({ approval:a }) }catch(e){next(e)} })

approvalsRouter.post('/:id/review', async (req,res,next)=>{
  try {
    const schema = z.object({ action: z.enum(['approve','reject','edit','take_over']), notes: z.string().optional().default(''), edited_action: z.any().optional() })
    const parsed = schema.safeParse(req.body); if(!parsed.success) return res.status(400).json({error:'Invalid input'})
    const a = await store.getApproval(org(req), req.params.id); if(!a) return res.status(404).json({error:'Not found'})
    const map: any = { approve:'approved', reject:'rejected', edit:'edited', take_over:'taken_over' }
    const status = map[parsed.data.action]
    const updated = await store.updateApproval(org(req), a.id, { status, reviewed_by: 'dev-user', reviewed_at: new Date().toISOString(), review_notes: parsed.data.notes, ...(parsed.data.edited_action ? { proposed_action: { ...a.proposed_action, edited: parsed.data.edited_action } } : {}) })
    await store.addLog(org(req), { task_id: a.task_id, teammate_id: a.teammate_id, event_type: 'approval_reviewed', message: `Approval ${status}`, details: { approvalId: a.id, notes: parsed.data.notes } })
    if ((status==='approved' || status==='edited') && a.task_id) { resumeAfterApproval(org(req), a.task_id, a.id).catch(()=>{}) }
    if (status==='rejected' && a.task_id) { await store.updateTask(org(req), a.task_id, { status: 'failed', error_message: 'Rejected by human reviewer', completed_at: new Date().toISOString() }) }
    if (status==='taken_over' && a.task_id) { await store.updateTask(org(req), a.task_id, { status: 'cancelled', error_message: 'Taken over by human employee', completed_at: new Date().toISOString() }) }
    res.json({ approval: updated })
  } catch(e){ next(e) }
})
