import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'

const roles = ['Sales AI Agent','Customer Support AI Agent','Lead Generation AI Agent','Order Management AI Agent','Appointment Booking AI Agent','Business Operations AI Agent']
const defaultTools = ['crm','email','calendar','database','knowledge_base','webhook','http_api']
const defaultPerms = ['read_leads','update_crm','send_email','schedule_appointment','create_ticket','access_knowledge_base','external_http','financial_action']

export function CreateTeammatePage() {
  const nav = useNavigate()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '', job_role: roles[0], responsibilities: '', objectives: '', personality: '', communication_style: '',
    status: 'inactive' as 'active'|'paused'|'inactive', requires_human_approval: true,
  })
  const [tools, setTools] = useState(defaultTools.map(t => ({ tool_key: t, enabled: false, config: {} as Record<string,unknown> })))
  const [perms, setPerms] = useState(defaultPerms.map(p => ({ permission_key: p, allowed: false, requires_approval: true, constraints: {} as Record<string,unknown> })))

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setError('')
    try {
      const res = await api.createTeammate({ ...form, tools, permissions: perms })
      nav(`/app/teammates/${res.teammate.id}`)
    } catch (err: any) { setError(err.message || 'Failed to create teammate') }
    finally { setSaving(false) }
  }

  const input = 'mt-1 w-full rounded-lg border border-border bg-surface2 px-3 py-2 outline-none focus:border-accent-blue'
  return (
    <div className="space-y-4 max-w-4xl">
      <h1 className="text-2xl font-semibold">Create AI Teammate</h1>
      <form className="card-surface p-6 space-y-5" onSubmit={submit}>
        {error && <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">{error}</div>}
        <div className="grid md:grid-cols-2 gap-4">
          <label className="text-sm"><span className="text-gray-300">Name</span><input className={input} required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="e.g. Ava" /></label>
          <label className="text-sm"><span className="text-gray-300">Job role</span><select className={input} value={form.job_role} onChange={e=>setForm({...form,job_role:e.target.value})}>{roles.map(r=> <option key={r}>{r}</option>)}</select></label>
        </div>
        <label className="text-sm block"><span className="text-gray-300">Responsibilities</span><textarea className={input} rows={3} value={form.responsibilities} onChange={e=>setForm({...form,responsibilities:e.target.value})} /></label>
        <label className="text-sm block"><span className="text-gray-300">Objectives</span><textarea className={input} rows={3} value={form.objectives} onChange={e=>setForm({...form,objectives:e.target.value})} /></label>
        <div className="grid md:grid-cols-2 gap-4">
          <label className="text-sm"><span className="text-gray-300">Personality</span><input className={input} value={form.personality} onChange={e=>setForm({...form,personality:e.target.value})} placeholder="e.g. helpful, calm" /></label>
          <label className="text-sm"><span className="text-gray-300">Communication style</span><input className={input} value={form.communication_style} onChange={e=>setForm({...form,communication_style:e.target.value})} placeholder="e.g. concise, professional" /></label>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <label className="text-sm"><span className="text-gray-300">Status</span><select className={input} value={form.status} onChange={e=>setForm({...form,status:e.target.value as any})}><option value="inactive">Inactive</option><option value="active">Active</option><option value="paused">Paused</option></select></label>
          <label className="text-sm flex items-end gap-2 pb-2"><input type="checkbox" checked={form.requires_human_approval} onChange={e=>setForm({...form,requires_human_approval:e.target.checked})} /><span className="text-gray-300">Require human approval for sensitive actions</span></label>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h2 className="font-medium mb-2">Assigned Tools</h2>
            <div className="space-y-2 text-sm">
              {tools.map((t,i)=> (
                <label key={t.tool_key} className="flex items-center justify-between rounded-lg border border-border bg-surface2 px-3 py-2">
                  <span>{t.tool_key}</span>
                  <input type="checkbox" checked={t.enabled} onChange={e=>{ const n=[...tools]; n[i]={...n[i],enabled:e.target.checked}; setTools(n)}} />
                </label>
              ))}
            </div>
          </div>
          <div>
            <h2 className="font-medium mb-2">Operational Permissions</h2>
            <div className="space-y-2 text-sm max-h-64 overflow-auto pr-1">
              {perms.map((p,i)=> (
                <div key={p.permission_key} className="rounded-lg border border-border bg-surface2 px-3 py-2">
                  <div className="flex items-center justify-between"><span>{p.permission_key}</span><input type="checkbox" checked={p.allowed} onChange={e=>{ const n=[...perms]; n[i]={...n[i],allowed:e.target.checked}; setPerms(n)}} /></div>
                  <label className="mt-1 flex items-center gap-2 text-xs text-gray-400"><input type="checkbox" checked={p.requires_approval} onChange={e=>{ const n=[...perms]; n[i]={...n[i],requires_approval:e.target.checked}; setPerms(n)}} /> requires approval</label>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="text-xs text-gray-500">Persistence: saved via backend API (local dev store when no production DB configured). Sensitive/external actions should require authorization and approval per policy.</div>
        <div className="flex gap-3"><button className="btn-primary" disabled={saving} type="submit">{saving?'Saving…':'Save Teammate'}</button><button type="button" className="btn-secondary" onClick={()=>nav('/app/teammates')}>Cancel</button></div>
      </form>
    </div>
  )
}
