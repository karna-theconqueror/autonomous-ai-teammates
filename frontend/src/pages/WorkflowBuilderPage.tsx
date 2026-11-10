import { useEffect, useState } from 'react'
import { api, type Workflow } from '../lib/api'

export function WorkflowBuilderPage() {
  const [items, setItems] = useState<Workflow[]>([])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [err, setErr] = useState('')
  const load = async ()=>{ try{ setItems((await api.listWorkflows()).workflows) }catch(e:any){ setErr(e.message)} }
  useEffect(()=>{ load() }, [])
  async function create(e: React.FormEvent){ e.preventDefault(); try{ await api.createWorkflow({ name, description, definition: { steps: [] }, status: 'draft' }); setName(''); setDescription(''); await load() }catch(e:any){ setErr(e.message)} }
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Workflow Builder</h1>
      {err && <div className="text-rose-200 text-sm">{err}</div>}
      <form onSubmit={create} className="card-surface p-4 grid md:grid-cols-3 gap-3 items-end">
        <label className="text-sm"><span className="text-gray-300">Name</span><input className="mt-1 w-full rounded-lg border border-border bg-surface2 px-3 py-2" required value={name} onChange={e=>setName(e.target.value)} /></label>
        <label className="text-sm md:col-span-1"><span className="text-gray-300">Description</span><input className="mt-1 w-full rounded-lg border border-border bg-surface2 px-3 py-2" value={description} onChange={e=>setDescription(e.target.value)} /></label>
        <button className="btn-primary">Create Workflow</button>
      </form>
      <div className="grid md:grid-cols-2 gap-4">
        {items.length===0 ? <div className="card-surface p-6 text-gray-400">No workflows yet.</div> : items.map(w=> (
          <div key={w.id} className="card-surface p-4"><div className="flex justify-between"><div className="font-medium">{w.name}</div><span className="text-xs text-gray-400">{w.status}</span></div><p className="text-sm text-gray-400 mt-1">{w.description||'No description'}</p><pre className="text-xs mt-2 text-gray-500 overflow-auto">{JSON.stringify(w.definition)}</pre></div>
        ))}
      </div>
    </div>
  )
}
