import { useEffect, useState } from 'react'
import { api, type Task, type Teammate } from '../lib/api'

export function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [teammates, setTeammates] = useState<Teammate[]>([])
  const [selected, setSelected] = useState<any>(null)
  const [form, setForm] = useState({ title: '', objective: '', teammate_id: '' })
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')

  async function load() {
    try { const [t, tm] = await Promise.all([api.listTasks(), api.listTeammates()]); setTasks(t.tasks); setTeammates(tm.teammates) } catch(e:any){ setErr(e.message) } finally { setLoading(false) }
  }
  useEffect(()=>{ load() }, [])

  async function create(e: React.FormEvent) {
    e.preventDefault(); setErr('')
    try {
      await api.createTask({ title: form.title, objective: form.objective, teammate_id: form.teammate_id || null, run: true })
      setForm({ title: '', objective: '', teammate_id: '' })
      await load()
    } catch(e:any){ setErr(e.message) }
  }
  async function open(id: string) { try { setSelected(await api.getTask(id)) } catch(e:any){ setErr(e.message) } }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Task Management</h1>
      {err && <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">{err}</div>}
      <form onSubmit={create} className="card-surface p-4 grid md:grid-cols-4 gap-3 items-end">
        <label className="text-sm md:col-span-1"><span className="text-gray-300">Title</span><input className="mt-1 w-full rounded-lg border border-border bg-surface2 px-3 py-2" required value={form.title} onChange={e=>setForm({...form,title:e.target.value})} /></label>
        <label className="text-sm md:col-span-2"><span className="text-gray-300">Objective</span><input className="mt-1 w-full rounded-lg border border-border bg-surface2 px-3 py-2" required value={form.objective} onChange={e=>setForm({...form,objective:e.target.value})} placeholder="Describe the business objective..." /></label>
        <div className="flex gap-2">
          <select className="mt-6 md:mt-0 w-full rounded-lg border border-border bg-surface2 px-3 py-2 text-sm" value={form.teammate_id} onChange={e=>setForm({...form,teammate_id:e.target.value})}>
            <option value="">No teammate</option>
            {teammates.map(t=> <option key={t.id} value={t.id}>{t.name} ({t.job_role})</option>)}
          </select>
          <button className="btn-primary whitespace-nowrap" type="submit">Create & Run</button>
        </div>
      </form>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="card-surface overflow-hidden">
          <div className="p-3 border-b border-border font-medium">Tasks</div>
          {loading ? <div className="p-4 text-gray-400">Loading…</div> : tasks.length===0 ? <div className="p-4 text-gray-400">No tasks yet. Create a task to run the agent execution loop (mock provider, controlled PLAN→VALIDATE→EXECUTE→VERIFY→UPDATE→REPORT).</div> :
            <table className="w-full text-sm"><thead className="bg-surface2 text-gray-400"><tr><th className="text-left p-3">Title</th><th className="text-left p-3">Status</th><th className="p-3"></th></tr></thead><tbody>
              {tasks.map(t=> <tr key={t.id} className="border-t border-border"><td className="p-3"><div>{t.title}</div><div className="text-xs text-gray-500 line-clamp-1">{t.objective}</div></td><td className="p-3">{t.status}</td><td className="p-3"><button className="btn-secondary text-xs px-2 py-1" onClick={()=>open(t.id)}>View</button></td></tr>)}
            </tbody></table>}
        </div>
        <div className="card-surface p-4 space-y-3">
          <div className="font-medium">Task Detail / Execution</div>
          {!selected ? <div className="text-gray-400 text-sm">Select a task to view steps and execution logs.</div> : (
            <div className="space-y-3 text-sm">
              <div><div className="font-medium">{selected.task.title}</div><div className="text-gray-400">{selected.task.status} • {selected.task.id}</div></div>
              {selected.task.result_summary && <div className="text-emerald-200">{selected.task.result_summary}</div>}
              {selected.task.error_message && <div className="text-rose-200">Error: {selected.task.error_message}</div>}
              <div>
                <div className="text-gray-300 mb-1">Steps</div>
                <div className="space-y-2">{selected.steps.map((s:any)=> <div key={s.id} className="rounded border border-border bg-surface2 p-2"><div className="flex justify-between"><span>{s.step_index}. {s.name}</span><span className="text-xs text-gray-400">{s.status}</span></div>{s.output?.approval_id && <div className="text-xs text-amber-300 mt-1">Awaiting approval: {s.output.approval_id}</div>}{s.error_message && <div className="text-xs text-rose-300 mt-1">{s.error_message}</div>}</div>)}</div>
              </div>
              <div>
                <div className="text-gray-300 mb-1">Execution Logs</div>
                <div className="max-h-56 overflow-auto space-y-1 text-xs text-gray-400">{selected.logs.map((l:any)=> <div key={l.id}>[{l.level}] {l.event_type}: {l.message}</div>)}</div>
              </div>
              <button className="btn-secondary text-xs" onClick={()=>open(selected.task.id)}>Refresh</button>
            </div>
          )}
        </div>
      </div>
      <p className="text-xs text-gray-500">Agent loop: PLAN→VALIDATE PERMISSIONS→EXECUTE→VERIFY→UPDATE STATE→REPORT. Uses mock AI provider and simulated tool execution (no unauthorized external side effects). Max steps/timeouts/retry limits and approval gates enforced.</p>
    </div>
  )
}
