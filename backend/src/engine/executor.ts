import * as store from '../store/devStore'
import { getLLMProvider } from '../ai/provider'
import { executeTool } from './tools'

const MAX_STEPS = 20
const MAX_RETRIES = 1

type Ctx = { orgId: string; taskId: string; teammateId: string | null }

async function log(ctx: Ctx, level: 'info'|'warn'|'error', event_type: string, message: string, details: any = {}) {
  return store.addLog(ctx.orgId, { task_id: ctx.taskId, teammate_id: ctx.teammateId, level, event_type, message, details })
}

function toolAllowed(teammate: store.Teammate | null, tool?: string) {
  if (!tool) return { allowed: true, requiresApproval: false, reason: 'no-tool' }
  if (!teammate) return { allowed: false, requiresApproval: false, reason: 'no-teammate' }
  const t = teammate.tools.find(x => x.tool_key === tool)
  if (!t || !t.enabled) return { allowed: false, requiresApproval: false, reason: `tool ${tool} not enabled` }
  return { allowed: true, requiresApproval: teammate.requires_human_approval, reason: 'ok' }
}

function permissionAllows(teammate: store.Teammate | null, action: string) {
  if (!teammate) return { allowed: true, requiresApproval: false }
  const map: Record<string,string> = { send_email:'send_email', schedule:'schedule_appointment', update_ticket:'create_ticket', categorize_lead:'update_crm', prepare_response:'send_email', ops_action:'external_http', order_action:'external_http', financial_action:'financial_action' }
  const key = map[action]
  if (!key) return { allowed: true, requiresApproval: teammate.requires_human_approval }
  const p = teammate.permissions.find(x => x.permission_key === key)
  if (!p) return { allowed: false, requiresApproval: false, reason: `permission ${key} not configured` }
  if (!p.allowed) return { allowed: false, requiresApproval: false, reason: `permission ${key} denied` }
  return { allowed: true, requiresApproval: p.requires_approval || teammate.requires_human_approval }
}

async function doExecute(orgId: string, taskId: string, teammateId: string|null, stepName: string, action: string, tool: string|undefined, input: any) {
  return executeTool({ orgId, taskId, teammateId, stepName, action, tool, input })
}

function verify(output: any) {
  if (!output) return { ok: false, reason: 'no output' }
  if (output.ok === false) return { ok: false, reason: output.error || 'failed' }
  return { ok: true }
}

export async function runTask(orgId: string, taskId: string) {
  const task = await store.getTask(orgId, taskId)
  if (!task) throw new Error('Task not found')
  const teammate = task.teammate_id ? await store.getTeammate(orgId, task.teammate_id) : null
  const ctx: Ctx = { orgId, taskId, teammateId: task.teammate_id }
  if (teammate && teammate.status !== 'active') {
    await store.updateTask(orgId, taskId, { status: 'failed', error_message: 'Teammate is not active', completed_at: new Date().toISOString() })
    await log(ctx,'error','task_blocked','Task blocked because teammate is not active',{})
    return store.getTask(orgId, taskId)
  }

  const started = new Date().toISOString()
  await store.updateTask(orgId, taskId, { status: 'planning', started_at: task.started_at || started, error_message: null })
  await log(ctx,'info','plan_start','Planning task',{ objective: task.objective })

  try {
    const provider = getLLMProvider()
    const plan = await provider.plan(task.objective || task.title, teammate?.job_role || 'Business Operations AI Agent', { teammate: teammate ? { id: teammate.id, role: teammate.job_role } : null })
    const planned = plan.steps.slice(0, MAX_STEPS)
    const stepRows = await store.addTaskSteps(taskId, planned.map((s,i)=>({ step_index: i+1, name: s.name, status: 'pending' as const, input: { ...s } })))
    await store.updateTask(orgId, taskId, { status: 'in_progress' })
    await log(ctx,'info','plan_created', plan.summary, { stepCount: stepRows.length, provider: plan.provider || provider.name })

    for (const row of stepRows) {
      const spec = row.input as any
      const action = spec.action as string
      const tool = spec.tool as string | undefined
      await store.updateTaskStep(row.id, { status: 'running', started_at: new Date().toISOString() })

      const tcheck = toolAllowed(teammate, tool)
      const pcheck = permissionAllows(teammate, action)
      if (!tcheck.allowed || !pcheck.allowed) {
        const reason = !tcheck.allowed ? tcheck.reason : (pcheck as any).reason
        await store.updateTaskStep(row.id, { status: 'failed', error_message: String(reason), completed_at: new Date().toISOString() })
        await store.updateTask(orgId, taskId, { status: 'failed', error_message: String(reason), completed_at: new Date().toISOString() })
        await log(ctx,'error','permission_denied','Action blocked by permissions/tools',{ step: row.name, reason })
        return store.getTask(orgId, taskId)
      }

      const needsApproval = Boolean(spec.requires_approval) || tcheck.requiresApproval || pcheck.requiresApproval
      if (needsApproval) {
        const approval = await store.createApproval(orgId, { task_id: taskId, teammate_id: task.teammate_id, action_type: action, proposed_action: spec, reason: 'Sensitive or approval-required action' })
        await store.updateTaskStep(row.id, { status: 'awaiting_approval', output: { approval_id: approval.id } })
        await store.updateTask(orgId, taskId, { status: 'awaiting_approval' })
        await log(ctx,'warn','awaiting_approval','Execution paused pending human approval',{ step: row.name, approvalId: approval.id })
        await store.addMemory(orgId, { teammate_id: task.teammate_id, memory_type: 'workflow', subject_key: taskId, content: { event: 'awaiting_approval', step: row.name, approvalId: approval.id }, source: 'executor' })
        return store.getTask(orgId, taskId)
      }

      let attempt = 0; let output: any = null; let ok = false; let err: string | null = null
      while (attempt <= MAX_RETRIES && !ok) {
        attempt++
        try { output = await doExecute(orgId, taskId, task.teammate_id, row.name, action, tool, spec.input); ok = verify(output).ok } catch(e:any){ err = e.message; ok = false }
      }
      if (!ok) {
        await store.updateTaskStep(row.id, { status: 'failed', error_message: err || 'Verification failed', output, completed_at: new Date().toISOString() })
        await store.updateTask(orgId, taskId, { status: 'failed', error_message: err || 'Verification failed', completed_at: new Date().toISOString() })
        await log(ctx,'error','step_failed','Step failed verification/execution',{ step: row.name, attempt, error: err, output })
        return store.getTask(orgId, taskId)
      }
      await store.updateTaskStep(row.id, { status: 'succeeded', output, completed_at: new Date().toISOString() })
      await log(ctx,'info','step_succeeded','Step executed and verified',{ step: row.name, simulated: !!output?.simulated })
    }

    await store.updateTask(orgId, taskId, { status: 'completed', result_summary: `Task completed with ${stepRows.length} planned steps using ${plan.provider || provider.name}. Actions were simulated or explicitly authorized; no unauthorized external actions were performed.`, completed_at: new Date().toISOString() })
    await store.addMemory(orgId, { teammate_id: task.teammate_id, memory_type: 'workflow', subject_key: taskId, content: { event: 'completed', steps: stepRows.length }, source: 'executor' })
    await log(ctx,'info','task_completed','Task completed',{ steps: stepRows.length })
    return store.getTask(orgId, taskId)
  } catch (e:any) {
    await store.updateTask(orgId, taskId, { status: 'failed', error_message: e.message, completed_at: new Date().toISOString() })
    await log(ctx,'error','task_failed','Task failed unexpectedly',{ error: e.message })
    return store.getTask(orgId, taskId)
  }
}

