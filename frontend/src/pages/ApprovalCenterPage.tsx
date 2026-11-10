import { useEffect, useState } from 'react'
import { api, type Approval } from '../lib/api'

export function ApprovalCenterPage() {
  const [items, setItems] = useState<Approval[]>([])
  const [err, setErr] = useState('')
  const [notes, setNotes] = useState<Record<string,string>>({})
  const load = async ()=>{ try { setItems((await api.listApprovals()).approvals) } catch(e:any){ setErr(e.message) } }
  useEffect(()=>{ load() }, [])
  async function act(id:string, action:'approve'|'reject'|'edit'|'take_over'){
    try { await api.reviewApproval(id, { action, notes: notes[id]||'' }); await load() } catch(e:any){ setErr(e.message) }
  }
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between"><h1 className="text-2xl font-semibold">Approval Center</h1><button className="btn-secondary" onClick={load}>Refresh</button></div>
      {err && <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">{err}</div>}
      {items.length===0 ? <div className="card-surface p-6 text-gray-400">No approval requests. Sensitive/approval-required actions will appear here for review, approve, reject, edit, or takeover.</div> :
        <div className="grid lg:grid-cols-2 gap-4">
          {items.map(a=> (
            <div key={a.id} className="card-surface p-4 space-y-3">
              <div className="flex items-center justify-between"><div className="font-medium">{a.action_type}</div><span className="text-xs px-2 py-1 rounded border border-border bg-surface2">{a.status}</span></div>
              <div className="text-sm text-gray-400">{a.reason}</div>
              <pre className="text-xs bg-surface2 border border-border rounded p-2 overflow-auto max-h-40">{JSON.stringify(a.proposed_action, null, 2)}</pre>
              {a.status==='pending' && <>
                <textarea className="w-full rounded-lg border border-border bg-surface2 px-3 py-2 text-sm" rows={2} placeholder="Review notes / edit instructions" value={notes[a.id]||''} onChange={e=>setNotes({...notes,[a.id]:e.target.value})} />
                <div className="flex flex-wrap gap-2">
                  <button className="btn-primary text-sm" onClick={()=>act(a.id,'approve')}>Approve</button>
                  <button className="btn-secondary text-sm" onClick={()=>act(a.id,'edit')}>Approve w/ Edit Note</button>
                  <button className="btn-secondary text-sm" onClick={()=>act(a.id,'reject')}>Reject</button>
                  <button className="btn-secondary text-sm" onClick={()=>act(a.id,'take_over')}>Take Over</button>
                </div>
              </>}
              {a.reviewed_at && <div className="text-xs text-gray-500">Reviewed {a.reviewed_at} {a.review_notes?`• ${a.review_notes}`:''}</div>}
            </div>
          ))}
        </div>}
      <p className="text-xs text-gray-500">Human-in-the-loop: financial/sensitive/external actions can be gated. Approved actions resume task execution in simulated mode (no unauthorized real side effects executed).</p>
    </div>
  )
}
