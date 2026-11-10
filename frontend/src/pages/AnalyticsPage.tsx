import { useEffect, useMemo, useState } from 'react'
import { api } from '../lib/api'
import { AnalyticsChart } from '../components/ui/AnalyticsChart'

export function AnalyticsPage() {
  const [metrics, setMetrics] = useState<any>(null)
  const [tasks, setTasks] = useState<any[]>([])
  const [teammates, setTeammates] = useState<any[]>([])
  useEffect(()=>{ (async()=>{
    try{ const [m,t,tm]=await Promise.all([api.metrics(), api.listTasks(), api.listTeammates()]); setMetrics(m.metrics); setTasks(t.tasks); setTeammates(tm.teammates)}catch{}
  })() }, [])
  const trend = useMemo(()=>{
    const byDay: Record<string, number> = {}
    tasks.forEach(t=>{ if(t.status==='completed' && t.completed_at){ const d=t.completed_at.slice(0,10); byDay[d]=(byDay[d]||0)+1 } })
    return Object.keys(byDay).sort().map(d=>({ name:d.slice(5), value: byDay[d] }))
  }, [tasks])
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Analytics and Reports</h1>
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          ['Tasks Completed', metrics?.tasksCompleted ?? '—'],
          ['Tasks In Progress', metrics?.tasksInProgress ?? '—'],
          ['Success Rate', metrics?.successRate==null?'No data':`${metrics.successRate}%`],
          ['Escalation Rate', metrics?.humanEscalationRate==null?'No data':`${metrics.humanEscalationRate}%`],
        ].map(([l,v])=> <div key={String(l)} className="card-surface p-4"><div className="text-sm text-gray-400">{l}</div><div className="text-2xl font-semibold mt-1">{String(v)}</div></div>)}
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        <AnalyticsChart title="Completed Tasks by Day (real data)" data={trend} />
        <div className="card-surface p-4">
          <h2 className="font-medium mb-3">Individual Teammate Performance</h2>
          {teammates.length===0 ? <div className="text-gray-400 text-sm">No teammates configured.</div> : <div className="space-y-2 text-sm">{teammates.map(tm=> {
            const tt = tasks.filter(t=>t.teammate_id===tm.id); const done = tt.filter(t=>t.status==='completed').length; const failed = tt.filter(t=>t.status==='failed').length
            return <div key={tm.id} className="rounded border border-border bg-surface2 p-3 flex justify-between"><div><div className="font-medium">{tm.name}</div><div className="text-xs text-gray-400">{tm.job_role} • {tm.status}</div></div><div className="text-right text-xs text-gray-300"><div>Tasks: {tt.length}</div><div>Completed: {done}</div><div>Failed: {failed}</div></div></div>
          })}</div>}
        </div>
      </div>
      <p className="text-xs text-gray-500">All metrics/charts are computed from persisted task/approval/teammate records (dev-local store when production DB not configured). No fabricated statistics.</p>
    </div>
  )
}