export async function resumeAfterApproval(orgId: string, taskId: string, approvalId: string) {
  const task = await store.getTask(orgId, taskId); const approval = await store.getApproval(orgId, approvalId)
  if (!task || !approval) throw new Error('Not found')
  if (approval.status !== 'approved' && approval.status !== 'edited') throw new Error('Approval not granted')
  const steps = await store.listTaskSteps(taskId)
  const idx = steps.findIndex((s: store.TaskStep)=>s.status==='awaiting_approval')
  if (idx < 0) return task
  const step = steps[idx]
  await store.updateTaskStep(step.id, { status: 'succeeded', output: { ok: true, simulated: true, resumed_after_approval: approval.status, note: 'Approved action recorded as executed per policy (simulated by default unless explicitly authorized real connector is configured).' }, completed_at: new Date().toISOString() })
  await log({orgId,taskId,teammateId:task.teammate_id},'info','approval_resumed','Resumed after approval',{ approvalId, status: approval.status })
  await store.updateTask(orgId, taskId, { status: 'in_progress' })
  const teammate = task.teammate_id ? await store.getTeammate(orgId, task.teammate_id) : null
  for (let i=idx+1;i<steps.length;i++){
    const row = steps[i]; const s = row.input as any; const action=s.action; const tool=s.tool
    await store.updateTaskStep(row.id,{status:'running',started_at:new Date().toISOString()})
    const tcheck=toolAllowed(teammate,tool); const pcheck=permissionAllows(teammate,action)
    if(!tcheck.allowed||!pcheck.allowed){ await store.updateTaskStep(row.id,{status:'failed',error_message:String((!tcheck.allowed?tcheck.reason:(pcheck as any).reason)||'denied'),completed_at:new Date().toISOString()}); await store.updateTask(orgId,taskId,{status:'failed',completed_at:new Date().toISOString()}); return store.getTask(orgId,taskId) }
    const needsApproval = Boolean(s.requires_approval) || tcheck.requiresApproval || pcheck.requiresApproval
    if(needsApproval){ const ap=await store.createApproval(orgId,{task_id:taskId,teammate_id:task.teammate_id,action_type:action,proposed_action:s,reason:'Sensitive or approval-required action'}); await store.updateTaskStep(row.id,{status:'awaiting_approval',output:{approval_id:ap.id}}); await store.updateTask(orgId,taskId,{status:'awaiting_approval'}); return store.getTask(orgId,taskId) }
    const out = await doExecute(orgId, taskId, task.teammate_id, row.name,action,tool,s.input); await store.updateTaskStep(row.id,{status:'succeeded',output:out,completed_at:new Date().toISOString()})
  }
  await store.updateTask(orgId,taskId,{status:'completed',result_summary:'Task completed after approval (simulated).',completed_at:new Date().toISOString()}); return store.getTask(orgId,taskId)
}
