import { Router } from 'express'
import { z } from 'zod'
import * as store from '../store/devStore'
import { enqueueTaskRun } from '../engine/queue'

export const tasksRouter = Router()
const org = (req:any)=>req.auth.organizationId as string

tasksRouter.get('/', async (req,res,next)=>{ try{ res.json({ tasks: await store.listTasks(org(req)) }) }catch(e){next(e)} })
tasksRouter.get('/:id', async (req,res,next)=>{ try{ const t=await store.getTask(org(req), req.params.id); if(!t) return res.status(404).json({error:'Not found'}); res.json({ task:t, steps: await store.listTaskSteps(t.id), logs: await store.listLogs(org(req), t.id) }) }catch(e){next(e)} })
tasksRouter.post('/', async (req,res,next)=>{
  try {
    const schema = z.object({ title: z.string().min(1), objective: z.string().max(2000).optional().default(''), teammate_id: z.string().uuid().optional().nullable(), workflow_id: z.string().uuid().optional().nullable(), priority: z.string().optional().default('normal'), run: z.boolean().optional().default(true) })
    const parsed = schema.safeParse(req.body); if(!parsed.success) return res.status(400).json({error:'Invalid input', details: parsed.error.flatten()})
    const t = await store.createTask(org(req), { ...parsed.data, status: 'pending' } as any)
    await store.addLog(org(req), { task_id: t.id, teammate_id: t.teammate_id, event_type: 'task_created', message: 'Task created', details: { title: t.title } })
    if (parsed.data.run) { enqueueTaskRun(org(req), t.id) }
    res.status(201).json({ task: await store.getTask(org(req), t.id) })
  } catch(e){ next(e) }
})
tasksRouter.post('/:id/run', async (req,res,next)=>{
  try { const t = await store.getTask(org(req), req.params.id); if(!t) return res.status(404).json({error:'Not found'}); enqueueTaskRun(org(req), t.id); res.json({ ok: true }) } catch(e){ next(e) }
})
