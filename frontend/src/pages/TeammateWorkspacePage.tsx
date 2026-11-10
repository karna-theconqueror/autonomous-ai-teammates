import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api, type Teammate } from '../lib/api'
import { StatusIndicator } from '../components/ui/StatusIndicator'

export function TeammateWorkspacePage() {
  const { id } = useParams()
  const [tm, setTm] = useState<Teammate | null>(null)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => { if (id) api.getTeammate(id).then(d=>setTm(d.teammate)).catch(e=>setError(e.message)) }, [id])

  async function save(patch: Partial<Teammate>, okMsg='Saved') {
    if (!tm) return
    setSaving(true); setError(''); setMsg('')
    try { const res = await api.updateTeammate(tm.id, patch); setTm(res.teammate); setMsg(okMsg) }
    catch(e:any){ setError(e.message) } finally { setSaving(false) }
  }

  if (error) return <div className="card-surface p-6 text-rose-200">{error}</div>
  if (!tm) return <div className="card-surface p-6 text-gray-400">Loading teammate…</div>

  return (
    <div className="space-y-4 max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{tm.name}</h1>
          <p className="text-gray-400">{tm.job_role} • <span className="text-xs">ID: {tm.id}</span></p>
        </div>
        <div className="flex items-center gap-2">
          <StatusIndicator status={tm.status==='active'?'healthy':tm.status==='paused'?'warning':'idle'} label={tm.status} />
          <select className="rounded-lg border border-border bg-surface2 px-3 py-2 text-sm" value={tm.status} onChange={e=>save({status: e.target.value as any}, 'Status updated')}>
            <option value="active">Active</option><option value="paused">Paused</option><option value="inactive">Inactive</option>
          </select>
          <Link to="/app/teammates" className="btn-secondary">Back</Link>
        </div>
      </div>
      {msg && <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-200">{msg}</div>}

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="card-surface p-4 space-y-3">
          <h2 className="font-medium">Configuration</h2>
          <label className="text-sm block"><span className="text-gray-300">Responsibilities</span><textarea className="mt-1 w-full rounded-lg border border-border bg-surface2 px-3 py-2" rows={4} value={tm.responsibilities} onChange={e=>setTm({...tm,responsibilities:e.target.value})} /></label>
          <label className="text-sm block"><span className="text-gray-300">Objectives</span><textarea className="mt-1 w-full rounded-lg border border-border bg-surface2 px-3 py-2" rows={4} value={tm.objectives} onChange={e=>setTm({...tm,objectives:e.target.value})} /></label>
          <div className="grid md:grid-cols-2 gap-3">
            <label className="text-sm block"><span className="text-gray-300">Personality</span><input className="mt-1 w-full rounded-lg border border-border bg-surface2 px-3 py-2" value={tm.personality} onChange={e=>setTm({...tm,personality:e.target.value})} /></label>
            <label className="text-sm block"><span className="text-gray-300">Communication style</span><input className="mt-1 w-full rounded-lg border border-border bg-surface2 px-3 py-2" value={tm.communication_style} onChange={e=>setTm({...tm,communication_style:e.target.value})} /></label>
          </div>
          <label className="text-sm flex items-center gap-2"><input type="checkbox" checked={tm.requires_human_approval} onChange={e=>setTm({...tm,requires_human_approval:e.target.checked})} /> Require human approval for sensitive actions</label>
          <button className="btn-primary" disabled={saving} onClick={()=>save({responsibilities:tm.responsibilities, objectives:tm.objectives, personality:tm.personality, communication_style:tm.communication_style, requires_human_approval:tm.requires_human_approval})}>{saving?'Saving…':'Save configuration'}</button>
        </div>

        <div className="space-y-4">
          <div className="card-surface p-4">
            <h2 className="font-medium mb-2">Tool Assignment</h2>
            <div className="space-y-2 text-sm">
              {tm.tools.map((t,i)=> (
                <label key={t.tool_key} className="flex items-center justify-between rounded-lg border border-border bg-surface2 px-3 py-2">
                  <span>{t.tool_key}</span>
                  <input type="checkbox" checked={t.enabled} onChange={e=>{ const tools=[...tm.tools]; tools[i]={...tools[i],enabled:e.target.checked}; setTm({...tm,tools}) }} />
                </label>
              ))}
              {tm.tools.length===0 && <div className="text-gray-400">No tools configured.</div>}
            </div>
            <button className="btn-secondary mt-3" disabled={saving} onClick={()=>save({tools:tm.tools}, 'Tools updated')}>Save tools</button>
          </div>
          <div className="card-surface p-4">
            <h2 className="font-medium mb-2">Operational Permissions</h2>
            <div className="space-y-2 text-sm max-h-72 overflow-auto pr-1">
              {tm.permissions.map((p,i)=> (
                <div key={p.permission_key} className="rounded-lg border border-border bg-surface2 px-3 py-2">
                  <div className="flex items-center justify-between"><span>{p.permission_key}</span><input type="checkbox" checked={p.allowed} onChange={e=>{ const permissions=[...tm.permissions]; permissions[i]={...permissions[i],allowed:e.target.checked}; setTm({...tm,permissions}) }} /></div>
                  <label className="mt-1 flex items-center gap-2 text-xs text-gray-400"><input type="checkbox" checked={p.requires_approval} onChange={e=>{ const permissions=[...tm.permissions]; permissions[i]={...permissions[i],requires_approval:e.target.checked}; setTm({...tm,permissions}) }} /> requires approval</label>
                </div>
              ))}
              {tm.permissions.length===0 && <div className="text-gray-400">No permissions configured.</div>}
            </div>
            <button className="btn-secondary mt-3" disabled={saving} onClick={()=>save({permissions:tm.permissions}, 'Permissions updated')}>Save permissions</button>
          </div>
        </div>
      </div>
      <p className="text-xs text-gray-500">Phase 2: teammate configuration, role, tool assignment, permissions, and activation state are persisted via backend API (dev-local store when production DB is not configured). Agent execution, real integrations, and approval workflows are implemented in later phases.</p>
    </div>
  )
}
