import crypto from 'crypto'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { Teammate, Task, TaskStep, ApprovalRequest, ExecutionLog, Workflow, Conversation, Message, MemoryItem, KnowledgeDoc, Integration } from './devStore'

function sb(): SupabaseClient {
  const url = process.env.SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY!
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}
const nowIso = () => new Date().toISOString()
const uid = () => crypto.randomUUID()
const must = <T>(data: T | null, error: any): T => { if (error) throw error; return data as T }

async function getTeammateTools(teammateId: string) {
  const { data, error } = await sb().from('teammate_tools').select('*').eq('teammate_id', teammateId)
  if (error) throw error
  return (data||[]).map((r:any)=>({ tool_key: r.tool_key, enabled: !!r.enabled, config: r.config || {} }))
}
async function getTeammatePerms(teammateId: string) {
  const { data, error } = await sb().from('agent_permissions').select('*').eq('teammate_id', teammateId)
  if (error) throw error
  return (data||[]).map((r:any)=>({ permission_key: r.permission_key, allowed: !!r.allowed, requires_approval: !!r.requires_approval, constraints: r.constraints || {} }))
}
async function upsertTeammateTools(teammateId: string, tools: any[]) {
  const c = sb(); await c.from('teammate_tools').delete().eq('teammate_id', teammateId)
  if (!tools?.length) return
  const rows = tools.map(t=>({ id: uid(), teammate_id: teammateId, tool_key: t.tool_key, enabled: !!t.enabled, config: t.config||{}, created_at: nowIso(), updated_at: nowIso() }))
  const { error } = await c.from('teammate_tools').insert(rows); if (error) throw error
}
async function upsertTeammatePerms(teammateId: string, perms: any[]) {
  const c = sb(); await c.from('agent_permissions').delete().eq('teammate_id', teammateId)
  if (!perms?.length) return
  const rows = perms.map(p=>({ id: uid(), teammate_id: teammateId, permission_key: p.permission_key, allowed: !!p.allowed, requires_approval: p.requires_approval ?? true, constraints: p.constraints||{}, created_at: nowIso(), updated_at: nowIso() }))
  const { error } = await c.from('agent_permissions').insert(rows); if (error) throw error
}
async function hydrateTeammate(r:any): Promise<Teammate> {
  const [tools, permissions] = await Promise.all([getTeammateTools(r.id), getTeammatePerms(r.id)])
  return { ...r, tools, permissions } as Teammate
}

async function ensureDevOrg(orgId: string) {
  const c = sb()
  const { data } = await c.from('organizations').select('id').eq('id', orgId).maybeSingle()
  if (!data) {
    await c.from('organizations').insert({ id: orgId, name: 'Development Organization', created_at: nowIso(), updated_at: nowIso() })
  }
}

