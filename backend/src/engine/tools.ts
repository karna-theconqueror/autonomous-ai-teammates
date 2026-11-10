import crypto from 'crypto'

export type ToolResult = { ok: boolean; simulated?: boolean; data?: any; error?: string; meta?: any }

type ExecInput = { orgId: string; taskId: string; teammateId: string|null; stepName: string; action: string; tool?: string; input?: any }

function timeoutFetch(url: string, init: RequestInit, ms: number) {
  const ctrl = new AbortController(); const t = setTimeout(()=>ctrl.abort(), ms)
  return fetch(url, { ...init, signal: ctrl.signal }).finally(()=>clearTimeout(t))
}

export async function executeTool(x: ExecInput): Promise<ToolResult> {
  const tool = x.tool
  // Real HTTP/webhook execution path ONLY when explicitly enabled via env and tool is http_api/webhook.
  // Secrets must come from env/secret refs, never from frontend/client payload.
  if ((tool === 'http_api' || tool === 'webhook') && process.env.ENABLE_REAL_HTTP_TOOLS === 'true') {
    const url = x.input?.url || process.env.DEFAULT_WEBHOOK_URL
    if (!url) return { ok: false, error: 'No URL configured for HTTP tool' }
    try {
      const headers: Record<string,string> = { 'Content-Type': 'application/json' }
      if (process.env.HTTP_TOOL_AUTH_HEADER && process.env.HTTP_TOOL_AUTH_VALUE) headers[process.env.HTTP_TOOL_AUTH_HEADER] = process.env.HTTP_TOOL_AUTH_VALUE
      const res = await timeoutFetch(String(url), { method: String(x.input?.method||'POST'), headers, body: JSON.stringify({ action: x.action, input: x.input, meta: { taskId: x.taskId, step: x.stepName } }) }, 15000)
      const text = await res.text()
      return { ok: res.ok, data: { status: res.status, body: text.slice(0, 2000) }, meta: { executed: 'http' } }
    } catch (e:any) {
      return { ok: false, error: e.message || 'HTTP tool failed' }
    }
  }

  // Simulated connectors for CRM/email/calendar/database/knowledge_base and default path.
  // These record intended actions without claiming unauthorized external side effects.
  const id = crypto.randomUUID()
  return {
    ok: true,
    simulated: true,
    data: { id, tool: tool || null, action: x.action, step: x.stepName, inputSummary: typeof x.input === 'object' ? Object.keys(x.input||{}) : null },
    meta: { note: 'Simulated execution (no unauthorized external side effects). Configure and authorize real connectors for live actions.' }
  }
}
