export type Teammate = {
  id: string; organization_id: string; name: string; job_role: string; responsibilities: string; objectives: string; personality: string; communication_style: string;
  status: 'active' | 'paused' | 'inactive'; requires_human_approval: boolean;
  tools: Array<{ tool_key: string; enabled: boolean; config: Record<string, unknown> }>;
  permissions: Array<{ permission_key: string; allowed: boolean; requires_approval: boolean; constraints: Record<string, unknown> }>;
  created_at: string; updated_at: string;
}
export type Task = { id: string; organization_id: string; teammate_id: string|null; workflow_id: string|null; title: string; objective: string; status: string; priority: string; result_summary: string|null; error_message: string|null; started_at: string|null; completed_at: string|null; created_at: string; updated_at: string }
export type TaskStep = { id: string; task_id: string; step_index: number; name: string; status: string; input: any; output: any; error_message: string|null; started_at: string|null; completed_at: string|null; created_at: string }
export type Approval = { id: string; task_id: string|null; teammate_id: string|null; action_type: string; proposed_action: any; reason: string; status: string; reviewed_by: string|null; reviewed_at: string|null; review_notes: string|null; created_at: string }
export type LogEntry = { id: string; task_id: string|null; teammate_id: string|null; level: string; event_type: string; message: string; details: any; created_at: string }
export type Workflow = { id: string; name: string; description: string; definition: any; status: string; created_at: string }
export type Conversation = { id: string; teammate_id: string|null; external_subject: string; channel: string; status: string; created_at: string }
export type Message = { id: string; conversation_id: string; sender_type: string; content: string; metadata: any; created_at: string }
export type KnowledgeDoc = { id: string; title: string; source: string; content: string; status: string; created_at: string }
export type Integration = { id: string; provider: string; name: string; status: string; config: any; created_at: string }

const base = import.meta.env.VITE_API_BASE_URL || ''

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${base}${path}`, { headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) }, ...init })
  if (!res.ok) { const text = await res.text(); throw new Error(text || `Request failed: ${res.status}`) }
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export const api = {
  listTeammates: () => req<{ teammates: Teammate[]; source: string }>('/api/teammates'),
  getTeammate: (id: string) => req<{ teammate: Teammate }>(`/api/teammates/${id}`),
  createTeammate: (data: Partial<Teammate>) => req<{ teammate: Teammate }>('/api/teammates', { method: 'POST', body: JSON.stringify(data) }),
  updateTeammate: (id: string, data: Partial<Teammate>) => req<{ teammate: Teammate }>(`/api/teammates/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteTeammate: (id: string) => req<void>(`/api/teammates/${id}`, { method: 'DELETE' }),
  listTasks: () => req<{ tasks: Task[] }>('/api/tasks'),
  getTask: (id: string) => req<{ task: Task; steps: TaskStep[]; logs: LogEntry[] }>(`/api/tasks/${id}`),
  createTask: (data: any) => req<{ task: Task }>('/api/tasks', { method: 'POST', body: JSON.stringify(data) }),
  runTask: (id: string) => req<{ ok: boolean }>(`/api/tasks/${id}/run`, { method: 'POST' }),
  listApprovals: () => req<{ approvals: Approval[] }>('/api/approvals'),
  reviewApproval: (id: string, data: any) => req<{ approval: Approval }>(`/api/approvals/${id}/review`, { method: 'POST', body: JSON.stringify(data) }),
  listWorkflows: () => req<{ workflows: Workflow[] }>('/api/workflows'),
  createWorkflow: (data: any) => req<{ workflow: Workflow }>('/api/workflows', { method: 'POST', body: JSON.stringify(data) }),
  listConversations: () => req<{ conversations: Conversation[] }>('/api/conversations'),
  createConversation: (data: any) => req<{ conversation: Conversation }>('/api/conversations', { method: 'POST', body: JSON.stringify(data) }),
  listMessages: (id: string) => req<{ messages: Message[] }>(`/api/conversations/${id}/messages`),
  addMessage: (id: string, data: any) => req<{ message: Message }>(`/api/conversations/${id}/messages`, { method: 'POST', body: JSON.stringify(data) }),
  listKnowledge: () => req<{ documents: KnowledgeDoc[] }>('/api/knowledge'),
  addKnowledge: (data: any) => req<{ document: KnowledgeDoc }>('/api/knowledge', { method: 'POST', body: JSON.stringify(data) }),
  listIntegrations: () => req<{ integrations: Integration[] }>('/api/integrations'),
  saveIntegration: (data: any) => req<{ integration: Integration }>('/api/integrations', { method: 'POST', body: JSON.stringify(data) }),
  listHistory: () => req<{ logs: LogEntry[] }>('/api/history'),
  metrics: () => req<{ metrics: any; source: string }>('/api/dashboard/metrics'),
}
