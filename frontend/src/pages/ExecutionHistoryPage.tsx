import { useEffect, useState } from 'react'
import { api, type LogEntry } from '../lib/api'

export function ExecutionHistoryPage() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [err, setErr] = useState('')
  const load = async ()=>{ try{ setLogs((await api.listHistory()).logs) }catch(e:any){setErr(e.message)} }
  useEffect(()=>{ load() }, [])
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between"><h1 className="text-2xl font-semibold">Execution History</h1><button className="btn-secondary" onClick={load}>Refresh</button></div>
      {err && <div className="text-rose-200 text-sm">{err}</div>}
      <div className="card-surface overflow-hidden">
        {logs.length===0 ? <div className="p-6 text-gray-400">No execution logs yet. Run a task to generate audit logs.</div> :
          <div className="max-h-[70vh] overflow-auto divide-y divide-border">{logs.map(l=> <div key={l.id} className="p-3 text-sm"><div className="flex justify-between gap-3"><span className="font-medium">[{l.level}] {l.event_type}</span><span className="text-xs text-gray-500">{l.created_at}</span></div><div className="text-gray-300">{l.message}</div><div className="text-xs text-gray-500">task: {l.task_id || '-'} • teammate: {l.teammate_id || '-'}</div></div>)}</div>}
      </div>
    </div>
  )
}
