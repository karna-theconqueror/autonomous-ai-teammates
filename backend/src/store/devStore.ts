import { sqliteStore } from './sqliteStore'
import { supabaseStore, supabaseConfigured } from './supabaseStore'

/**
 * Persistence layer.
 * - If SUPABASE_URL and key are configured: uses Supabase/Postgres (async, RLS-aware schema).
 * - Otherwise: uses local SQLite (backend/.data/dev.db) via node:sqlite, no paid services.
 * All exported functions are async for a unified interface.
 */

export type Teammate = {
  id: string; organization_id: string; name: string; job_role: string; responsibilities: string; objectives: string; personality: string; communication_style: string;
  status: 'active' | 'paused' | 'inactive'; requires_human_approval: boolean;
  tools: Array<{ tool_key: string; enabled: boolean; config: Record<string, unknown> }>;
  permissions: Array<{ permission_key: string; allowed: boolean; requires_approval: boolean; constraints: Record<string, unknown> }>;
  created_at: string; updated_at: string;
}
export type Task = { id: string; organization_id: string; teammate_id: string | null; workflow_id: string | null; title: string; objective: string; status: 'pending' | 'planning' | 'in_progress' | 'awaiting_approval' | 'completed' | 'failed' | 'cancelled'; priority: string; result_summary: string | null; error_message: string | null; started_at: string | null; completed_at: string | null; created_at: string; updated_at: string }
export type TaskStep = { id: string; task_id: string; step_index: number; name: string; status: 'pending' | 'running' | 'succeeded' | 'failed' | 'skipped' | 'awaiting_approval'; input: any; output: any; error_message: string | null; started_at: string | null; completed_at: string | null; created_at: string; updated_at: string }
export type ApprovalRequest = { id: string; organization_id: string; task_id: string | null; teammate_id: string | null; action_type: string; proposed_action: any; reason: string; status: 'pending' | 'approved' | 'rejected' | 'edited' | 'taken_over'; reviewed_by: string | null; reviewed_at: string | null; review_notes: string | null; created_at: string; updated_at: string }
export type ExecutionLog = { id: string; organization_id: string; task_id: string | null; teammate_id: string | null; level: 'info' | 'warn' | 'error'; event_type: string; message: string; details: any; created_at: string }
export type Workflow = { id: string; organization_id: string; name: string; description: string; definition: any; status: 'draft' | 'active' | 'archived'; created_at: string; updated_at: string }
export type Conversation = { id: string; organization_id: string; teammate_id: string | null; external_subject: string; channel: string; status: string; created_at: string; updated_at: string }
export type Message = { id: string; conversation_id: string; sender_type: string; sender_id: string | null; content: string; metadata: any; created_at: string }
export type MemoryItem = { id: string; organization_id: string; teammate_id: string | null; memory_type: 'short_term'|'long_term'|'workflow'|'customer'; subject_key: string | null; content: any; source: string; expires_at: string | null; created_at: string; updated_at: string }
export type KnowledgeDoc = { id: string; organization_id: string; title: string; source: string; content: string; metadata: any; status: string; created_at: string; updated_at: string }
export type Integration = { id: string; organization_id: string; provider: string; name: string; status: string; config: any; created_at: string; updated_at: string }

const useSupabase = () => process.env.USE_SUPABASE !== 'false' && supabaseConfigured()
const S = () => useSupabase() ? supabaseStore : (sqliteStore as any)

export const listTeammates = async (orgId: string) => S().listTeammates(orgId)
export const getTeammate = async (orgId: string, id: string) => S().getTeammate(orgId, id)
export const createTeammate = async (orgId: string, input: Partial<Teammate>) => S().createTeammate(orgId, input)
export const updateTeammate = async (orgId: string, id: string, patch: Partial<Teammate>) => S().updateTeammate(orgId, id, patch)
export const deleteTeammate = async (orgId: string, id: string) => S().deleteTeammate(orgId, id)

export const createTask = async (orgId: string, input: Partial<Task>) => S().createTask(orgId, input)
export const updateTask = async (orgId: string, id: string, patch: Partial<Task>) => S().updateTask(orgId, id, patch)
export const getTask = async (orgId: string, id: string) => S().getTask(orgId, id)
export const listTasks = async (orgId: string) => S().listTasks(orgId)

export const addTaskSteps = async (taskId: string, steps: Array<Pick<TaskStep,'step_index'|'name'|'status'|'input'>>) => S().addTaskSteps(taskId, steps)
export const updateTaskStep = async (stepId: string, patch: Partial<TaskStep>) => S().updateTaskStep(stepId, patch)
export const listTaskSteps = async (taskId: string) => S().listTaskSteps(taskId)

export const createApproval = async (orgId: string, input: Partial<ApprovalRequest>) => S().createApproval(orgId, input)
export const updateApproval = async (orgId: string, id: string, patch: Partial<ApprovalRequest>) => S().updateApproval(orgId, id, patch)
export const listApprovals = async (orgId: string) => S().listApprovals(orgId)
export const getApproval = async (orgId: string, id: string) => S().getApproval(orgId, id)

export const addLog = async (orgId: string, input: Partial<ExecutionLog>) => S().addLog(orgId, input)
export const listLogs = async (orgId: string, taskId?: string) => S().listLogs(orgId, taskId)

export const createWorkflow = async (orgId: string, input: Partial<Workflow>) => S().createWorkflow(orgId, input)
export const listWorkflows = async (orgId: string) => S().listWorkflows(orgId)
export const getWorkflow = async (orgId: string, id: string) => S().getWorkflow(orgId, id)

export const createConversation = async (orgId: string, input: Partial<Conversation>) => S().createConversation(orgId, input)
export const listConversations = async (orgId: string) => S().listConversations(orgId)
export const addMessage = async (conversationId: string, input: Partial<Message>) => S().addMessage(conversationId, input)
export const listMessages = async (conversationId: string) => S().listMessages(conversationId)

export const addMemory = async (orgId: string, input: Partial<MemoryItem>) => S().addMemory(orgId, input)
export const listMemory = async (orgId: string, teammateId?: string) => S().listMemory(orgId, teammateId)
export const deleteMemory = async (orgId: string, id: string) => S().deleteMemory(orgId, id)

export const addKnowledge = async (orgId: string, input: Partial<KnowledgeDoc>) => S().addKnowledge(orgId, input)
export const listKnowledge = async (orgId: string) => S().listKnowledge(orgId)

export const upsertIntegration = async (orgId: string, input: Partial<Integration>) => S().upsertIntegration(orgId, input)
export const listIntegrations = async (orgId: string) => S().listIntegrations(orgId)

export const computeMetrics = async (orgId: string) => S().computeMetrics(orgId)

export const persistenceMode = () => useSupabase() ? 'supabase' : 'sqlite'
