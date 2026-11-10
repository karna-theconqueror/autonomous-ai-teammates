import { Router } from 'express'
import { z } from 'zod'
import * as store from '../store/devStore'

export const conversationsRouter = Router()
export const knowledgeRouter = Router()
export const integrationsRouter = Router()
export const historyRouter = Router()
const org = (req:any)=>req.auth.organizationId as string

conversationsRouter.get('/', async (req,res,next)=>{ try{ res.json({ conversations: await store.listConversations(org(req)) }) }catch(e){next(e)} })
conversationsRouter.post('/', async (req,res,next)=>{ try{ const p = z.object({ teammate_id: z.string().optional().nullable(), external_subject: z.string().optional().default(''), channel: z.string().optional().default('internal') }).safeParse(req.body); if(!p.success) return res.status(400).json({error:'Invalid'}); res.status(201).json({ conversation: await store.createConversation(org(req), p.data as any) }) }catch(e){next(e)} })
conversationsRouter.get('/:id/messages', async (req,res,next)=>{ try{ res.json({ messages: await store.listMessages(req.params.id) }) }catch(e){next(e)} })
conversationsRouter.post('/:id/messages', async (req,res,next)=>{ try{ const p = z.object({ sender_type: z.string().optional().default('user'), content: z.string().min(1) }).safeParse(req.body); if(!p.success) return res.status(400).json({error:'Invalid'}); res.status(201).json({ message: await store.addMessage(req.params.id, { sender_type: p.data.sender_type, content: p.data.content }) }) }catch(e){next(e)} })

knowledgeRouter.get('/', async (req,res,next)=>{ try{ res.json({ documents: await store.listKnowledge(org(req)) }) }catch(e){next(e)} })
knowledgeRouter.post('/', async (req,res,next)=>{ try{ const p = z.object({ title: z.string().min(1), source: z.string().optional().default(''), content: z.string().optional().default(''), status: z.string().optional().default('approved') }).safeParse(req.body); if(!p.success) return res.status(400).json({error:'Invalid'}); res.status(201).json({ document: await store.addKnowledge(org(req), p.data as any) }) }catch(e){next(e)} })

integrationsRouter.get('/', async (req,res,next)=>{ try{ res.json({ integrations: await store.listIntegrations(org(req)) }) }catch(e){next(e)} })
integrationsRouter.post('/', async (req,res,next)=>{ try{ const p = z.object({ provider: z.string().min(1), name: z.string().min(1), status: z.string().optional().default('disconnected'), config: z.any().optional().default({}) }).safeParse(req.body); if(!p.success) return res.status(400).json({error:'Invalid'}); res.status(201).json({ integration: await store.upsertIntegration(org(req), p.data as any) }) }catch(e){next(e)} })

historyRouter.get('/', async (req,res,next)=>{ try{ res.json({ logs: await store.listLogs(org(req)) }) }catch(e){next(e)} })
