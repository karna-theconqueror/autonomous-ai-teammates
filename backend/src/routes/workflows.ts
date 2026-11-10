import { Router } from 'express'
import { z } from 'zod'
import * as store from '../store/devStore'

export const workflowsRouter = Router()
const org = (req:any)=>req.auth.organizationId as string

workflowsRouter.get('/', async (req,res,next)=>{ try{ res.json({ workflows: await store.listWorkflows(org(req)) }) }catch(e){next(e)} })
workflowsRouter.post('/', async (req,res,next)=>{
  try{ const schema = z.object({ name: z.string().min(1), description: z.string().optional().default(''), definition: z.any().optional().default({}), status: z.enum(['draft','active','archived']).optional().default('draft') }); const p = schema.safeParse(req.body); if(!p.success) return res.status(400).json({error:'Invalid input'}); res.status(201).json({ workflow: await store.createWorkflow(org(req), p.data as any) }) }catch(e){next(e)}
})
workflowsRouter.get('/:id', async (req,res,next)=>{ try{ const w=await store.getWorkflow(org(req), req.params.id); if(!w) return res.status(404).json({error:'Not found'}); res.json({ workflow:w }) }catch(e){next(e)} })