export const supabaseStore = {
  async listTeammates(orgId: string){ await ensureDevOrg(orgId); const {data,error}=await sb().from('ai_teammates').select('*').eq('organization_id',orgId).order('created_at',{ascending:false}); if(error) throw error; return Promise.all((data||[]).map(hydrateTeammate)) },
  async getTeammate(orgId: string, id: string){ const {data,error}=await sb().from('ai_teammates').select('*').eq('organization_id',orgId).eq('id',id).maybeSingle(); if(error) throw error; return data? await hydrateTeammate(data): null },
  async createTeammate(orgId: string, input: Partial<Teammate>){ await ensureDevOrg(orgId); const now=nowIso(); const id=uid(); const row={id, organization_id:orgId, name:String(input.name||'').trim(), job_role:String(input.job_role||'').trim(), responsibilities:String(input.responsibilities||''), objectives:String(input.objectives||''), personality:String(input.personality||''), communication_style:String(input.communication_style||''), status:(input.status as any)||'inactive', requires_human_approval: input.requires_human_approval ?? true, created_at:now, updated_at:now}; const {error}=await sb().from('ai_teammates').insert(row); if(error) throw error; await Promise.all([upsertTeammateTools(id, input.tools as any||[]), upsertTeammatePerms(id, input.permissions as any||[])]); return (await this.getTeammate(orgId,id))! },
  async updateTeammate(orgId: string, id: string, patch: Partial<Teammate>){ const cur=await this.getTeammate(orgId,id); if(!cur) return null; const upd:any={updated_at:nowIso()}; for(const k of ['name','job_role','responsibilities','objectives','personality','communication_style','status','requires_human_approval'] as const){ if(k in patch) (upd as any)[k]=(patch as any)[k] }
    const {error}=await sb().from('ai_teammates').update(upd).eq('organization_id',orgId).eq('id',id); if(error) throw error;
    if('tools' in patch) await upsertTeammateTools(id, patch.tools as any||[])
    if('permissions' in patch) await upsertTeammatePerms(id, patch.permissions as any||[])
    return this.getTeammate(orgId,id)
  },
  async deleteTeammate(orgId: string, id: string){ const {error, count}=await sb().from('ai_teammates').delete({count:'exact'}).eq('organization_id',orgId).eq('id',id); if(error) throw error; return (count||0)>0 },

  async createTask(orgId: string, input: Partial<Task>){ await ensureDevOrg(orgId); const now=nowIso(); const t:Task={id:uid(),organization_id:orgId,teammate_id:input.teammate_id||null,workflow_id:input.workflow_id||null,title:String(input.title||'').trim(),objective:String(input.objective||''),status:(input.status as any)||'pending',priority:input.priority||'normal',result_summary:null,error_message:null,started_at:null,completed_at:null,created_at:now,updated_at:now}; const {error}=await sb().from('tasks').insert(t); if(error) throw error; return t },
  async updateTask(orgId: string, id: string, patch: Partial<Task>){ const cur=await this.getTask(orgId,id); if(!cur) return null; const next={...cur,...patch,id:cur.id,organization_id:orgId,created_at:cur.created_at,updated_at:nowIso()}; const {error}=await sb().from('tasks').update(next).eq('organization_id',orgId).eq('id',id); if(error) throw error; return next as Task },
  async getTask(orgId: string, id: string){ const {data,error}=await sb().from('tasks').select('*').eq('organization_id',orgId).eq('id',id).maybeSingle(); if(error) throw error; return data as Task|null },
  async listTasks(orgId: string){ const {data,error}=await sb().from('tasks').select('*').eq('organization_id',orgId).order('created_at',{ascending:false}); if(error) throw error; return (data||[]) as Task[] },

  async addTaskSteps(taskId: string, steps: Array<Pick<TaskStep,'step_index'|'name'|'status'|'input'>>){ const now=nowIso(); const rows=steps.map(s=>({id:uid(),task_id:taskId,step_index:s.step_index,name:s.name,status:s.status,input:s.input??null,output:null,error_message:null,started_at:null,completed_at:null,created_at:now,updated_at:now})); const {error}=await sb().from('task_steps').insert(rows); if(error) throw error; return rows as TaskStep[] },
  async updateTaskStep(stepId: string, patch: Partial<TaskStep>){ const {data:cur,error:e0}=await sb().from('task_steps').select('*').eq('id',stepId).maybeSingle(); if(e0) throw e0; if(!cur) return null; const next={...cur,...patch,updated_at:nowIso()}; const {error}=await sb().from('task_steps').update(next).eq('id',stepId); if(error) throw error; return next as TaskStep },
  async listTaskSteps(taskId: string){ const {data,error}=await sb().from('task_steps').select('*').eq('task_id',taskId).order('step_index',{ascending:true}); if(error) throw error; return (data||[]) as TaskStep[] },

  async createApproval(orgId: string, input: Partial<ApprovalRequest>){ await ensureDevOrg(orgId); const now=nowIso(); const a={id:uid(),organization_id:orgId,task_id:input.task_id||null,teammate_id:input.teammate_id||null,action_type:String(input.action_type||'action'),proposed_action:input.proposed_action||{},reason:String(input.reason||''),status:'pending',reviewed_by:null,reviewed_at:null,review_notes:null,created_at:now,updated_at:now}; const {error}=await sb().from('approval_requests').insert(a); if(error) throw error; return a as ApprovalRequest },
  async updateApproval(orgId: string, id: string, patch: Partial<ApprovalRequest>){ const cur=await this.getApproval(orgId,id); if(!cur) return null; const next={...cur,...patch,updated_at:nowIso()}; const {error}=await sb().from('approval_requests').update(next).eq('organization_id',orgId).eq('id',id); if(error) throw error; return next as ApprovalRequest },
  async listApprovals(orgId: string){ const {data,error}=await sb().from('approval_requests').select('*').eq('organization_id',orgId).order('created_at',{ascending:false}); if(error) throw error; return (data||[]) as ApprovalRequest[] },
  async getApproval(orgId: string, id: string){ const {data,error}=await sb().from('approval_requests').select('*').eq('organization_id',orgId).eq('id',id).maybeSingle(); if(error) throw error; return data as ApprovalRequest|null },

  async addLog(orgId: string, input: Partial<ExecutionLog>){ await ensureDevOrg(orgId); const l={id:uid(),organization_id:orgId,task_id:input.task_id||null,teammate_id:input.teammate_id||null,level:(input.level as any)||'info',event_type:String(input.event_type||'event'),message:String(input.message||''),details:input.details||{},created_at:nowIso()}; const {error}=await sb().from('execution_logs').insert(l); if(error) throw error; return l as ExecutionLog },
  async listLogs(orgId: string, taskId?: string){ let q=sb().from('execution_logs').select('*').eq('organization_id',orgId).order('created_at',{ascending:false}); if(taskId) q=q.eq('task_id',taskId); const {data,error}=await q; if(error) throw error; return (data||[]) as ExecutionLog[] },

  async createWorkflow(orgId: string, input: Partial<Workflow>){ await ensureDevOrg(orgId); const now=nowIso(); const w={id:uid(),organization_id:orgId,name:String(input.name||'Workflow'),description:String(input.description||''),definition:input.definition||{},status:(input.status as any)||'draft',created_at:now,updated_at:now}; const {error}=await sb().from('workflows').insert(w); if(error) throw error; return w as Workflow },
  async listWorkflows(orgId: string){ const {data,error}=await sb().from('workflows').select('*').eq('organization_id',orgId).order('created_at',{ascending:false}); if(error) throw error; return (data||[]) as Workflow[] },
  async getWorkflow(orgId: string, id: string){ const {data,error}=await sb().from('workflows').select('*').eq('organization_id',orgId).eq('id',id).maybeSingle(); if(error) throw error; return data as Workflow|null },

  async createConversation(orgId: string, input: Partial<Conversation>){ await ensureDevOrg(orgId); const now=nowIso(); const c={id:uid(),organization_id:orgId,teammate_id:input.teammate_id||null,external_subject:String(input.external_subject||''),channel:String(input.channel||'internal'),status:String(input.status||'open'),created_at:now,updated_at:now}; const {error}=await sb().from('conversations').insert(c); if(error) throw error; return c as Conversation },
  async listConversations(orgId: string){ const {data,error}=await sb().from('conversations').select('*').eq('organization_id',orgId).order('created_at',{ascending:false}); if(error) throw error; return (data||[]) as Conversation[] },
  async addMessage(conversationId: string, input: Partial<Message>){ const m={id:uid(),conversation_id:conversationId,sender_type:String(input.sender_type||'system'),sender_id:input.sender_id||null,content:String(input.content||''),metadata:input.metadata||{},created_at:nowIso()}; const {error}=await sb().from('messages').insert(m); if(error) throw error; return m as Message },
  async listMessages(conversationId: string){ const {data,error}=await sb().from('messages').select('*').eq('conversation_id',conversationId).order('created_at',{ascending:true}); if(error) throw error; return (data||[]) as Message[] },

  async addMemory(orgId: string, input: Partial<MemoryItem>){ await ensureDevOrg(orgId); const now=nowIso(); const m={id:uid(),organization_id:orgId,teammate_id:input.teammate_id||null,memory_type:(input.memory_type as any)||'short_term',subject_key:input.subject_key||null,content:input.content??{},source:String(input.source||'system'),expires_at:input.expires_at||null,created_at:now,updated_at:now}; const {error}=await sb().from('agent_memory').insert(m); if(error) throw error; return m as MemoryItem },
  async listMemory(orgId: string, teammateId?: string){ let q=sb().from('agent_memory').select('*').eq('organization_id',orgId).order('created_at',{ascending:false}); if(teammateId) q=q.eq('teammate_id',teammateId); const {data,error}=await q; if(error) throw error; return (data||[]) as MemoryItem[] },
  async deleteMemory(orgId: string, id: string){ const {error,count}=await sb().from('agent_memory').delete({count:'exact'}).eq('organization_id',orgId).eq('id',id); if(error) throw error; return (count||0)>0 },

  async addKnowledge(orgId: string, input: Partial<KnowledgeDoc>){ await ensureDevOrg(orgId); const now=nowIso(); const k={id:uid(),organization_id:orgId,title:String(input.title||''),source:String(input.source||''),content:String(input.content||''),metadata:input.metadata||{},status:String(input.status||'approved'),created_at:now,updated_at:now}; const {error}=await sb().from('knowledge_documents').insert(k); if(error) throw error; return k as KnowledgeDoc },
  async listKnowledge(orgId: string){ const {data,error}=await sb().from('knowledge_documents').select('*').eq('organization_id',orgId).order('created_at',{ascending:false}); if(error) throw error; return (data||[]) as KnowledgeDoc[] },

  async upsertIntegration(orgId: string, input: Partial<Integration>){ await ensureDevOrg(orgId); const now=nowIso(); if(input.id){ const next={...input, updated_at:nowIso()}; const {error}=await sb().from('integrations').update(next).eq('organization_id',orgId).eq('id',input.id); if(!error) return (await this.listIntegrations(orgId)).find(i=>i.id===input.id) as Integration }
    const item={id:uid(),organization_id:orgId,provider:String(input.provider||''),name:String(input.name||''),status:String(input.status||'disconnected'),config:input.config||{},created_at:now,updated_at:now}; const {error}=await sb().from('integrations').insert(item); if(error) throw error; return item as Integration },
  async listIntegrations(orgId: string){ const {data,error}=await sb().from('integrations').select('*').eq('organization_id',orgId).order('created_at',{ascending:false}); if(error) throw error; return (data||[]) as Integration[] },

  async computeMetrics(orgId: string){
    const [tasks, teammates, approvals] = await Promise.all([this.listTasks(orgId), this.listTeammates(orgId), this.listApprovals(orgId)])
    const completed = tasks.filter(t=>t.status==='completed'); const failed = tasks.filter(t=>t.status==='failed'); const inProgress = tasks.filter(t=>['in_progress','planning'].includes(t.status))
    const needingApproval = tasks.filter(t=>t.status==='awaiting_approval').length || approvals.filter(a=>a.status==='pending').length
    const durations = completed.map(t=> (t.started_at&&t.completed_at)? (new Date(t.completed_at).getTime()-new Date(t.started_at).getTime())/1000 : null).filter((n):n is number=>typeof n==='number'&&isFinite(n))
    const avg = durations.length? Math.round(durations.reduce((a,b)=>a+b,0)/durations.length): null
    const terminal = completed.length + failed.length; const successRate = terminal? Math.round((completed.length/terminal)*100): null
    const escalationRate = tasks.length? Math.round((approvals.length/tasks.length)*100): null
    return { totalTeammates: teammates.length, activeTeammates: teammates.filter(t=>t.status==='active').length, tasksCompleted: completed.length, tasksInProgress: inProgress.length, tasksRequiringApproval: needingApproval, failedTasks: failed.length, averageTaskCompletionTimeSeconds: avg, successRate, humanEscalationRate: escalationRate }
  }
}

export function supabaseConfigured() {
  return !!(process.env.SUPABASE_URL && (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY))
}
